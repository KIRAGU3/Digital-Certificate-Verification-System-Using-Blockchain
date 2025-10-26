# CEVERSYS Architecture Documentation

## System Overview

CEVERSYS (Certificate Verification System) is a decentralized credential verification platform built on Scroll zkEVM, featuring blockchain-based certificate issuance, verification, and an NFT-powered incentive system for educational institutions.

---

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  React + Material-UI + Ethers.js + Web3 Context           │
│  - Certificate Issuance UI                                  │
│  - Verification Interface                                   │
│  - Rewards Dashboard                                        │
│  - Wallet Connection (MetaMask)                            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     Backend Layer                           │
│  Django REST Framework + Web3.py                           │
│  - Certificate Management API                               │
│  - Reward Service Logic                                     │
│  - Blockchain Event Listener                                │
│  - NFT Minting Orchestration                               │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Blockchain Layer                          │
│  Scroll zkEVM (Sepolia Testnet / Mainnet)                 │
│  - CertificateVerification.sol (Certificate Registry)      │
│  - NFTReward.sol (ERC721 Achievement Badges)               │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Storage Layer                             │
│  - PostgreSQL (Application Data)                           │
│  - IPFS (Certificate PDF Storage - Future)                 │
│  - NFT Metadata (On-chain/IPFS)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Details

### 1. Smart Contracts (Solidity)

#### CertificateVerification.sol

**Purpose:** Core certificate registry on Scroll blockchain

**Key Features:**
- Certificate issuance with tamper-proof hashing
- On-chain verification
- Revocation mechanism (issuer-only)
- Institution tracking and statistics
- Event emission for off-chain indexing

**Data Structure:**
```solidity
struct Certificate {
    string studentName;
    string course;
    string institution;
    uint256 issueDate;
    bool isValid;
    address issuer;
}
```

**Key Functions:**
- `issueCertificate()` - Creates new certificate
- `verifyCertificate()` - Returns certificate details
- `revokeCertificate()` - Marks certificate invalid
- `getInstitutionCertificateCount()` - Tracks issuance stats

**Events:**
```solidity
event CertificateIssued(
    bytes32 indexed certHash,
    string studentName,
    string course,
    string institution,
    uint256 issueDate,
    address indexed issuer
);
```

#### NFTReward.sol

**Purpose:** ERC721 achievement badges for institutions

**Key Features:**
- Milestone-based NFT minting
- Tier-based badge system (Bronze → Diamond)
- Metadata storage for achievements
- Non-transferable badges (soulbound concept)
- Institution badge history tracking

**Tier System:**
```solidity
enum AchievementTier {
    BRONZE,    // 10 certificates
    SILVER,    // 50 certificates
    GOLD,      // 100 certificates
    PLATINUM,  // 250 certificates
    DIAMOND    // 500 certificates
}
```

**Key Functions:**
- `mintBadge()` - Issues NFT badge (owner-only)
- `getBadgeDetails()` - Returns badge metadata
- `getInstitutionBadges()` - Lists all badges for address
- `hasTierBadge()` - Checks if tier unlocked

**Security:**
- OpenZeppelin ERC721 standard
- Ownable pattern (only backend can mint)
- One badge per tier per institution

---

### 2. Django Backend

#### Models

**Certificate** (Original)
```python
- student_name: CharField
- course: CharField
- institution: CharField
- issue_date: DateTimeField
- cert_hash: CharField (unique, indexed)
- certificate_pdf: FileField
- is_revoked: BooleanField
- blockchain_verified: BooleanField
- blockchain_timestamp: DateTimeField
```

**InstitutionReward** (New)
```python
- wallet_address: CharField (unique, indexed)
- institution_name: CharField
- total_certificates_issued: IntegerField
- reward_points: IntegerField
- current_tier: CharField (choices)
- badges_earned: JSONField
- created_at, updated_at: DateTimeField
```

**NFTBadge** (New)
```python
- institution_reward: ForeignKey
- token_id: BigIntegerField (unique)
- tier: CharField
- certificate_count_at_mint: IntegerField
- transaction_hash: CharField
- token_uri: URLField
- metadata: JSONField
```

**RewardTransaction** (New)
```python
- institution_reward: ForeignKey
- transaction_type: CharField (choices)
- points_awarded: IntegerField
- description: TextField
- blockchain_tx_hash: CharField
```

