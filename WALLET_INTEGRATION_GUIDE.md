# CEVERSYS Wallet Integration Guide

## Overview

Complete guide for MetaMask wallet integration with Scroll Sepolia testnet, including wallet address storage and balance display.

---

## 🔌 Wallet Connection Features

### 1. MetaMask Integration
- **Chain ID:** 534351 (Scroll Sepolia)
- **RPC Endpoint:** https://sepolia-rpc.scroll.io
- **Auto-detection:** Automatically detects and prompts network switching
- **Persistent connection:** Wallet stays connected across page refreshes

### 2. Wallet Display
- ✅ Full Scroll address display
- ✅ Real-time ETH balance (updates every 30 seconds)
- ✅ Network status indicator
- ✅ Chain ID and RPC display
- ✅ Copy address functionality
- ✅ Disconnect option

### 3. Backend Storage
- ✅ Wallet addresses stored in Django database
- ✅ Linked to institution rewards
- ✅ Traceability for certificate issuers
- ✅ NFT recipient tracking

---

## 🚀 Implementation Details

### Frontend Components

#### WalletConnect.js
**Location:** `certificate-verification-frontend/src/components/WalletConnect.js`

**Features:**
```javascript
// Props
<WalletConnect
  compact={false}      // Use card layout
  showBalance={true}   // Display ETH balance
/>
```

**Displays:**
- Full wallet address (0x...)
- Real-time balance in ETH
- Network name and chain ID
- RPC endpoint for verification
- Connection status

**Balance Updates:**
- Fetches balance on connect
- Auto-refreshes every 30 seconds
- Uses ethers.js `getBalance()` method

#### Web3Context.js
**Location:** `certificate-verification-frontend/src/contexts/Web3Context.js`

**Provides:**
```javascript
const {
  account,           // Connected wallet address
  provider,          // Ethers.js provider
  signer,           // Ethers.js signer
  chainId,          // Current chain ID
  isScrollNetwork,  // Boolean: on Scroll?
  isConnecting,     // Loading state
  error,            // Error messages
  connectWallet,    // Connect function
  disconnectWallet, // Disconnect function
  switchToScrollNetwork // Network switcher
} = useWeb3();
```

#### walletService.js
**Location:** `certificate-verification-frontend/src/services/walletService.js`

**Methods:**
- `registerWallet(address, name)` - Register wallet in Django
- `getWalletInfo(address)` - Fetch wallet stats
- `updateWalletName(address, name)` - Update institution name
- `formatAddress(address)` - Format for display
- `validateAddress(address)` - Validate Ethereum address

### Backend Integration

#### Django Endpoint: Register Wallet
**URL:** `POST /api/rewards/register-wallet/`

**Request:**
```json
{
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "institution_name": "Tech University"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet registered successfully",
  "institution": {
    "wallet_address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "institution_name": "Tech University",
    "total_certificates": 0,
    "reward_points": 0,
    "current_tier": "BRONZE"
  }
}
```

**Auto-registration:**
- Wallet registered on first certificate issuance
- Institution name can be updated later
- Lowercase storage for consistency

#### Database Schema

**InstitutionReward Model:**
```python
wallet_address = CharField(max_length=42, unique=True, indexed=True)
institution_name = CharField(max_length=255)
total_certificates_issued = IntegerField()
reward_points = IntegerField()
current_tier = CharField()
```

**Index on wallet_address** for fast lookups.

---

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SCROLL_RPC_URL=https://sepolia-rpc.scroll.io
REACT_APP_CHAIN_ID=534351
REACT_APP_NETWORK_NAME=Scroll Sepolia
```

**Backend (.env):**
```env
BLOCKCHAIN_URL=https://sepolia-rpc.scroll.io
CONTRACT_ADDRESS=0xYourCertificateContractAddress
NFT_REWARD_CONTRACT_ADDRESS=0xYourNFTRewardAddress
```

### Network Configuration

**scroll-networks.js:**
```javascript
export const SCROLL_NETWORKS = {
  SCROLL_SEPOLIA: {
    chainId: '0x8274F',        // 534351 in decimal
    chainIdDecimal: 534351,
    chainName: 'Scroll Sepolia Testnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia-rpc.scroll.io'],
    blockExplorerUrls: ['https://sepolia.scrollscan.com']
  }
};
```

---

## 📊 User Flow

### 1. Initial Connection
```
User clicks "Connect Wallet"
    ↓
