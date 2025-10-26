# 🧾 CEVERSYS - Certificate Verification System on Scroll zkEVM

A **decentralized credential verification platform** built on **Scroll zkEVM**, featuring blockchain-based certificate issuance, verification, and an innovative **NFT-powered incentive system** for educational institutions.

Built with **Scroll zkEVM**, **Solidity**, **Django REST Framework**, **React.js**, and **Ethers.js v6** — ensuring **tamper-proof**, **gas-efficient**, and **easily verifiable** digital credentials with gamified rewards.

[![Scroll zkEVM](https://img.shields.io/badge/Blockchain-Scroll%20zkEVM-orange)](https://scroll.io)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.21-blue)](https://soliditylang.org/)
[![Django](https://img.shields.io/badge/Django-4.2-green)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)

---

## 🌟 What's New in v2.0

### Scroll zkEVM Integration
- ⚡ **Gas Optimization:** Lower transaction costs with zkEVM technology
- 🔒 **Enhanced Security:** Zero-knowledge proof verification
- 🚀 **Fast Finality:** Sub-second transaction confirmation
- 🌍 **Ethereum Compatibility:** Full EVM equivalence

### NFT Reward System
- 🏆 **Achievement Badges:** Earn ERC721 NFTs at milestones (10, 50, 100, 250, 500 certificates)
- 💎 **Tier System:** Bronze → Silver → Gold → Platinum → Diamond
- 📈 **Leaderboard:** Compete globally with other institutions
- ⭐ **Reward Points:** +10 points per certificate + milestone bonuses

### Enhanced Features
- 🎨 **Modern UI:** Material-UI design with dark mode
- 🔗 **Web3 Integration:** Seamless MetaMask connection
- 📊 **Analytics Dashboard:** Track rewards and progress
- 🎯 **Gamification:** Incentivize certificate issuance

---

## 🚀 Features

### Core Functionality
- ✅ **Certificate Issuance** — Issue verified certificates recorded immutably on Scroll blockchain
- 🔍 **Certificate Verification** — Verify authenticity using certificate hash
- 🧱 **Blockchain Integration** — Smart contracts deployed on Scroll zkEVM
- 🧩 **Secure Backend API** — Django REST API for certificate and reward management
- 🖥 **Modern Frontend** — React interface with Web3 wallet integration
- 🕵️ **Fraud Prevention** — Tamper-proof certificate integrity

### Reward & Incentive System
- 🎁 **Reward Points** — Earn 10 points per certificate issued
- 🏅 **Milestone NFTs** — Unlock exclusive badges at achievement tiers
- 🥇 **Global Leaderboard** — Compete with institutions worldwide
- 📊 **Progress Tracking** — Visual milestone progress indicators
- 🎯 **Achievement System** — Transparent tier progression

---

## 🧠 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              React Frontend (Material-UI)                    │
│  - Certificate Issuance/Verification UI                     │
│  - Rewards Dashboard + Leaderboard                          │
│  - Web3 Wallet Integration (MetaMask)                       │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│          Django REST API + Reward Service                    │
│  - Certificate Management                                    │
│  - Reward Point Calculation                                  │
│  - NFT Minting Orchestration                                │
│  - Event Listener for Blockchain                            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│               Scroll zkEVM (Sepolia/Mainnet)                │
│  - CertificateVerification.sol (Certificate Registry)       │
│  - NFTReward.sol (ERC721 Achievement Badges)                │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  Storage Layer                               │
│  - PostgreSQL (App Data + Rewards)                          │
│  - IPFS (Certificate PDFs - Future)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Project Structure

```
certificate-verification-system/
├── certificate-verification-system/        # Smart Contracts
│   ├── contracts/
│   │   ├── CertificateVerification.sol    # Certificate registry
│   │   └── NFTReward.sol                   # NFT badge system
│   ├── migrations/
│   │   ├── 2_deploy_contracts.js
│   │   └── 3_deploy_nft_reward.js
│   ├── truffle-config.js                   # Scroll network config
│   └── package.json
│
├── Django_Backend/                          # Backend API
│   ├── certificates/
│   │   ├── models.py                       # Certificate + Reward models
│   │   ├── views.py                        # API endpoints
│   │   ├── blockchain.py                   # Web3 integration
│   │   ├── rewards_service.py              # Reward logic
│   │   ├── rewards_views.py                # Reward API
│   │   └── rewards_models.py               # Reward data models
│   ├── certificate_backend/
│   │   └── settings.py
│   └── manage.py
│
├── certificate-verification-frontend/       # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletConnect.js            # Web3 wallet
│   │   │   ├── RewardsDashboard.js         # Rewards UI
│   │   │   └── Leaderboard.js              # Rankings
│   │   ├── contexts/
│   │   │   └── Web3Context.js              # Web3 provider
│   │   ├── config/
│   │   │   └── scroll-networks.js          # Network config
│   │   ├── pages/
│   │   │   └── RewardsPage.js
│   │   └── App.js
│   └── package.json
│
├── SCROLL_DEPLOYMENT_GUIDE.md              # Full deployment guide
├── QUICK_START.md                          # Fast setup
├── ARCHITECTURE.md                         # Technical docs
└── README.md                               # This file
```

---

## ⚙️ Prerequisites

| Tool | Version | Purpose |
|------|----------|----------|
| Node.js | ≥ 16.x | React & Truffle |
| Python | ≥ 3.9 | Django backend |
| Truffle | ≥ 5.11 | Smart contract deployment |
| MetaMask | Latest | Scroll wallet |
| PostgreSQL | 14+ | Database (SQLite for dev) |

**Blockchain Requirements:**
- MetaMask wallet with Scroll Sepolia ETH
- Get testnet ETH from [Scroll Faucet](https://sepolia.scroll.io/faucet)

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Fast Setup (Recommended)
See **[QUICK_START.md](./QUICK_START.md)** for fastest deployment path

### Option 2: Complete Setup

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/KIRAGU3/certificate-verification-system.git
cd certificate-verification-system
```

#### 2️⃣ Deploy Smart Contracts to Scroll
```bash
cd certificate-verification-system
npm install
cp .env.example .env
# Edit .env with your private key
truffle migrate --network scroll_sepolia
```

Save the contract addresses!

#### 3️⃣ Setup Django Backend
```bash
cd ../Django_Backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with contract addresses
python manage.py migrate
python manage.py runserver
```

#### 4️⃣ Setup React Frontend
```bash
cd ../certificate-verification-frontend
npm install
cp .env.example .env
# Edit .env with API URL
npm start
```

Open http://localhost:3000

---

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Fast 5-minute setup
- **[SCROLL_DEPLOYMENT_GUIDE.md](./SCROLL_DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture & technical details

---

## 🧪 API Endpoints

### Certificate Management
```bash
# Issue Certificate
POST http://localhost:8000/api/issue/
Content-Type: multipart/form-data

studentName: Jane Doe
course: Computer Science
institution: Tech University
issueDate: 2024-10-26
walletAddress: 0x...  # Your institution wallet
certificatePdf: <file>

# Verify Certificate
GET http://localhost:8000/api/verify/<cert_hash>/

# Revoke Certificate
POST http://localhost:8000/api/revoke/<cert_hash>/
```

### Rewards System
```bash
# Get Institution Stats
GET http://localhost:8000/api/rewards/institutions/<wallet_address>/stats/

# Get Leaderboard
GET http://localhost:8000/api/rewards/leaderboard/?limit=10

# Get NFT Badges
GET http://localhost:8000/api/rewards/institutions/<wallet_address>/badges/

# Check Milestone Eligibility
GET http://localhost:8000/api/rewards/check-milestone/?wallet=<address>
```

---

## 💎 Milestone & Reward Tiers

| Milestone | Tier | Points Bonus | NFT Badge |
|-----------|------|--------------|-----------|
| 10 certificates | 🥉 Bronze | 100 pts | Bronze Badge NFT |
| 50 certificates | 🥈 Silver | 500 pts | Silver Badge NFT |
| 100 certificates | 🥇 Gold | 1,000 pts | Gold Badge NFT |
| 250 certificates | 💎 Platinum | 2,500 pts | Platinum Badge NFT |
| 500 certificates | 💠 Diamond | 5,000 pts | Diamond Badge NFT |

**Base Rewards:** +10 points per certificate issued

---

## 🎮 Demo Scenarios

### Scenario 1: First Certificate Issuance
1. Connect MetaMask to Scroll Sepolia
2. Navigate to "Issue Certificate"
3. Fill in student details + upload PDF
4. Submit transaction (MetaMask approval)
5. View confirmation + initial 10 reward points

### Scenario 2: Reaching Bronze Milestone
1. Issue 10th certificate
2. Backend detects milestone
3. NFT badge automatically minted
4. Receive 100 bonus points
5. View Bronze badge in Rewards Dashboard

### Scenario 3: Leaderboard Competition
1. Navigate to Rewards → Leaderboard
2. View global rankings
3. See your position
4. Compete to reach next tier

---

## 🔧 Configuration

### Smart Contract Networks

**Scroll Sepolia (Testnet)**
- Chain ID: 534351
- RPC: https://sepolia-rpc.scroll.io
- Explorer: https://sepolia.scrollscan.com
- Faucet: https://sepolia.scroll.io/faucet

**Scroll Mainnet (Production)**
- Chain ID: 534352
- RPC: https://rpc.scroll.io
- Explorer: https://scrollscan.com

---

## 🐛 Troubleshooting

**Issue:** "Failed to connect wallet"
- Install MetaMask extension
- Refresh page after installation

**Issue:** "Wrong network"
- Click "Switch to Scroll" button
- Or manually add Scroll Sepolia to MetaMask

**Issue:** "Transaction failed"
- Ensure sufficient Scroll Sepolia ETH
- Get testnet ETH from faucet
- Check gas settings

**Issue:** "Backend not responding"
- Verify Django server is running
- Check CORS settings in Django
- Confirm API URL in frontend .env

---

## 🚀 Roadmap

### Phase 1 ✅ (Current)
- [x] Scroll zkEVM integration
- [x] NFT reward system
- [x] Leaderboard functionality
- [x] Web3 wallet integration

### Phase 2 (Q4 2024)
- [ ] IPFS integration for PDFs
- [ ] Batch certificate issuance
- [ ] Email notifications
- [ ] QR code verification

### Phase 3 (Q1 2025)
- [ ] ERC20 token ($CEVERSYS)
- [ ] Token staking for validators
- [ ] DAO governance
- [ ] Cross-chain support

### Phase 4 (Q2 2025)
- [ ] Mobile app (React Native)
- [ ] Enterprise API integrations
- [ ] AI-powered fraud detection
- [ ] LinkedIn/HR platform integration

---

## 👨‍💻 Team

**David Kiragu** — Lead Developer & Blockchain Architect
- GitHub: [@KIRAGU3](https://github.com/KIRAGU3)
- Role: Full-stack development, Smart contract architecture, Scroll integration

---

## 🏆 Hackathon Highlights

This project was enhanced for the **Scroll Hackathon** with:
- zkEVM integration for gas optimization
- NFT-based gamification system
- Institutional incentive mechanism
- Modern Web3 UX patterns

**Why Scroll?**
- Lower gas fees for certificate operations
- Zero-knowledge proof security
- Ethereum equivalence
- Growing ecosystem support

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgements

- **Scroll Team** - For zkEVM infrastructure & developer support
- **OpenZeppelin** - Smart contract standards
- **Truffle Suite** - Development framework
- **Django REST Framework** - Backend API
- **Material-UI** - React component library
- **Ethers.js** - Web3 library

---

## 📞 Support & Links

- **Documentation:** See [SCROLL_DEPLOYMENT_GUIDE.md](./SCROLL_DEPLOYMENT_GUIDE.md)
- **Issues:** [GitHub Issues](https://github.com/KIRAGU3/certificate-verification-system/issues)
- **Scroll Docs:** https://docs.scroll.io
- **Scroll Discord:** https://discord.gg/scroll

---

**Built with ❤️ on Scroll zkEVM**
