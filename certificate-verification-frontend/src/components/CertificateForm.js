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
    const dateObj = new Date(formData.issueDate + 'T00:00:00Z');  // Parse as UTC midnight
    const formattedDate = formData.issueDate;  // Use the date string directly
    const timestamp = Math.floor(dateObj.getTime() / 1000);  // Convert to seconds
    data.append('issueDate', formattedDate);
    data.append('issueDateTimestamp', timestamp);

    // Always append the PDF file with the correct field name
    data.append('certificatePdf', formData.certificatePdf, formData.certificatePdf.name);

    try {
      const response = await issueCertificate(data);
      setIssuedCertificate({
        certHash: response.cert_hash,
        txHash: response.transaction_hash,
        qrCodeUrl: response.qr_code_url,
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
          <h3>✅ Certificate Issued Successfully!</h3>
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

            {/* QR Code Section */}
            <div className="detail-item qr-code-section">
              <span className="detail-label">📱 QR Code (Scan for Verification):</span>
              {issuedCertificate.qrCodeUrl ? (
                <div className="qr-code-container">
                  <div className="qr-code-display">
                    <img
                      src={issuedCertificate.qrCodeUrl}
                      alt="Certificate QR Code"
                      className="qr-code-image"
                      onError={(e) => {
                        console.error("QR code failed to load:", issuedCertificate.qrCodeUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="qr-code-actions">
                    <button
                      className="action-button download-btn"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = issuedCertificate.qrCodeUrl;
                        link.download = `certificate-qr-${issuedCertificate.certHash.substring(0, 8)}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      📥 Download QR Code
                    </button>
                  </div>
                  <p className="qr-code-info">
                    📱 Scan this QR code with your phone camera to verify the certificate instantly!
                  </p>
                </div>
              ) : (
                <div className="qr-code-error">
                  ⚠️ QR code is being generated. Please refresh the page in a moment.
                </div>
              )}
            </div>

            {/* Certificate Hash Section */}
            <div className="detail-item certificate-hash">
              <span className="detail-label">🔐 Certificate Hash (Use this for verification):</span>
              <div className="hash-container">
                <span className="detail-value hash-value">{issuedCertificate.certHash}</span>
                <button
                  className="action-button copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(issuedCertificate.certHash);
                    alert('✅ Certificate hash copied to clipboard!');
                  }}
                  title="Copy to clipboard"
                >
                  📋 Copy Hash
                </button>
              </div>
            </div>

            {/* Transaction Hash Section */}
            <div className="detail-item transaction-hash">
              <span className="detail-label">⛓️ Transaction Hash (Blockchain reference):</span>
              <div className="hash-container">
                <span className="detail-value hash-value">{issuedCertificate.txHash}</span>
                {issuedCertificate.txHash && (
                  <button
                    className="action-button copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(issuedCertificate.txHash);
                      alert('✅ Transaction hash copied to clipboard!');
                    }}
                    title="Copy to clipboard"
                  >
                    📋 Copy Tx Hash
                  </button>
                )}
              </div>
            </div>

            {issuedCertificate.warning && (
              <div className="warning">
                <strong>⚠️ Warning:</strong> {issuedCertificate.warning}
              </div>
            )}

            {/* Verification Instructions */}
            <div className="verification-instructions">
              <h4>🔍 How to Verify Your Certificate:</h4>
              <ol>
                <li>
                  <strong>Using Hash:</strong> Go to the "Verify Certificate" page and paste the Certificate Hash above
                </li>
                <li>
                  <strong>Using QR Code:</strong> Go to "Verify Certificate" → "Upload QR Image" and upload the QR code
                </li>
                <li>
                  <strong>Using Camera:</strong> Go to "Verify Certificate" → "Scan with Camera" and scan the QR code with your device camera
                </li>
              </ol>
              <p className="important-note">
                ⚠️ IMPORTANT: To verify this certificate, you must use the <strong>Certificate Hash</strong> above, NOT the Transaction Hash.
              </p>
              <a href={`/verify/${issuedCertificate.certHash}`} className="verify-link">
                ✅ Verify This Certificate Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateForm;
