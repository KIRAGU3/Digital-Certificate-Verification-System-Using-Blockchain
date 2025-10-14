# certificates/blockchain.py

import json
import os
import sys
import time
from datetime import datetime
from web3 import Web3
from django.core.files.base import ContentFile
from django.conf import settings

# Web3 setup
from django.conf import settings

# Use settings with fallback for local development
BLOCKCHAIN_URL = getattr(settings, 'BLOCKCHAIN_URL', 'http://127.0.0.1:8545')
CONTRACT_ADDRESS = getattr(settings, 'CONTRACT_ADDRESS', '0x8356f2947591B73ef1Fe0C803014FADC5c7561Ba')  # Default to our deployed contract

class BlockchainConnectionError(Exception):
    """Raised when blockchain connection fails"""
    pass

class SmartContractError(Exception):
    """Raised when smart contract interaction fails"""
    pass

def get_web3():
    """Get Web3 instance with error handling"""
    try:
        print(f"Attempting to connect to blockchain at {BLOCKCHAIN_URL}")
        web3_instance = Web3(Web3.HTTPProvider(BLOCKCHAIN_URL))
        
        # Test the connection with retry
        retries = 3
        for attempt in range(retries):
            if web3_instance.is_connected():
                block_number = web3_instance.eth.block_number
                print(f"Connected to blockchain. Current block number: {block_number}")
                return web3_instance
            if attempt < retries - 1:
                print(f"Connection attempt {attempt + 1} failed, retrying...")
                time.sleep(1)
        
        raise BlockchainConnectionError("Could not connect to blockchain after multiple attempts")
    except Exception as e:
        print(f"Web3 connection error: {str(e)}")
        raise BlockchainConnectionError(f"Web3 initialization failed: {str(e)}")

def get_contract(web3_instance):
    """Get contract instance with error handling"""
    try:
        # Get contract address from settings or environment
        contract_address = CONTRACT_ADDRESS
        if not contract_address:
            raise SmartContractError("Contract address not configured")

        # Get contract ABI from json file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        contract_json_path = os.path.join(current_dir, 'contract_abi.json')
        
        if not os.path.exists(contract_json_path):
            raise SmartContractError(f"Contract ABI file not found at {contract_json_path}")
            
        print(f"Loading contract ABI from {contract_json_path}")
        with open(contract_json_path, 'r') as abi_file:
            artifact = json.load(abi_file)
            
        contract_abi = artifact["abi"]
        networks = artifact.get("networks", {})
        network_id = str(web3_instance.eth.chain_id)
        
        # First try to get the contract address for the current network
        network_data = networks.get(network_id)
        
        final_contract_address = contract_address  # Use the one passed from settings
        
        if network_data and network_data.get("address"):
            final_contract_address = network_data["address"]
        elif networks:
            # Fallback to the most recent deployment in any network
            most_recent_network = None
            for net_id, net_data in networks.items():
                if net_data.get("address"):
                    most_recent_network = net_id
            
            if most_recent_network:
                final_contract_address = networks[most_recent_network]["address"]
        
        final_contract_address = Web3.to_checksum_address(final_contract_address)
        print(f"Using contract address: {final_contract_address}")
        
        if not Web3.is_address(final_contract_address):
            raise SmartContractError(f"Invalid contract address: {final_contract_address}")
            
        print(f"Initializing contract at address: {final_contract_address}")
        contract = web3_instance.eth.contract(address=final_contract_address, abi=contract_abi)
        
        # Just check if the contract has the expected functions
        try:
            if (not hasattr(contract.functions, 'issueCertificate') or 
                not hasattr(contract.functions, 'verifyCertificate') or 
                not hasattr(contract.functions, 'revokeCertificate')):
                raise SmartContractError("Contract does not have the expected functions")
            print("Contract successfully initialized with all expected functions")
            print("Contract connection test successful")
        except Exception as e:
            print(f"Contract connection test failed: {str(e)}")
            raise SmartContractError("Contract is not properly deployed or initialized")
            
        return contract
    except Exception as e:
        if isinstance(e, SmartContractError):
            raise e
        raise SmartContractError(f"Contract initialization failed: {str(e)}")

# Initialize Web3
try:
    print("Initializing blockchain connection...")
    web3 = get_web3()
    print("Blockchain connection initialized successfully")
