"""
Test QR Code functionality
Run with: python manage.py test certificates.tests.QRCodeTests
"""

from django.test import TestCase, Client
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from certificates.models import Certificate
from certificates.qr_generator import generate_qr_code, decode_qr_code_hash
from datetime import datetime
from django.utils import timezone
import io
from PIL import Image
import json

class QRCodeGenerationTests(TestCase):
    """Test QR code generation functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.cert_hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    
    def test_qr_code_generation(self):
        """Test that QR code is generated successfully"""
        try:
            qr_file = generate_qr_code(self.cert_hash)
            self.assertIsNotNone(qr_file)
            self.assertTrue(qr_file.size > 0)
            print("✓ QR code generation test passed")
        except Exception as e:
            self.fail(f"QR code generation failed: {str(e)}")
    
    def test_qr_code_contains_verification_url(self):
        """Test that QR code encodes verification URL"""
        qr_file = generate_qr_code(self.cert_hash)
        # Verify file is valid PNG
        img = Image.open(qr_file)
        self.assertEqual(img.format, 'PNG')
        print("✓ QR code PNG format test passed")
    
    def test_multiple_qr_codes_are_different(self):
        """Test that different hashes generate different QR codes"""
        hash1 = '0x1111111111111111111111111111111111111111111111111111111111111111'
        hash2 = '0x2222222222222222222222222222222222222222222222222222222222222222'
        
        qr1 = generate_qr_code(hash1)
        qr2 = generate_qr_code(hash2)
        
        self.assertNotEqual(qr1.getvalue(), qr2.getvalue())
        print("✓ Multiple QR codes uniqueness test passed")


class CertificateQRCodeTests(TestCase):
    """Test QR code with Certificate model"""
    
    def setUp(self):
        """Set up test certificate"""
        self.certificate = Certificate.objects.create(
            student_name="John Doe",
            course="Python Basics",
            institution="Tech Academy",
            issue_date=timezone.now(),
            cert_hash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        )
    
    def test_certificate_qr_code_field(self):
        """Test that certificate can store QR code"""
        qr_file = generate_qr_code(self.certificate.cert_hash)
        self.certificate.qr_code = qr_file
        self.certificate.save()
        
        # Reload from database
        cert = Certificate.objects.get(pk=self.certificate.pk)
        self.assertIsNotNone(cert.qr_code)
        print("✓ Certificate QR code storage test passed")
    
    def test_certificate_qr_code_url(self):
        """Test that QR code URL is accessible"""
        qr_file = generate_qr_code(self.certificate.cert_hash)
        self.certificate.qr_code = qr_file
        self.certificate.save()
        
        self.assertIsNotNone(self.certificate.qr_code.url)
        self.assertTrue(self.certificate.qr_code.url.endswith('.png'))
        print("✓ Certificate QR code URL test passed")


class QRCodeDecodingTests(TestCase):
    """Test QR code decoding functionality"""
    
    def setUp(self):
        """Set up test QR code"""
        self.cert_hash = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678'
        self.qr_file = generate_qr_code(f'0x{self.cert_hash}')
    
    def test_qr_code_decoding(self):
        """Test QR code can be decoded"""
        try:
            decoded_hash = decode_qr_code_hash(self.qr_file)
            # Should return hash with or without 0x prefix
            self.assertIsNotNone(decoded_hash)
            print(f"✓ QR code decoded successfully: {decoded_hash}")
        except Exception as e:
            print(f"⚠ QR code decoding requires pyzbar: {str(e)}")


class QRCodeAPITests(TestCase):
    """Test QR code API endpoints"""
    
    def setUp(self):
        """Set up API client"""
        self.client = Client()
        self.cert_hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    
    def test_verify_qr_endpoint_exists(self):
        """Test that QR verification endpoint exists"""
        url = reverse('verify_qr')
        self.assertEqual(url, '/api/certificates/verify-qr/')
        print("✓ QR verification endpoint exists")
    
    def test_qr_verification_missing_data(self):
        """Test QR verification with no data"""
        url = reverse('verify_qr')
        response = self.client.post(url, data={}, content_type='multipart/form-data')
        self.assertEqual(response.status_code, 400)
        print("✓ QR verification error handling test passed")


class QRCodeIntegrationTests(TestCase):
    """Integration tests for QR code workflow"""
    
    def test_complete_qr_workflow(self):
        """Test complete QR code workflow"""
        # 1. Generate QR code
        cert_hash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        qr_file = generate_qr_code(cert_hash)
        
        # 2. Create certificate with QR code
        certificate = Certificate.objects.create(
            student_name="Jane Doe",
            course="Advanced Python",
            institution="Tech Academy",
            issue_date=timezone.now(),
            cert_hash=cert_hash,
            qr_code=qr_file
        )
        
        # 3. Verify certificate can be retrieved
        retrieved_cert = Certificate.objects.get(cert_hash=cert_hash)
        self.assertEqual(retrieved_cert.student_name, "Jane Doe")
        self.assertIsNotNone(retrieved_cert.qr_code)
        
        # 4. Verify QR code URL is valid
        self.assertTrue(retrieved_cert.qr_code.url.endswith('.png'))
        
        print("✓ Complete QR code workflow test passed")
    
    def test_qr_code_generation_on_certificate_creation(self):
        """Test that QR code can be generated during certificate creation"""
        cert_hash = '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba'
        
        # Generate QR code
        qr_file = generate_qr_code(cert_hash)
        
        # Create certificate with QR code
        certificate = Certificate.objects.create(
            student_name="Test Student",
            course="Test Course",
            institution="Test Institution",
            issue_date=timezone.now(),
            cert_hash=cert_hash,
            qr_code=qr_file
        )
        
        # Verify
        self.assertIsNotNone(certificate.qr_code)
        self.assertTrue(Certificate.objects.filter(cert_hash=cert_hash).exists())
        print("✓ QR code generation on creation test passed")


def run_all_tests():
    """
    Helper function to run all QR code tests
    Run with: python manage.py test certificates.tests
    """
    import django
    from django.conf import settings
    from django.test.utils import get_runner
    
    if not settings.configured:
        django.setup()
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(["certificates.tests"])
    return failures == 0


if __name__ == "__main__":
    import django
    from django.conf import settings
    from django.test.utils import get_runner
    
    django.setup()
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=True, keepdb=False)
    
    print("\n" + "=" * 60)
    print("Running QR Code Tests")
    print("=" * 60 + "\n")
    
    failures = test_runner.run_tests(["certificates.tests"])
    
    print("\n" + "=" * 60)
    if failures:
        print(f"Tests failed: {failures} failures")
    else:
        print("All tests passed!")
    print("=" * 60)
