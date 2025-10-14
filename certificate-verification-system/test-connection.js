const Web3 = require('web3');

async function testConnection() {
    try {
        // Create Web3 instance
        const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
        const accounts = await web3.eth.getAccounts();
        console.log('Connected to Ganache!');
        console.log('Available accounts:', accounts);
    } catch (error) {
        console.error('Error connecting to Ganache:', error);
    }
}

testConnection();