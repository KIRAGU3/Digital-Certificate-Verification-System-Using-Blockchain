const CertificateVerification = artifacts.require("CertificateVerification");
import chai from 'chai';
const { expect } = require("chai");


// Your test cases here
describe('CertificateVerification', () => {
  it('should do something', async () => {
    expect(true).to.equal(true);
  });
});

contract("CertificateVerification", (accounts) => {
  let instance;
  // Choose a few accounts from Ganache
  const owner = accounts[0];  
  const nonOwner = accounts[1]; // You might use this later for testing restrictions

  // Use a dummy certificate data
  const studentName = "Alice";
  const course = "Computer Science";
  const institution = "University of Blockchain";
  const issueDate = 1672531200; // Example UNIX timestamp

  before(async () => {
    // Deploy the contract instance before running tests
    instance = await CertificateVerification.deployed();
  });

  describe("Deployment", () => {
    it("should deploy the contract and have a valid address", async () => {
      expect(instance.address).to.not.be.empty;
      expect(instance.address).to.match(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("Issuing a Certificate", () => {
    let certHash;
    it("should issue a certificate successfully", async () => {
      // Call issueCertificate as the owner
      const tx = await instance.issueCertificate(studentName, course, institution, issueDate, { from: owner });
      // Extract the certificate hash from the event logs (assuming the event is emitted)
      certHash = tx.logs[0].args.certHash;
      expect(certHash).to.exist;
      console.log("Issued certificate hash:", certHash);
    });

    it("should not allow issuing the same certificate twice", async () => {
      try {
        await instance.issueCertificate(studentName, course, institution, issueDate, { from: owner });
        assert.fail("Re-issuing the same certificate did not throw an error");
      } catch (error) {
        expect(error.message).to.include("Certificate already exists");
      }
    });

    describe("Verifying a Certificate", () => {
      it("should verify a certificate and return correct details", async () => {
        const result = await instance.verifyCertificate(certHash);
        // result is a tuple: [isValid, studentName, course, institution, issueDate]
        expect(result[0]).to.be.true;
        expect(result[1]).to.equal(studentName);
        expect(result[2]).to.equal(course);
        expect(result[3]).to.equal(institution);
        expect(result[4].toNumber()).to.equal(issueDate);
      });

      it("should fail to verify a non-existent certificate", async () => {
        // Use a random hash (or a hash that we know wasn't issued)
        const fakeHash = web3.utils.soliditySha3("fakeCertificate");
        try {
          await instance.verifyCertificate(fakeHash);
          assert.fail("Verifying a non-existent certificate did not throw an error");
        } catch (error) {
          expect(error.message).to.include("Certificate not found");
        }
      });
    });

    describe("Revoking a Certificate", () => {
      it("should revoke a certificate successfully", async () => {
        const tx = await instance.revokeCertificate(certHash, { from: owner });
        // After revocation, verifying should indicate it's not valid
        const result = await instance.verifyCertificate(certHash);
        expect(result[0]).to.be.false;
      });

      it("should not revoke an already revoked certificate", async () => {
        try {
          await instance.revokeCertificate(certHash, { from: owner });
          assert.fail("Revoking an already revoked certificate did not throw an error");
        } catch (error) {
          expect(error.message).to.include("Certificate does not exist or is already revoked");
        }
      });
    });
  });
});
