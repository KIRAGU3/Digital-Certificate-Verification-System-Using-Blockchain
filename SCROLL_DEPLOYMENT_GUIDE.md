# CEVERSYS Scroll zkEVM Deployment Guide

Complete guide for deploying CEVERSYS with Scroll testnet integration and NFT rewards system.

---

## 📋 Prerequisites

### Required Software
- Node.js v16+ and npm
- Python 3.9+
- Truffle v5.11+
- MetaMask browser extension
- Git

### Required Accounts
- MetaMask wallet with private key
- Scroll Sepolia testnet ETH (get from [Scroll Faucet](https://sepolia.scroll.io/faucet))
- Infura account (optional, for alternative RPC)

---

## 🚀 Phase 1: Smart Contract Deployment

### Step 1: Setup Blockchain Environment

```bash
cd certificate-verification-system
npm install
```

### Step 2: Configure Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Your wallet private key (NEVER commit this!)
PRIVATE_KEY=your_private_key_here
SCROLL_PRIVATE_KEY=your_private_key_here

# Optional: Infura for redundancy
INFURA_PROJECT_ID=your_infura_id

# Optional: For contract verification
SCROLLSCAN_API_KEY=your_scrollscan_api_key
```

### Step 3: Test Locally (Optional)

Start Ganache:
```bash
npx ganache --deterministic
```

Deploy to Ganache:
```bash
truffle migrate --network development
```

### Step 4: Deploy to Scroll Sepolia

```bash
truffle migrate --network scroll_sepolia
```

**Expected Output:**
```
Deploying 'CertificateVerification'
   > transaction hash:    0x...
   > contract address:    0x...
   > block number:        ...

Deploying 'NFTReward'
   > transaction hash:    0x...
   > contract address:    0x...
   > block number:        ...
```

**Save these contract addresses!**

### Step 5: Extract Contract ABIs

```bash
# Extract CertificateVerification ABI
cat build/contracts/CertificateVerification.json > ../Django_Backend/certificates/contract_abi.json

# Extract NFTReward ABI
cat build/contracts/NFTReward.json > ../Django_Backend/certificates/nft_reward_abi.json
```

---

## 🐍 Phase 2: Django Backend Setup

### Step 1: Setup Python Environment

```bash
cd ../Django_Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

If `requirements.txt` is missing, install:
```bash
pip install django djangorestframework django-cors-headers web3 python-dotenv pillow
```

### Step 2: Configure Django Settings

Create `.env` file in `Django_Backend/`:

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (optional: use PostgreSQL in production)
DATABASE_URL=sqlite:///db.sqlite3

# Blockchain Configuration
BLOCKCHAIN_URL=https://sepolia-rpc.scroll.io
CONTRACT_ADDRESS=0x...  # Your CertificateVerification contract address
NFT_REWARD_CONTRACT_ADDRESS=0x...  # Your NFTReward contract address

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# NFT Metadata
NFT_METADATA_BASE_URL=https://ceversys.com/nft-metadata
```

Update `settings.py` to include new reward models:

```python
INSTALLED_APPS = [
    # ... existing apps
    'certificates',
]

# Add at bottom
BLOCKCHAIN_URL = os.getenv('BLOCKCHAIN_URL', 'http://127.0.0.1:8545')
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
NFT_REWARD_CONTRACT_ADDRESS = os.getenv('NFT_REWARD_CONTRACT_ADDRESS')
NFT_METADATA_BASE_URL = os.getenv('NFT_METADATA_BASE_URL', 'https://ceversys.com/nft-metadata')
```

### Step 3: Setup Database

```bash
# Create migrations for new reward models
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Step 4: Test Backend

```bash
python manage.py runserver
```

Test rewards API:
```bash
# Check leaderboard
curl http://localhost:8000/api/rewards/leaderboard/

# Check institution stats (replace with actual wallet address)
curl http://localhost:8000/api/rewards/institutions/0x.../stats/
```

---

## ⚛️ Phase 3: React Frontend Setup

### Step 1: Install Dependencies

```bash
cd ../certificate-verification-frontend
npm install
```

This will install ethers.js v6 and axios for Web3 interactions.

### Step 2: Configure Environment

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SCROLL_RPC_URL=https://sepolia-rpc.scroll.io
REACT_APP_CHAIN_ID=534351
REACT_APP_NETWORK_NAME=Scroll Sepolia
```

### Step 3: Test Frontend

```bash
npm start
```

Visit `http://localhost:3000`

**Test Features:**
1. Connect MetaMask wallet
2. Switch to Scroll Sepolia
3. Navigate to `/rewards` page
4. View leaderboard
5. Issue a certificate (if you have issuer role)

---

## 🎯 Phase 4: Complete Integration Testing

### Test Workflow

1. **Connect Wallet**
   - Open app, click "Connect Wallet"
   - Approve MetaMask connection
   - Confirm network switch to Scroll Sepolia

2. **Issue Certificate**
   - Go to "Issue Certificate" page
   - Fill in student details
   - Upload PDF
   - Submit transaction
   - Confirm in MetaMask
   - Wait for blockchain confirmation
   - Check rewards dashboard for updated points

3. **Check Rewards**
   - Navigate to `/rewards`
   - View your reward points
   - Check progress to next milestone
   - View earned NFT badges

4. **Verify Certificate**
   - Go to "Verify Certificate"
   - Enter certificate hash
   - Confirm blockchain verification

5. **View Leaderboard**
   - Navigate to Leaderboard tab
   - See global rankings
   - Compare with other institutions

---

## 📊 Milestone Configuration

The system awards NFT badges at these milestones:

| Milestone | Tier | Points Bonus | NFT Badge |
|-----------|------|--------------|-----------|
| 10 certs  | Bronze | 100 | 🥉 Bronze Badge |
| 50 certs  | Silver | 500 | 🥈 Silver Badge |
| 100 certs | Gold | 1000 | 🥇 Gold Badge |
| 250 certs | Platinum | 2500 | 💎 Platinum Badge |
| 500 certs | Diamond | 5000 | 💠 Diamond Badge |

**Base Rewards:**
- +10 points per certificate issued
- Bonus points at each milestone
- NFT badge minted automatically at milestones

---

## 🔒 Security Considerations

### Smart Contracts
- Contracts use OpenZeppelin standards
- Only issuers can revoke their own certificates
- NFT minting restricted to contract owner (backend)

### Backend
- CORS configured for frontend origin
- Private keys stored in `.env` (never committed)
- RLS policies for future database security

### Frontend
- Web3 transactions require MetaMask approval
- All blockchain interactions are read-only except issuance
- User controls their own wallet keys

---

## 🐛 Troubleshooting

### "Failed to connect to blockchain"
- Check `BLOCKCHAIN_URL` in Django `.env`
- Verify Scroll Sepolia RPC is accessible
- Try alternative RPC: `https://scroll-sepolia.blockpi.network/v1/rpc/public`

### "Transaction Failed"
- Ensure wallet has enough Scroll Sepolia ETH
- Check gas price settings in Truffle config
- Verify contract addresses are correct

### "MetaMask not detected"
- Install MetaMask extension
- Refresh page after installation
- Check browser console for errors

### "Network mismatch"
- Click "Switch to Scroll" button in app
- Manually add Scroll Sepolia in MetaMask:
  - Network Name: Scroll Sepolia
  - RPC URL: https://sepolia-rpc.scroll.io
  - Chain ID: 534351
  - Currency: ETH
  - Explorer: https://sepolia.scrollscan.com

### "NFT not minting"
- Check backend logs for errors
- Verify `NFT_REWARD_CONTRACT_ADDRESS` is set
- Ensure backend wallet has ETH for gas
- Check milestone hasn't been claimed already

---

## 📦 Production Deployment

### Smart Contracts

**For Scroll Mainnet:**
```bash
truffle migrate --network scroll_mainnet
```

Update `.env` with mainnet addresses and RPC.

### Django Backend

**Recommended: Deploy to Railway/Render/DigitalOcean**

1. Set environment variables on platform
2. Use PostgreSQL database
3. Configure ALLOWED_HOSTS
4. Set DEBUG=False
5. Collect static files: `python manage.py collectstatic`
6. Run migrations: `python manage.py migrate`

### React Frontend

**Deploy to Netlify/Vercel:**

```bash
npm run build
```

Set environment variables:
```
REACT_APP_API_URL=https://your-backend.com
REACT_APP_CHAIN_ID=534352  # Mainnet
```

---

## 📖 API Endpoints

### Certificates
- `POST /api/issue/` - Issue certificate
- `GET /api/verify/<hash>/` - Verify certificate
- `POST /api/revoke/<hash>/` - Revoke certificate

### Rewards
- `GET /api/rewards/leaderboard/` - Global leaderboard
- `GET /api/rewards/institutions/<wallet>/stats/` - Institution stats
- `GET /api/rewards/institutions/<wallet>/badges/` - NFT badges
- `POST /api/rewards/register-issuance/` - Register cert issuance
- `GET /api/rewards/check-milestone/` - Check milestone eligibility

---

## 🎓 Hackathon Demo Script

### 1. Introduction (2 min)
- Show homepage
- Explain CEVERSYS mission
- Highlight Scroll integration benefits (zkEVM, lower fees)

### 2. Smart Contract Demo (3 min)
- Show Scrollscan with deployed contracts
- Explain NFT reward mechanism
- Show milestone tier system

### 3. Live Certificate Issuance (5 min)
- Connect wallet to Scroll Sepolia
- Issue sample certificate
- Show blockchain transaction
- Display reward points update
- Show progress to next milestone

### 4. Rewards Dashboard (3 min)
- Navigate to rewards page
- Show earned badges
- Display NFT metadata
- Explain point system

### 5. Leaderboard & Competition (2 min)
- Show global rankings
- Highlight gamification aspect
- Discuss institutional adoption

### 6. Technical Architecture (3 min)
- Smart contracts on Scroll zkEVM
- Django backend for reward logic
- React frontend with Web3 integration
- Future roadmap

---

## 🚢 Next Steps

### Phase 5: Advanced Features
- [ ] IPFS integration for NFT metadata
- [ ] Token-gated certificate access
- [ ] Cross-chain bridge support
- [ ] DAO governance for verification standards
- [ ] ERC20 token rewards ($CEVERSYS)
- [ ] Staking mechanism for validators
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

### Phase 6: Ecosystem Growth
- [ ] Partner with universities
- [ ] Integrate with LinkedIn
- [ ] Corporate API for HR verification
- [ ] Educational institution onboarding
- [ ] Batch certificate issuance
- [ ] Template management system

---

## 📞 Support & Resources

### Scroll Resources
- [Scroll Docs](https://docs.scroll.io)
- [Scroll Faucet](https://sepolia.scroll.io/faucet)
- [Scrollscan Explorer](https://sepolia.scrollscan.com)
- [Scroll Discord](https://discord.gg/scroll)

### CEVERSYS Team
- GitHub: [KIRAGU3/certificate-verification-system](https://github.com/KIRAGU3/certificate-verification-system)
- Lead Developer: David Kiragu

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Smart contracts tested on Ganache
- [ ] Smart contracts deployed to Scroll Sepolia
- [ ] Contract addresses saved
- [ ] ABIs extracted and placed in Django
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] Database migrations applied
- [ ] Superuser created

### Testing
- [ ] Wallet connection works
- [ ] Network switching works
- [ ] Certificate issuance works
- [ ] Blockchain verification works
- [ ] Reward points accumulate
- [ ] NFT minting at milestones
- [ ] Leaderboard displays correctly
- [ ] All API endpoints respond

### Production Ready
- [ ] Smart contracts on Scroll Mainnet
- [ ] Backend on production server
- [ ] Frontend on CDN
- [ ] Environment variables secured
- [ ] SSL certificates configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Documentation complete

---

**Congratulations! Your CEVERSYS Scroll integration is complete! 🎉**

For questions or issues, please open a GitHub issue or contact the development team.
