import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
django.setup()

from certificates.blockchain import get_web3
from web3 import Web3
from django.conf import settings

web3 = get_web3()
contract_address = settings.CONTRACT_ADDRESS.strip()

print(f"Contract Address: {contract_address}")
print(f"Address checksum: {Web3.to_checksum_address(contract_address)}")

# Check if there's code at this address
code = web3.eth.get_code(contract_address)
print(f"\nCode at address: {'✅ YES - Contract deployed' if code != '0x' else '❌ NO - No contract'}")
print(f"Code length: {len(code)} bytes")

# List recent blocks to see transactions
print(f"\nRecent transactions:")
block_num = web3.eth.block_number
for i in range(max(0, block_num - 5), block_num + 1):
    block = web3.eth.get_block(i)
    print(f"Block {i}: {len(block['transactions'])} transactions")
