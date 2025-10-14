const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const fetchCertificates = async ({ page = 1, searchTerm = '', type = '', status = '', dateFrom = '', dateTo = '' }) => {
    try {
        const queryParams = new URLSearchParams({
            page,
            search: searchTerm,
            ...(type && { type }),
            ...(status && { status }),
            ...(dateFrom && { date_from: dateFrom }),
            ...(dateTo && { date_to: dateTo }),
        });

        const response = await fetch(`${BACKEND_URL}/api/certificates/?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch certificates');
        }

        const data = await response.json();
        return {
            data: data.results,
            totalPages: Math.ceil(data.count / 10), // Assuming 10 items per page
            totalCount: data.count,
        };
    } catch (error) {
        console.error('Error fetching certificates:', error);
        throw error;
    }
};

// Verify certificate on blockchain through Django backend
export const verifyOnBlockchain = async (certHash) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/certificates/verify-blockchain/${certHash}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to verify on blockchain');
        }

        return await response.json();
    } catch (error) {
        console.error('Blockchain verification error:', error);
        throw error;
    }
}

export const verifyCertificate = async (certHash) => {
    try {
        console.log('Verifying certificate with hash:', certHash);
        const response = await fetch(`${BACKEND_URL}/api/certificates/verify/${certHash}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error Response:', errorData);
            if (response.status === 404) {
                throw new Error('Certificate not found. Please check the hash and try again.');
            }
            throw new Error(errorData.error || 'Failed to verify certificate');
        }

        const data = await response.json();
        console.log('API Verification Response:', data);
        return data;
    } catch (error) {
        console.error('Error in verifyCertificate:', error);
        throw error;
    }
};

export const issueCertificate = async (certificateData) => {
    try {
        // First, save the certificate data to Django backend
        const backendResponse = await fetch(`${BACKEND_URL}/api/certificates/issue/`, {
            method: 'POST',
            // Don't set Content-Type header when sending FormData
            // The browser will set it automatically with the correct boundary
            body: certificateData,
        });

        if (!backendResponse.ok) {
            const errorData = await backendResponse.json();
            console.error('Backend response:', backendResponse.status, errorData);
            throw new Error(errorData.error || 'Failed to save certificate in backend');
        }

        return await backendResponse.json();
    } catch (error) {
        console.error('Error in issueCertificate:', error);
        throw error;
    }
};

export const revokeCertificate = async (certHash) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/certificates/revoke/${certHash}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to revoke certificate');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in revokeCertificate:', error);
        throw error;
    }
};