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

        // Debug log
        console.log('Form data:', {
            studentName: formData.studentName,
            course: formData.course,
            institution: formData.institution,
            issueDate: formData.issueDate,
            hasPdf: !!formData.certificatePdf
        });

        const data = new FormData();
        data.append('studentName', formData.studentName);
        data.append('course', formData.course);
        data.append('institution', formData.institution);
        data.append('issueDate', formData.issueDate);
        if (formData.certificatePdf) {
            data.append('certificatePdf', formData.certificatePdf);
        }

        try {
            const response = await issueCertificate(data);
            alert(`Certificate issued successfully with hash: ${response.cert_hash}`);
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
        </div>
    );
};

export default CertificateForm;