except (BlockchainConnectionError, SmartContractError) as e:
    print(f"Warning: {str(e)}")
    web3 = None

# Initialize contract lazily when needed
contract = None
def get_current_contract():
    global contract
    if web3 is None:
        raise BlockchainConnectionError("Web3 not initialized")
    contract = get_contract(web3)
    return contract

def handle_certificate_event(event):
    """Handle certificate events from the blockchain"""
    try:
        if event.event == 'CertificateIssued':
            print(f"Certificate issued on blockchain: {event.args.certHash}")
            # Update local database status
            from .models import Certificate
            Certificate.objects.filter(cert_hash=event.args.certHash).update(
                blockchain_verified=True,
                blockchain_timestamp=datetime.utcnow()
            )
        elif event.event == 'CertificateRevoked':
            print(f"Certificate revoked on blockchain: {event.args.certHash}")
            # Update local database status
            from .models import Certificate
            Certificate.objects.filter(cert_hash=event.args.certHash).update(
                is_revoked=True,
                revocation_timestamp=datetime.utcnow()
            )
    except Exception as e:
        print(f"Error handling blockchain event: {str(e)}")

def is_test_mode():
    """Check if we're running in test mode"""
    return 'test' in sys.argv

def issue_certificate(student_name, course, institution, issue_date):
    """Issue a certificate and store its hash on the blockchain"""
    if not all([student_name, course, institution, issue_date]):
        raise ValueError("All certificate fields are required")
        
    print(f"Received issue_date: {issue_date} (type: {type(issue_date)})")
    
    # Ensure issue_date is an integer timestamp
    try:
        if isinstance(issue_date, str):
            # Try to parse string date
            parsed_date = datetime.strptime(issue_date, '%Y-%m-%d')
            issue_date = int(parsed_date.timestamp())
        else:
            issue_date = int(issue_date)
            
        # Validate the timestamp
        test_date = datetime.fromtimestamp(issue_date)
        print(f"Converted date: {test_date} (timestamp: {issue_date})")
    except Exception as e:
        raise ValueError(f"Invalid date format: {str(e)}")

    # Ensure issue_date is an integer timestamp
    if not isinstance(issue_date, int):
        raise ValueError("issue_date must be a valid integer timestamp")

    # Validate the timestamp is reasonable (not in the future, not too far in the past)
    current_time = int(time.time())
    one_day_in_seconds = 24 * 60 * 60
    if issue_date > current_time + one_day_in_seconds:  # Allow for small clock differences
        raise ValueError("Issue date cannot be in the future")
    if issue_date < 946684800:  # Jan 1, 2000
        raise ValueError("Issue date seems too old (before year 2000)")
    
    try:
        # Attempt to convert timestamp back to datetime for validation
        datetime.fromtimestamp(issue_date)
    except (ValueError, TypeError, OSError) as e:
        raise ValueError(f"Invalid timestamp value: {str(e)}")

    # Generate the hash in the same way as the blockchain smart contract
    # This matches keccak256(abi.encodePacked(student_name, course, institution, issue_date)) in Solidity
    cert_hash = '0x' + Web3.solidity_keccak(
        ['string', 'string', 'string', 'uint256'],
        [student_name, course, institution, issue_date]
    ).hex()
    
    print(f"Generated certificate hash: {cert_hash}")
    
    # If we're not in test mode and blockchain is available, store on chain
    if not is_test_mode() and web3:
        try:
            print(f"Attempting to issue certificate for {student_name}, course: {course}")
            
            # Get the first account to use as sender
            account = web3.eth.accounts[0]
            if not account:
                raise SmartContractError("No blockchain account available")
            
            print(f"Using account {account} to issue certificate")
            
            # Get latest contract instance
            contract = get_current_contract()
            
            # Store certificate on blockchain with correct parameter order
            tx_hash = contract.functions.issueCertificate(
                student_name,  # string _studentName
                course,        # string _course
                institution,   # string _institution
                issue_date    # uint256 _issueDate
            ).transact({'from': account})
            
            print(f"Transaction sent with hash: {tx_hash.hex()}")
            
            # Wait for transaction to be mined
            print("Waiting for transaction to be mined...")
            tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
            
            if tx_receipt.status != 1:
                raise SmartContractError(f"Transaction failed. Receipt status: {tx_receipt.status}")
            
            # Log successful transaction
            print(f"Certificate issued successfully. Transaction hash: {tx_hash.hex()}")
            print(f"Block number: {tx_receipt.blockNumber}")
            print(f"Gas used: {tx_receipt.gasUsed}")
                
        except Exception as e:
            error_msg = str(e)
            print(f"Warning: Blockchain storage failed: {error_msg}")
            
            if "already exists" in error_msg.lower():
                raise SmartContractError("Certificate with this data already exists on the blockchain")
            elif "revert" in error_msg.lower():
                raise SmartContractError("Smart contract reverted the transaction. Possible duplicate certificate or invalid data.")
            else:
                raise SmartContractError(f"Failed to store certificate on blockchain: {error_msg}")
    
    return {
        'cert_hash': cert_hash,
        'ipfs_hash': None,  # IPFS storage is currently disabled
        'transaction_hash': tx_hash.hex() if 'tx_hash' in locals() else None
    }