**MilestoneAchievement** (New)
```python
- institution_reward: ForeignKey
- milestone_count: IntegerField
- tier_achieved: CharField
- nft_badge: OneToOneField (nullable)
```

#### Services

**RewardService**

Core business logic for incentive system:

```python
class RewardService:
    MILESTONE_TIERS = {
        10: 'BRONZE',
        50: 'SILVER',
        100: 'GOLD',
        250: 'PLATINUM',
        500: 'DIAMOND'
    }

    POINTS_PER_CERTIFICATE = 10
    MILESTONE_BONUS_POINTS = {...}

    # Methods:
    - record_certificate_issuance()
    - _check_and_award_milestone()
    - _mint_nft_badge()
    - get_institution_stats()
    - get_leaderboard()
```

**Workflow:**
1. Certificate issued via blockchain
2. Backend detects transaction
3. `record_certificate_issuance()` called
4. Points added (+10 base)
5. Milestone check performed
6. If milestone reached:
   - Bonus points awarded
   - NFT minting triggered
   - MilestoneAchievement created
   - Events logged

#### API Endpoints

**Certificates:**
```
POST   /api/issue/                      - Issue certificate
GET    /api/verify/<hash>/              - Verify certificate
POST   /api/revoke/<hash>/              - Revoke certificate
GET    /api/                            - List certificates
```

**Rewards:**
```
GET    /api/rewards/leaderboard/                    - Global rankings
GET    /api/rewards/institutions/<wallet>/stats/   - Institution details
GET    /api/rewards/institutions/<wallet>/badges/  - NFT badge list
GET    /api/rewards/institutions/<wallet>/transactions/ - Activity log
POST   /api/rewards/register-issuance/             - Manual cert registration
GET    /api/rewards/check-milestone/               - Milestone eligibility
```

---

### 3. React Frontend

#### Context Providers

**Web3Context**
- Manages wallet connection
- Handles network switching
- Provides ethers.js provider/signer
- Monitors account/network changes

**ThemeProvider**
- Dark/light mode toggle
- Material-UI theme customization

**OnboardingProvider**
- User onboarding flow
- Feature tours

#### Key Components

**WalletConnect**
- MetaMask integration
- Network detection
- Address display with copy
- Disconnect functionality

**RewardsDashboard**
- Stats cards (certificates, points, badges)
- Progress bar to next milestone
- NFT badge gallery
- Recent activity feed

**Leaderboard**
- Global institution rankings
- Tier badges display
- Sortable table
- Real-time updates

**CertificateForm**
- Multi-step form
- PDF upload
- Web3 transaction handling
- Reward notification

#### Hooks

**useWeb3**
```javascript
const {
  account,
  provider,
  signer,
  chainId,
  isScrollNetwork,
  connectWallet,
  disconnectWallet,
  switchToScrollNetwork
} = useWeb3();
```

#### Network Configuration

```javascript
SCROLL_NETWORKS = {
  SCROLL_SEPOLIA: {
    chainId: 534351,
    rpcUrl: 'https://sepolia-rpc.scroll.io',
    explorer: 'https://sepolia.scrollscan.com'
  },
  SCROLL_MAINNET: {
    chainId: 534352,
    rpcUrl: 'https://rpc.scroll.io',
    explorer: 'https://scrollscan.com'
  }
}
```

---

## 🔄 Data Flow

### Certificate Issuance Flow

```
User (Frontend)
    ↓ Fill form + Upload PDF
    ↓ Click "Issue Certificate"
    ↓ Connect wallet (MetaMask)
    ↓
Django Backend
    ↓ Validate data
    ↓ Call blockchain.py
    ↓
Smart Contract (Scroll)
    ↓ Generate cert hash
    ↓ Store on-chain
    ↓ Emit CertificateIssued event
    ↓ Return tx hash
    ↓
Django Backend
    ↓ Save to database
    ↓ Call RewardService
    ↓ Update institution stats
    ↓ Check milestone
    ↓ Mint NFT if eligible
    ↓
Frontend
    ↓ Display success
    ↓ Show updated rewards
    ↓ Notify user
```

### Reward Calculation Flow

