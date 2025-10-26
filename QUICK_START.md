# CEVERSYS Scroll Integration - Quick Start

Fast-track setup guide for hackathon demo.

## 🚀 5-Minute Setup

### 1. Install Dependencies

```bash
# Smart Contracts
cd certificate-verification-system
npm install

# Backend
cd ../Django_Backend
pip install django djangorestframework django-cors-headers web3 python-dotenv pillow

# Frontend
cd ../certificate-verification-frontend
npm install
```

### 2. Configure Environment

**Blockchain (.env in certificate-verification-system/):**
```env
PRIVATE_KEY=your_metamask_private_key
SCROLL_PRIVATE_KEY=your_metamask_private_key
```

**Backend (.env in Django_Backend/):**
```env
SECRET_KEY=django-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
BLOCKCHAIN_URL=https://sepolia-rpc.scroll.io
CONTRACT_ADDRESS=  # Fill after deployment
NFT_REWARD_CONTRACT_ADDRESS=  # Fill after deployment
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend (.env in certificate-verification-frontend/):**
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_CHAIN_ID=534351
```

### 3. Deploy Smart Contracts

```bash
cd certificate-verification-system

# Deploy to Scroll Sepolia
truffle migrate --network scroll_sepolia

# Copy contract addresses and save them!
```

### 4. Update Backend with Contract Addresses

Edit `Django_Backend/.env`:
```env
CONTRACT_ADDRESS=0xYourCertificateContractAddress
NFT_REWARD_CONTRACT_ADDRESS=0xYourNFTRewardContractAddress
```

Copy ABIs:
```bash
# From certificate-verification-system directory
cp build/contracts/CertificateVerification.json ../Django_Backend/certificates/contract_abi.json
cp build/contracts/NFTReward.json ../Django_Backend/certificates/nft_reward_abi.json
```

### 5. Setup Database

```bash
cd ../Django_Backend
python manage.py migrate
python manage.py createsuperuser  # Optional
```

### 6. Start Services

**Terminal 1 - Backend:**
```bash
cd Django_Backend
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd certificate-verification-frontend
npm start
```

### 7. Test the System

1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Switch to Scroll Sepolia
4. Navigate to `/rewards` to see dashboard
5. Issue a certificate to test rewards

## 🎯 Demo Checklist

- [ ] MetaMask installed
- [ ] Scroll Sepolia ETH in wallet (from [faucet](https://sepolia.scroll.io/faucet))
- [ ] Contracts deployed
- [ ] Backend running
- [ ] Frontend running
- [ ] Wallet connected
- [ ] Test certificate issued
- [ ] Rewards displayed

## 🐛 Quick Fixes

**"Cannot connect to blockchain"**
```bash
# Check Django .env has correct BLOCKCHAIN_URL
BLOCKCHAIN_URL=https://sepolia-rpc.scroll.io
```

**"Contract not found"**
```bash
# Verify contract addresses in Django .env match deployment
# Check contract_abi.json and nft_reward_abi.json exist
```

**"MetaMask not detected"**
- Install MetaMask extension
- Refresh browser

**"Network mismatch"**
- Click "Switch to Scroll" in app
- Or manually add Scroll Sepolia to MetaMask

## 📊 Test Data

Use these for quick demos:

**Student Name:** Alice Johnson
**Course:** Blockchain Development Certification
**Institution:** Tech University
**Issue Date:** 2024-10-26

## 🎬 Hackathon Demo Flow

1. **Show Homepage** (30s)
2. **Connect Wallet** (30s)
3. **Issue Certificate** (2min)
4. **Show Rewards Dashboard** (1min)
5. **Show Leaderboard** (1min)
6. **Explain Architecture** (2min)

Total: ~7 minutes

## 🔗 Useful Links

- Scroll Faucet: https://sepolia.scroll.io/faucet
- Scrollscan: https://sepolia.scrollscan.com
- Full Guide: See SCROLL_DEPLOYMENT_GUIDE.md

---

**Need help?** Check SCROLL_DEPLOYMENT_GUIDE.md for detailed troubleshooting.
