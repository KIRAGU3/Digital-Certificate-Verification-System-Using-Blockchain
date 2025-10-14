import React, { useState } from 'react';
import { issueCertificate } from '../services/certificateService';
import './CertificateForm.css';

const CertificateForm = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    course: '',
    institution: '',
    issueDate: '',
    certificatePdf: null,
  });
  const [issuedCertificate, setIssuedCertificate] = useState(null);

  const handleChange = (e) => {
    const { name, type } = e.target;
    const value = type === 'file' ? e.target.files[0] : e.target.value;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate PDF file
    if (!formData.certificatePdf) {
      alert('Please select a PDF certificate file');
      return;
    }

    const data = new FormData();
    data.append('studentName', formData.studentName);
    data.append('course', formData.course);
    data.append('institution', formData.institution);

    // Send both formatted date and timestamp
    const dateObj = new Date(formData.issueDate);
    const formattedDate = dateObj.toISOString().split('T')[0];
    const timestamp = Math.floor(dateObj.getTime() / 1000);
    data.append('issueDate', formattedDate);
    data.append('issueDateTimestamp', timestamp);

    // Always append the PDF file with the correct field name
    data.append('certificatePdf', formData.certificatePdf, formData.certificatePdf.name);

    try {
      const response = await issueCertificate(data);
      setIssuedCertificate({
        certHash: response.cert_hash,
        txHash: response.transaction_hash,
        warning: response.warning,
        studentName: formData.studentName,
        course: formData.course,
        institution: formData.institution,
        issueDate: formattedDate
      });
      // Clear the form
      setFormData({
        studentName: '',
        course: '',
        institution: '',
        issueDate: '',
        certificatePdf: null,
      });

      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error issuing certificate:', error);
      let errorMessage = 'Failed to issue certificate';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.error || errorMessage;
      }
      alert(errorMessage);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="certificate-form">
        <h2>Issue Certificate</h2>

        <div className="form-group">
          <label>Student Name:</label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Course:</label>
          <input
            type="text"
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Institution:</label>
          <input
            type="text"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Issue Date:</label>
          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Certificate PDF:</label>
          <input
            type="file"
            name="certificatePdf"
            onChange={handleChange}
            accept=".pdf"
            required
          />
        </div>

        <button type="submit">Issue Certificate</button>
      </form>

      {issuedCertificate && (
        <div className="certificate-success">
          <h3>Certificate Issued Successfully!</h3>
          <div className="certificate-details">
            <div className="detail-item">
              <span className="detail-label">Student Name:</span>
              <span className="detail-value">{issuedCertificate.studentName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Course:</span>
              <span className="detail-value">{issuedCertificate.course}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Institution:</span>
              <span className="detail-value">{issuedCertificate.institution}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Issue Date:</span>
              <span className="detail-value">{issuedCertificate.issueDate}</span>
            </div>
            <div className="detail-item certificate-hash">
              <span className="detail-label">Certificate Hash (Use this for verification):</span>
              <span className="detail-value">{issuedCertificate.certHash}</span>
            </div>
            <div className="detail-item transaction-hash">
              <span className="detail-label">Transaction Hash (Blockchain reference):</span>
              <span className="detail-value">{issuedCertificate.txHash}</span>
            </div>
            {issuedCertificate.warning && (
              <div className="warning">
                <strong>Warning:</strong> {issuedCertificate.warning}
              </div>
            )}
            <div className="verification-instructions">
              <p className="important-note">⚠️ IMPORTANT: To verify this certificate, you must use the Certificate Hash above, NOT the Transaction Hash.</p>
              <p>The Certificate Hash is a unique identifier generated from the certificate's contents.</p>
              <a href={`/verify/${issuedCertificate.certHash}`} className="verify-link">Verify This Certificate</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateForm;
