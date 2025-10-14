const Web3 = require('web3');
const CertificateVerification = require('./build/contracts/CertificateVerification.json');

async function testContract() {
    const web3 = new Web3('http://127.0.0.1:8545');

    try {
        // Get network ID and accounts
        const accounts = await web3.eth.getAccounts();

        // Create contract instance
        const contract = new web3.eth.Contract(
            CertificateVerification.abi,
            '0xB867246f4d76010d8464Ed436197Cd3DCC047fc3'
        );

        // Test data
        const studentName = "Test Student";
        const course = "Test Course";
        const institution = "Test University";
        const issueDate = Math.floor(Date.now() / 1000);

        console.log('Issuing certificate with data:', {
            studentName,
            course,
            institution,
            issueDate
        });

        // Issue certificate
        const result = await contract.methods
            .issueCertificate(studentName, course, institution, issueDate)
            .send({ from: accounts[0], gas: 500000 });

        console.log('Certificate issued! Transaction:', result.transactionHash);

        // Get the certificate hash from the event
        const certHash = result.events.CertificateIssued.returnValues.certHash;
        console.log('Certificate hash:', certHash);

        // Verify the certificate
        const verification = await contract.methods
            .verifyCertificate(certHash)
            .call();

        console.log('Verification result:', {
            isValid: verification[0],
            studentName: verification[1],
            course: verification[2],
            institution: verification[3],
            issueDate: verification[4]
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testContract();