def verify_certificate_on_chain(cert_hash):
    """Verify a certificate on the blockchain"""
    if not web3:
        print("Error: Web3 connection not available")
        raise BlockchainConnectionError("Web3 connection not available")
    
    # Get latest contract instance
    contract = get_current_contract()
    if not contract:
        print("Error: Smart contract not initialized")
        raise BlockchainConnectionError("Smart contract not initialized")
        
    try:
        print(f"Attempting to verify certificate hash: {cert_hash}")
        
        # Convert the hash to bytes32 format
        if cert_hash.startswith('0x'):
            cert_hash = cert_hash[2:]  # Remove '0x' prefix if present
        
        print(f"Formatted hash for verification: {cert_hash}")
            
        # Convert hex string to bytes32
        try:
            cert_hash_bytes = Web3.to_bytes(hexstr=cert_hash)
            print(f"Converted hash to bytes: {cert_hash_bytes.hex()}")
        except Exception as e:
            print(f"Error converting hash to bytes: {str(e)}")
            raise SmartContractError(f"Invalid certificate hash format: {str(e)}")
        
        # Call the contract with the properly formatted hash
        try:
            print(f"Calling contract.verifyCertificate with hash: {cert_hash_bytes.hex()}")
            result = contract.functions.verifyCertificate(cert_hash_bytes).call()
            is_valid, student_name, course, institution, issue_date = result
            
            # Log the verification details
            print(f"Blockchain verification details:")
            print(f"Is Valid: {is_valid}")
            print(f"Student: {student_name}")
            print(f"Course: {course}")
            print(f"Institution: {institution}")
            print(f"Issue Date (timestamp): {issue_date}")
            
            # Convert timestamp to datetime for validation
            try:
                date_from_chain = datetime.fromtimestamp(issue_date)
                print(f"Issue Date (converted): {date_from_chain}")
            except Exception as e:
                print(f"Date conversion error: {str(e)}")
                is_valid = False  # Mark as invalid if date is incorrect
            
            return (is_valid, student_name, course, institution, issue_date)
        except Exception as contract_error:
            error_msg = str(contract_error)
            print(f"Contract call error: {error_msg}")
            
            if "revert Certificate not found" in error_msg:
                raise SmartContractError("Certificate not found on blockchain")
            elif "revert" in error_msg:
                raise SmartContractError(f"Contract reverted: {error_msg}")
            else:
                raise SmartContractError(f"Contract call failed: {error_msg}")
    except Exception as e:
        if isinstance(e, (BlockchainConnectionError, SmartContractError)):
            raise e
            
        error_msg = str(e)
        print(f"Error during blockchain verification: {error_msg}")
        if "connection" in error_msg.lower():
            raise BlockchainConnectionError("Failed to connect to blockchain")
        
        raise SmartContractError(f"Blockchain verification failed: {error_msg}")

def revoke_certificate(cert_hash):
    """Revoke a certificate on the blockchain"""
    if not web3 or not contract:
        raise BlockchainConnectionError("Blockchain connection not available")
        
    try:
        # Get the first account to use as sender (assuming it's an admin account)
        account = web3.eth.accounts[0]
        
        # Call the smart contract's revokeCertificate function
        tx_hash = contract.functions.revokeCertificate(cert_hash).transact({'from': account})
        
        # Wait for transaction to be mined
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        if tx_receipt.status != 1:
            raise SmartContractError("Revocation transaction failed")
            
        return True
    except Exception as e:
        raise SmartContractError(f"Certificate revocation failed: {str(e)}")