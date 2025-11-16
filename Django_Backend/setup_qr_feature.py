#!/usr/bin/env python
"""
QR Code Feature Setup Script
Run this script to set up QR code functionality in your Django backend
"""

import os
import sys
import subprocess

def main():
    print("=" * 60)
    print("QR Code Certificate Verification - Setup Script")
    print("=" * 60)
    
    # Get the Django backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    print("\n1. Installing Python packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "qrcode[pil]", "pyzbar"])
        print("   ✓ Python packages installed")
    except subprocess.CalledProcessError as e:
        print(f"   ✗ Error installing packages: {e}")
        return False
    
    print("\n2. Running database migrations...")
    try:
        subprocess.check_call([sys.executable, "manage.py", "migrate"])
        print("   ✓ Database migrations completed")
    except subprocess.CalledProcessError as e:
        print(f"   ✗ Error running migrations: {e}")
        return False
    
    print("\n3. Creating media directory...")
    media_dir = os.path.join(backend_dir, "media", "qr_codes")
    os.makedirs(media_dir, exist_ok=True)
    print(f"   ✓ QR codes directory: {media_dir}")
    
    print("\n" + "=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Restart Django server: python manage.py runserver")
    print("2. Install frontend dependencies: npm install")
    print("3. Start React frontend: npm start")
    print("\nQR code feature is now enabled!")
    print("- Certificates will auto-generate QR codes on issuance")
    print("- Users can verify by scanning QR codes")
    print("- Users can upload QR images for offline verification")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