```
Certificate Issued
    ↓
RewardService.record_certificate_issuance()
    ↓
1. Get/Create InstitutionReward
2. Increment certificate count
3. Add +10 base points
4. Calculate new tier
5. Check milestone thresholds
    ↓
IF milestone reached:
    ↓
    6. Add bonus points
    7. Create MilestoneAchievement
    8. Call _mint_nft_badge()
        ↓
        - Connect to NFT contract
        - Prepare metadata
        - Call mintBadge() on-chain
        - Wait for confirmation
        - Save NFTBadge record
        - Update institution badges_earned
    9. Create RewardTransaction log
    ↓
Return updated InstitutionReward
```

### Verification Flow

```
User enters cert hash
    ↓
Frontend → Backend API
    ↓
Django checks database
    ↓
Django calls blockchain.py
    ↓
Smart Contract query
    ↓
Return certificate details
    ↓
Compare database vs blockchain
    ↓
Display verification result
```

---

## 🔐 Security Model

### Smart Contract Security

1. **Access Control**
   - Ownable pattern for NFT minting
   - Only issuer can revoke their certificates
   - Public verification (read-only)

2. **Data Integrity**
   - Keccak256 hashing for certificates
   - Immutable certificate data once issued
   - Event logs for audit trail

3. **Reentrancy Protection**
   - No external calls during state changes
   - Checks-effects-interactions pattern

### Backend Security

1. **Environment Variables**
   - Private keys in .env (never committed)
   - Separate configs for dev/prod

2. **CORS**
   - Whitelist frontend origins
   - Restrict API access

3. **Django Security**
   - CSRF protection
   - SQL injection prevention
   - XSS protection

### Frontend Security

1. **Wallet Security**
   - User controls private keys
   - MetaMask handles key management
   - All transactions require user approval

2. **Input Validation**
   - Client-side validation
   - Server-side verification
   - File upload restrictions

---

## 📈 Scalability Considerations

### Current Architecture

- **TPS Limit:** Scroll's capacity (~several hundred TPS)
- **Storage:** PostgreSQL for off-chain data
- **Caching:** React Query for API caching

### Optimization Strategies

1. **Batch Operations**
   - Bulk certificate issuance
   - Batched NFT minting

2. **Indexing**
   - Subgraph for event indexing (future)
   - Database indexes on wallet_address, cert_hash

3. **Caching**
   - Redis for leaderboard (future)
   - CDN for static NFT metadata

4. **Async Processing**
   - Celery for background tasks (future)
   - Event-driven architecture

---

## 🚀 Deployment Architecture

### Development
```
Ganache (Local)
    ↕
Django (localhost:8000)
    ↕
React (localhost:3000)
```

### Staging/Production
```
Scroll Sepolia/Mainnet
    ↕
Django (Railway/Render/DO)
    ↕
PostgreSQL (Managed DB)
    ↕
React (Netlify/Vercel CDN)
```

---

## 📊 Performance Metrics

### Target Metrics

- **Certificate Issuance:** < 10s (including blockchain confirmation)
- **Verification:** < 2s
- **Reward Calculation:** < 1s
- **NFT Minting:** < 15s
- **Dashboard Load:** < 3s

### Monitoring

- Backend: Django Debug Toolbar, Sentry
- Frontend: React DevTools, Web Vitals
- Blockchain: Scrollscan, custom event listeners

---

## 🔮 Future Enhancements

### Phase 2
- IPFS integration for PDFs
- Batch certificate issuance
- Advanced search/filtering
- Email notifications

### Phase 3
- ERC20 token ($CEVERSYS)
- Token staking for validators
- DAO governance
- Cross-chain bridges

### Phase 4
- Mobile app (React Native)
- API marketplace for HR platforms
- AI-powered credential verification
- Enterprise SSO integration

---

## 📚 Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Smart Contracts** | Solidity 0.8.21, OpenZeppelin, Truffle |
| **Blockchain** | Scroll zkEVM, Ethers.js v6, Web3.py |
| **Backend** | Django 4.x, DRF, PostgreSQL, Celery (future) |
| **Frontend** | React 18, Material-UI v5, Axios, React Router |
| **DevOps** | Git, npm, pip, Netlify, Railway |
| **Testing** | Truffle Tests, Jest, Django TestCase |

---

## 🤝 Contributing

See repository for contribution guidelines. Key areas:

- Smart contract auditing
- Backend API optimization
- Frontend UX improvements
- Documentation updates

---

**Architecture Version:** 2.0
**Last Updated:** October 2024
**Maintainer:** David Kiragu
