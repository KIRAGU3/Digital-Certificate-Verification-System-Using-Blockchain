#!/usr/bin/env python
"""
Check contract deployment and code
"""
import os
import sys
import django
from web3 import Web3

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
django.setup()

from certificates.blockchain import web3, CONTRACT_ADDRESS

if not web3:
    print("❌ Web3 not connected")
    sys.exit(1)

print("\n" + "="*80)
print("  CONTRACT DEPLOYMENT CHECK")
print("="*80)

print(f"\n📍 Contract Address: {CONTRACT_ADDRESS}")

# Check if code is deployed at this address
code = web3.eth.get_code(CONTRACT_ADDRESS)
print(f"\n🔍 Code at address: {len(code)} bytes")

if code == b'\x00' or len(code) == 0:
    print("❌ NO CONTRACT CODE AT THIS ADDRESS!")
    print("   The contract is either not deployed or deployed at a different address!")
else:
    print(f"✅ Contract code exists: {code.hex()[:100]}...")

# List all accounts
print(f"\n👤 Available accounts:")
accounts = web3.eth.accounts
for i, account in enumerate(accounts[:3]):
    balance = web3.eth.get_balance(account)
    print(f"  {i}: {account} (balance: {balance / 1e18:.2f} ETH)")

# Check block number
print(f"\n📦 Blockchain state:")
print(f"  Current block: {web3.eth.block_number}")
print(f"  Chain ID: {web3.eth.chain_id}")
print(f"  Is connected: {web3.is_connected()}")

# Try to find the correct contract address from the ABI file
print(f"\n📄 Checking contract_abi.json for deployment addresses:")

import json
current_dir = os.path.dirname(os.path.abspath(__file__))
contract_json_path = os.path.join(current_dir, 'certificates', 'contract_abi.json')

try:
    with open(contract_json_path, 'r') as f:
        artifact = json.load(f)
    
    networks = artifact.get('networks', {})
    print(f"\n  Networks in artifact: {list(networks.keys())}")
    
    for net_id, net_data in networks.items():
        addr = net_data.get('address', 'N/A')
        print(f"    Network {net_id}: {addr}")
        
        # Check if code exists at each address
        try:
            code_at_addr = web3.eth.get_code(addr)
            has_code = "✅ has code" if len(code_at_addr) > 0 else "❌ no code"
            print(f"              {has_code}")
        except:
            print(f"              (error checking)")
    
    # Get current network ID
    network_id = str(web3.eth.chain_id)
    print(f"\n  Current Chain ID: {network_id}")
    
    if network_id in networks:
        print(f"  ✅ Found deployment for this network!")
    else:
        print(f"  ❌ No deployment found for chain ID {network_id}")
        print(f"  Available chain IDs: {list(networks.keys())}")
        
except Exception as e:
    print(f"  Error reading artifact: {e}")