MetaMask prompts for permission
    ↓
User approves
    ↓
Check current network
    ↓
If not Scroll Sepolia:
    → Prompt to switch network
    → Add network if not present
    ↓
Wallet connected
    ↓
Fetch ETH balance
    ↓
Display wallet info on dashboard
```

### 2. Certificate Issuance with Wallet
```
User fills certificate form
    ↓
User submits
    ↓
Frontend sends request with wallet_address
    ↓
Django receives request
    ↓
Certificate issued on blockchain
    ↓
Wallet registered/updated in database
    ↓
Reward points calculated
    ↓
Response includes wallet info + rewards
```

### 3. Balance Display
```
Wallet connected
    ↓
Fetch balance using ethers.js:
    provider.getBalance(account)
    ↓
Convert from Wei to ETH:
    ethers.formatEther(balanceWei)
    ↓
Display: "X.XXXX ETH"
    ↓
Auto-refresh every 30 seconds
```

---

## 🎨 UI Components

### Dashboard Wallet Card

```jsx
<Card elevation={2}>
  <CardContent>
    {/* Header */}
    <Typography variant="h6">
      <AccountBalanceWallet /> Wallet Connected
    </Typography>

    {/* Address */}
    <Typography variant="body2" color="text.secondary">
      Scroll Address
    </Typography>
    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
      0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
    </Typography>

    {/* Balance */}
    <Typography variant="body2" color="text.secondary">
      Balance
    </Typography>
    <Typography variant="h6">
      <AccountBalance /> 0.5234 ETH
    </Typography>

    {/* Network */}
    <Chip
      icon={<CheckCircle />}
      label="Scroll Sepolia"
      color="success"
    />
    <Typography variant="caption">
      Chain ID: 534351 | RPC: https://sepolia-rpc.scroll.io
    </Typography>
  </CardContent>
</Card>
```

---

## 🔐 Security Considerations

### Frontend
1. **Never store private keys** - MetaMask handles key management
2. **Validate addresses** - Use ethers.js address validation
3. **HTTPS only** - Enforce secure connections in production
4. **User approval required** - All transactions need MetaMask confirmation

### Backend
1. **Lowercase storage** - Store addresses in lowercase for consistency
2. **Input validation** - Validate Ethereum address format (0x + 40 hex chars)
3. **Rate limiting** - Prevent wallet registration spam
4. **CORS configured** - Allow only frontend origin

### Database
1. **Indexed wallet_address** - Fast lookups
2. **Unique constraint** - Prevent duplicate registrations
3. **Foreign key integrity** - Link to certificates and rewards

---

## 🧪 Testing Checklist

### Frontend Tests
- [ ] Wallet connects to Scroll Sepolia
- [ ] Balance displays correctly
- [ ] Balance updates every 30 seconds
- [ ] Address copies to clipboard
- [ ] Network switching works
- [ ] Disconnect clears state
- [ ] Auto-reconnect on page refresh

### Backend Tests
- [ ] Wallet registration endpoint works
- [ ] Duplicate registration returns existing record
- [ ] Wallet address stored in lowercase
- [ ] Institution name updatable
- [ ] Wallet linked to certificates
- [ ] Reward points tracked per wallet

### Integration Tests
- [ ] Certificate issuance with wallet
- [ ] Rewards calculated correctly
- [ ] NFT badges linked to wallet
- [ ] Leaderboard shows correct wallet data
- [ ] Dashboard displays wallet balance

---

## 🐛 Troubleshooting

### Issue: "MetaMask not detected"
**Solution:**
- Install MetaMask extension
- Refresh page after installation
- Check browser compatibility

### Issue: "Wrong network"
**Solution:**
- Click "Switch to Scroll Sepolia" button
- Manually add network in MetaMask if needed
- Verify RPC endpoint is accessible

### Issue: "Balance not loading"
**Solution:**
- Check RPC endpoint connectivity
- Verify wallet has transactions (not a brand new address)
- Check browser console for errors
- Try disconnecting and reconnecting

### Issue: "Transaction failed"
**Solution:**
- Ensure sufficient ETH balance for gas
- Get testnet ETH from faucet
- Check gas price settings
- Verify contract addresses are correct

### Issue: "Wallet not registering in backend"
**Solution:**
- Check Django server is running
- Verify API endpoint URL is correct
- Check CORS settings allow frontend origin
- Look at Django logs for errors

---

## 📝 API Endpoints Reference

### Wallet Management

```bash
# Register Wallet
POST /api/rewards/register-wallet/
Content-Type: application/json

