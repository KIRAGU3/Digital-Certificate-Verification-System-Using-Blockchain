import qrcode
from io import BytesIO
from django.core.files.base import ContentFile
import logging

logger = logging.getLogger(__name__)


def generate_qr_code(cert_hash):
    """
    Generate a QR code image from a certificate hash
    Returns a ContentFile object suitable for Django ImageField
    """
    try:
        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,  # Version 1 can handle up to 41 bytes
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        
        # Add the certificate hash to the QR code
        # Format: Include the full verification URL for scanning convenience
        qr_data = f"https://certificate-verification.example.com/verify/{cert_hash}"
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Create PIL image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to bytes
        img_io = BytesIO()
        img.save(img_io, format='PNG')
        img_io.seek(0)
        
        # Create ContentFile
        qr_file = ContentFile(img_io.getvalue(), name=f"qr_{cert_hash}.png")
        
        logger.info(f"QR code generated successfully for hash: {cert_hash}")
        return qr_file
        
    except Exception as e:
        logger.error(f"Error generating QR code for hash {cert_hash}: {str(e)}")
        raise


def decode_qr_code_hash(image_file):
    """
    Decode a QR code image to extract the certificate hash
    """
    try:
        from PIL import Image
        import pyzbar.pyzbar as pyzbar
        
        # Open the image
        img = Image.open(image_file)
        
        # Decode QR code
        decoded_objects = pyzbar.decode(img)
        
        if not decoded_objects:
            return None
        
        # Extract the data from first QR code
        qr_data = decoded_objects[0].data.decode('utf-8')
        
        # Extract hash from URL: .../verify/{hash}
        if '/verify/' in qr_data:
            cert_hash = qr_data.split('/verify/')[-1]
            return cert_hash.replace('0x', '')  # Remove 0x prefix if present
        
        # If it's just the hash
        return qr_data.replace('0x', '')
        
    except Exception as e:
        logger.error(f"Error decoding QR code: {str(e)}")
        return None
