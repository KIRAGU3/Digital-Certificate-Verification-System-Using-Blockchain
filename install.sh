#!/bin/bash

# CEVERSYS Scroll Integration - Automated Installation Script
# This script sets up the entire project for local development

set -e  # Exit on error

echo "=========================================="
echo "CEVERSYS Scroll Integration Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
print_info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 16+ first."
    exit 1
fi
print_success "Node.js found: $(node --version)"

if ! command -v python3 &> /dev/null; then
    print_error "Python3 not found. Please install Python 3.9+ first."
    exit 1
fi
print_success "Python3 found: $(python3 --version)"

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm first."
    exit 1
fi
print_success "npm found: $(npm --version)"

echo ""
print_info "All prerequisites satisfied!"
echo ""

# 1. Install Smart Contract Dependencies
echo "=========================================="
print_info "Step 1: Installing Smart Contract Dependencies"
echo "=========================================="

cd certificate-verification-system
print_info "Installing Truffle, Web3, and OpenZeppelin..."
npm install
print_success "Smart contract dependencies installed"
echo ""

# 2. Setup Backend
echo "=========================================="
print_info "Step 2: Setting Up Django Backend"
echo "=========================================="

cd ../Django_Backend
print_info "Installing Python dependencies..."

if [ -d "venv" ]; then
    print_info "Virtual environment already exists"
else
    print_info "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

print_info "Installing Django and dependencies..."
pip install -q django djangorestframework django-cors-headers web3 python-dotenv pillow psycopg2-binary

print_success "Backend dependencies installed"

# Check if .env exists
if [ ! -f ".env" ]; then
    print_info "Creating .env file from template..."
    cat > .env << 'EOF'
SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

BLOCKCHAIN_URL=https://sepolia-rpc.scroll.io
CONTRACT_ADDRESS=
NFT_REWARD_CONTRACT_ADDRESS=

CORS_ALLOWED_ORIGINS=http://localhost:3000

NFT_METADATA_BASE_URL=https://ceversys.com/nft-metadata
EOF
    print_success ".env file created (remember to add contract addresses after deployment)"
else
    print_info ".env file already exists"
fi

# Run migrations
print_info "Running database migrations..."
python manage.py migrate --no-input
print_success "Database migrations complete"

deactivate 2>/dev/null || true
echo ""

# 3. Setup Frontend
echo "=========================================="
print_info "Step 3: Setting Up React Frontend"
echo "=========================================="

cd ../certificate-verification-frontend
print_info "Installing React dependencies..."
npm install
print_success "Frontend dependencies installed"

# Check if .env exists
if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SCROLL_RPC_URL=https://sepolia-rpc.scroll.io
REACT_APP_CHAIN_ID=534351
REACT_APP_NETWORK_NAME=Scroll Sepolia
EOF
    print_success ".env file created"
else
    print_info ".env file already exists"
fi

cd ..
echo ""

# Installation complete
echo "=========================================="
print_success "Installation Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Get Scroll Sepolia testnet ETH:"
echo "   Visit: https://sepolia.scroll.io/faucet"
echo ""
echo "2. Deploy Smart Contracts:"
echo "   cd certificate-verification-system"
echo "   # Add your PRIVATE_KEY to .env"
echo "   truffle migrate --network scroll_sepolia"
echo ""
echo "3. Update Backend Configuration:"
echo "   # Add contract addresses to Django_Backend/.env:"
echo "   # CONTRACT_ADDRESS=0x..."
echo "   # NFT_REWARD_CONTRACT_ADDRESS=0x..."
echo ""
echo "4. Copy Contract ABIs:"
echo "   cd certificate-verification-system"
echo "   cp build/contracts/CertificateVerification.json ../Django_Backend/certificates/contract_abi.json"
echo "   cp build/contracts/NFTReward.json ../Django_Backend/certificates/nft_reward_abi.json"
echo ""
echo "5. Start Backend (Terminal 1):"
echo "   cd Django_Backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   python manage.py runserver"
echo ""
echo "6. Start Frontend (Terminal 2):"
echo "   cd certificate-verification-frontend"
echo "   npm start"
echo ""
echo "7. Open Browser:"
echo "   http://localhost:3000"
echo ""
echo "For detailed deployment instructions, see:"
echo "  - QUICK_START.md (5-minute guide)"
echo "  - SCROLL_DEPLOYMENT_GUIDE.md (complete guide)"
echo ""
print_success "Happy Building on Scroll! 🚀"