{
  "wallet_address": "0x...",
  "institution_name": "University Name"
}

# Get Wallet Stats
GET /api/rewards/institutions/<wallet_address>/stats/

# Update Institution Name
PATCH /api/rewards/institutions/<wallet_address>/
Content-Type: application/json

{
  "institution_name": "New Institution Name"
}
```

### Certificate Issuance with Wallet

```bash
POST /api/issue/
Content-Type: multipart/form-data

studentName: John Doe
course: Blockchain Development
institution: Tech University
issueDate: 2024-10-26
walletAddress: 0x...  # Wallet address of issuer
certificatePdf: <file>
```

---

## 🎯 Best Practices

### For Users
1. Always verify you're on Scroll Sepolia (Chain ID: 534351)
2. Keep some testnet ETH for gas fees
3. Bookmark the application for easy access
4. Save your wallet address for future reference

### For Developers
1. Always validate wallet addresses before database operations
2. Store addresses in lowercase for consistency
3. Implement proper error handling for MetaMask interactions
4. Use event listeners for account/network changes
5. Provide clear user feedback during transactions
6. Log wallet activities for debugging

### For Institutions
1. Register your wallet address before issuing certificates
2. Keep track of your reward points and tier
3. Monitor your institution name for accuracy
4. Compete on the leaderboard for visibility

---

## 📚 Code Examples

### Connecting Wallet in a Component

```javascript
import { useWeb3 } from '../contexts/Web3Context';

function MyComponent() {
  const { account, connectWallet, isScrollNetwork } = useWeb3();

  const handleConnect = async () => {
    const success = await connectWallet();
    if (success && !isScrollNetwork) {
      alert('Please switch to Scroll Sepolia');
    }
  };

  return (
    <div>
      {account ? (
        <p>Connected: {account}</p>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### Fetching Balance

```javascript
import { ethers } from 'ethers';

async function getBalance(provider, address) {
  try {
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);
    return balanceEth;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return null;
  }
}
```

### Registering Wallet on Backend

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import InstitutionReward

@api_view(['POST'])
def register_wallet(request):
    wallet_address = request.data.get('wallet_address').lower()
    institution_name = request.data.get('institution_name')

    institution, created = InstitutionReward.objects.get_or_create(
        wallet_address=wallet_address,
        defaults={'institution_name': institution_name}
    )

    return Response({
        'success': True,
        'created': created,
        'institution': InstitutionRewardSerializer(institution).data
    })
```

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Multi-wallet support
- [ ] ENS name resolution
- [ ] Transaction history display
- [ ] Gas price estimation
- [ ] Wallet QR code generation
- [ ] Push notifications for milestones
- [ ] Mobile wallet support (WalletConnect)
- [ ] Hardware wallet integration

---

## 📞 Support

For issues related to wallet integration:
1. Check this guide first
2. Review browser console for errors
3. Check MetaMask logs
4. Verify network configuration
5. Contact support with detailed error logs

**Scroll Resources:**
- Faucet: https://sepolia.scroll.io/faucet
- Explorer: https://sepolia.scrollscan.com
- Docs: https://docs.scroll.io

---

**Version:** 1.0
**Last Updated:** October 2024
**Maintainer:** CEVERSYS Team
