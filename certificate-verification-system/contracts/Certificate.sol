// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateVerification {
    struct Certificate {
        string studentName;
        string course;
        string institution;
        uint256 issueDate;
        bool isValid;
    }

    mapping(bytes32 => Certificate) public certificates;

    event CertificateIssued(bytes32 indexed certHash, string studentName, string course, string institution, uint256 issueDate);
    event CertificateRevoked(bytes32 indexed certHash);

    function issueCertificate(string memory _studentName, string memory _course, string memory _institution, uint256 _issueDate) public returns (bytes32) {
        bytes32 certHash = keccak256(abi.encodePacked(_studentName, _course, _institution, _issueDate));
        require(certificates[certHash].issueDate == 0, "Certificate already exists!");

        certificates[certHash] = Certificate(_studentName, _course, _institution, _issueDate, true);
        
        emit CertificateIssued(certHash, _studentName, _course, _institution, _issueDate);
        return certHash;
    }

    function verifyCertificate(bytes32 _certHash) public view returns (bool, string memory, string memory, string memory, uint256) {
        Certificate memory cert = certificates[_certHash];
        require(cert.issueDate != 0, "Certificate not found!");

        return (cert.isValid, cert.studentName, cert.course, cert.institution, cert.issueDate);
    }

    function revokeCertificate(bytes32 _certHash) public {
        require(certificates[_certHash].isValid, "Certificate does not exist or is already revoked!");
        certificates[_certHash].isValid = false;

        emit CertificateRevoked(_certHash);
    }
}
