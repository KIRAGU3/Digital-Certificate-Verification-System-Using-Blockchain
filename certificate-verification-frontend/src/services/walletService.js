import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class WalletService {
  async registerWallet(walletAddress, institutionName = null) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/rewards/register-wallet/`, {
        wallet_address: walletAddress,
        institution_name: institutionName || `Institution ${walletAddress.substring(0, 8)}`
      });
      return response.data;
    } catch (error) {
      console.error('Error registering wallet:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already registered')) {
        return { success: true, message: 'Wallet already registered', existing: true };
      }
      throw error;
    }
  }

  async getWalletInfo(walletAddress) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/rewards/institutions/${walletAddress}/stats/`
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching wallet info:', error);
      throw error;
    }
  }

  async updateWalletName(walletAddress, institutionName) {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/rewards/institutions/${walletAddress}/`,
        { institution_name: institutionName }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating wallet name:', error);
      throw error;
    }
  }

  formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  validateAddress(address) {
    if (!address) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}

export default new WalletService();
