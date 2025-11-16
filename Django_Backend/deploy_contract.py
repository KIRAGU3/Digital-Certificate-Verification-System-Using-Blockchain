#!/usr/bin/env python
"""
Deploy the CertificateVerification smart contract
"""
import os
import sys
import json
from web3 import Web3

# Connect to local blockchain
web3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))

if not web3.is_connected():
    print("❌ Failed to connect to blockchain at http://127.0.0.1:8545")
    sys.exit(1)

print(f"✅ Connected to blockchain")
print(f"   Chain ID: {web3.eth.chain_id}")
print(f"   Block: {web3.eth.block_number}")

# Get account
account = web3.eth.accounts[0]
balance = web3.eth.get_balance(account)
print(f"   Account: {account}")
print(f"   Balance: {balance / 1e18:.2f} ETH")

# Load contract ABI and bytecode
contract_json_path = os.path.join(os.path.dirname(__file__), 'certificate-verification-system', 'build', 'contracts', 'CertificateVerification.json')

if not os.path.exists(contract_json_path):
    print(f"\n❌ Contract artifact not found at: {contract_json_path}")
    print(f"\nTrying alternative paths...")
    
    # Try to find it
    possible_paths = [
        r'c:\certificate-verification-system\certificate-verification-system\build\contracts\CertificateVerification.json',
        r'./certificate-verification-system/build/contracts/CertificateVerification.json',
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            contract_json_path = path
            print(f"✅ Found at: {path}")
            break
    else:
        print("❌ Could not find contract artifact")
        sys.exit(1)

print(f"\n📄 Loading contract from: {contract_json_path}")

with open(contract_json_path, 'r') as f:
    artifact = json.load(f)

contract_abi = artifact['abi']
contract_bytecode = artifact['bytecode']

print(f"✅ Loaded ABI and bytecode")
print(f"   ABI functions: {[func['name'] for func in contract_abi if func.get('type') == 'function']}")

# Create contract factory
Contract = web3.eth.contract(abi=contract_abi, bytecode=contract_bytecode)

# Deploy
print(f"\n🚀 Deploying contract...")

try:
    tx_hash = Contract.constructor().transact({'from': account})
    print(f"   Transaction hash: {tx_hash.hex()}")
    
    print(f"   Waiting for transaction to be mined...")
    tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    
    contract_address = tx_receipt.contractAddress
    print(f"\n✅ CONTRACT DEPLOYED SUCCESSFULLY!")
    print(f"   Contract Address: {contract_address}")
    print(f"   Block: {tx_receipt.blockNumber}")
    print(f"   Gas Used: {tx_receipt.gasUsed}")
    
    # Verify deployment
    code = web3.eth.get_code(contract_address)
    print(f"\n✅ Verification: Contract code exists ({len(code)} bytes)")
    
    # Update contract ABI file with new address
    print(f"\n📝 Updating contract_abi.json...")
    
    cert_backend_path = os.path.join(os.path.dirname(__file__), 'certificates', 'contract_abi.json')
    
    with open(cert_backend_path, 'r') as f:
        cert_artifact = json.load(f)
    
    chain_id = str(web3.eth.chain_id)
    cert_artifact['networks'][chain_id] = {'address': contract_address}
    
    with open(cert_backend_path, 'w') as f:
        json.dump(cert_artifact, f, indent=2)
    
    print(f"✅ Updated contract_abi.json")
    print(f"   Chain ID: {chain_id}")
    print(f"   Address: {contract_address}")
    
    # Update .env file
    print(f"\n📝 Updating .env file...")
    
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    with open(env_path, 'r') as f:
        env_content = f.read()
    
    # Replace CONTRACT_ADDRESS
    import re
    env_content = re.sub(
        r'CONTRACT_ADDRESS=0x[0-9a-fA-F]+',
        f'CONTRACT_ADDRESS={contract_address}',
        env_content
    )
    
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print(f"✅ Updated .env file")
    
    print(f"\n" + "="*80)
    print("✅ DEPLOYMENT COMPLETE!")
    print("="*80)
    print(f"\nNow you can:")
    print(f"1. Restart the Django server")
    print(f"2. Try issuing a new certificate")
    print(f"3. Verify the certificate")
    
except Exception as e:
    print(f"\n❌ Deployment failed: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
