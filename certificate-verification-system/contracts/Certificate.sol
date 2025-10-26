// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateVerification {
    struct Certificate {
        string studentName;
        string course;
        string institution;
        uint256 issueDate;
        bool isValid;
        address issuer;
    }

    mapping(bytes32 => Certificate) public certificates;
    mapping(address => uint256) public institutionCertificateCount;
    mapping(address => string) public institutionNames;

    event CertificateIssued(
        bytes32 indexed certHash,
        string studentName,
        string course,
        string institution,
        uint256 issueDate,
        address indexed issuer
    );
    event CertificateRevoked(bytes32 indexed certHash);
    event InstitutionRegistered(address indexed institution, string name);

    function registerInstitution(string memory _name) public {
        require(bytes(institutionNames[msg.sender]).length == 0, "Institution already registered");
        institutionNames[msg.sender] = _name;
        emit InstitutionRegistered(msg.sender, _name);
    }

    function issueCertificate(
        string memory _studentName,
        string memory _course,
        string memory _institution,
        uint256 _issueDate
    ) public returns (bytes32) {
        bytes32 certHash = keccak256(abi.encodePacked(_studentName, _course, _institution, _issueDate));
        require(certificates[certHash].issueDate == 0, "Certificate already exists!");

        certificates[certHash] = Certificate(
            _studentName,
            _course,
            _institution,
            _issueDate,
            true,
            msg.sender
        );

        institutionCertificateCount[msg.sender]++;

        emit CertificateIssued(certHash, _studentName, _course, _institution, _issueDate, msg.sender);
        return certHash;
    }

    function verifyCertificate(bytes32 _certHash) public view returns (
        bool,
        string memory,
        string memory,
        string memory,
        uint256
    ) {
        Certificate memory cert = certificates[_certHash];
        require(cert.issueDate != 0, "Certificate not found!");

        return (cert.isValid, cert.studentName, cert.course, cert.institution, cert.issueDate);
    }

    function revokeCertificate(bytes32 _certHash) public {
        Certificate storage cert = certificates[_certHash];
        require(cert.isValid, "Certificate does not exist or is already revoked!");
        require(cert.issuer == msg.sender, "Only issuer can revoke certificate");

        cert.isValid = false;
        emit CertificateRevoked(_certHash);
    }

    function getInstitutionCertificateCount(address _institution) public view returns (uint256) {
        return institutionCertificateCount[_institution];
    }

    function getInstitutionName(address _institution) public view returns (string memory) {
        return institutionNames[_institution];
    }
}

