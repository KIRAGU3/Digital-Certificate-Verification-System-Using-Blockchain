# 🧾 Digital Certificate Verification System Using Blockchain

A **decentralized web application** for issuing, verifying, and managing academic or professional certificates using **Ethereum blockchain** and **IPFS**.  
Built with **Truffle**, **Solidity**, **Django (REST API)**, and **React.js** — ensuring **tamper-proof**, **easily verifiable**, and **secure digital credentials**.

---

## 🚀 Features

- ✅ **Certificate Issuance** — Issue verified certificates recorded immutably on the blockchain.  
- 🔍 **Certificate Verification** — Verify authenticity using certificate hash or blockchain transaction ID.  
- 🧱 **Blockchain Integration** — Solidity smart contract deployed via Truffle to Ganache or Polygon.  
- 🧩 **Secure Backend API** — Django REST API for certificate management and blockchain interaction.  
- 🖥 **Modern Frontend** — React interface for administrators and users to issue and verify certificates.  
- ☁️ **IPFS Integration (optional)** — Decentralized certificate file storage.  
- 🕵️ **Fraud Prevention** — Ensures tamper-proof certificate integrity and authenticity.

---

## 🧠 System Architecture Overview

```
React Frontend  →  Django REST API  →  Smart Contract (Ethereum/Ganache)
                                   ↘  PostgreSQL Database
```

---

## 🏗️ Project Structure

```
certificate-verification-system/
│
├── contracts/
│   └── CertificateVerification.sol
├── migrations/
│   └── 1_deploy_contracts.js
├── build/
│   └── contracts/
├── certificates/
│   ├── models.py
│   ├── views.py
│   ├── blockchain.py
│   ├── serializers.py
│   ├── urls.py
├── backend/
│   ├── settings.py
│   ├── urls.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
├── truffle-config.js
├── manage.py
└── package.json
```

---

## ⚙️ Prerequisites

| Tool | Version | Purpose |
|------|----------|----------|
| Node.js | ≥ 16.x | For React and Truffle |
| Python | ≥ 3.10 | For Django backend |
| Truffle | ≥ 5.11 | For smart contract management |
| Ganache | Latest | Local Ethereum blockchain |
| MetaMask | — | Wallet integration |
| PostgreSQL / SQLite | — | Database |

---

## 🪄 Step-by-Step Setup Guide

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/certificate-verification-system.git
cd certificate-verification-system
```

### 2️⃣ Start Ganache
```bash
ganache-cli --deterministic
```
RPC URL: `http://127.0.0.1:8545`

### 3️⃣ Compile Contracts
```bash
npx truffle compile
```

### 4️⃣ Deploy Contracts
```bash
npx truffle migrate --reset
```

Copy your **contract address**.

### 5️⃣ Setup Django
```bash
pip install django djangorestframework web3
py manage.py makemigrations
py manage.py migrate
```

Update `certificates/blockchain.py` with your **new contract address**.

### 6️⃣ Run Django Server
```bash
py manage.py runserver
```

### 7️⃣ Run React Frontend
```bash
cd frontend
npm install
npm start
```

Open: `http://localhost:3000`

---

## 🧪 Testing API

**Issue Certificate**
```bash
POST http://localhost:8000/api/certificates/issue/
```
Form Data:
```
studentName: Jane Doe
course: Computer Science
institution: Tech University
issueDate: 2025-09-05
certificatePdf: <file>
```

**Verify Certificate**
```bash
GET http://localhost:8000/api/certificates/verify/<transaction_hash>/
```

---

## 🧰 Environment Variables

```
WEB3_PROVIDER=http://127.0.0.1:8545
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True
```

---

## 📊 Future Improvements

- ✅ IPFS file storage integration  
- ✅ QR code verification system  
- ✅ Polygon mainnet deployment  
- ✅ Admin dashboard

---

## 👨‍💻 Contributors

- **David Kiragu** — Project Lead & Blockchain Developer  

---

## 📜 License

Licensed under the **MIT License**.

---

## 🌐 Acknowledgements

- Truffle Suite  
- Django REST Framework  
- Web3.py  
- React.js  
- IPFS
