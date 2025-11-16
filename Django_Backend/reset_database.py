#!/usr/bin/env python
"""
Reset script - Clears database certificates and redeploys contract.
Run this when you restart Ganache to sync everything.
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'certificate_backend.settings')
django.setup()

from certificates.models import Certificate

def reset_database():
    """Clear all certificates from database"""
    
    print("\n" + "="*80)
    print("  DATABASE RESET")
    print("="*80)
    
    count = Certificate.objects.count()
    print(f"\n⚠️  Found {count} certificates in database")
    
    if count > 0:
        Certificate.objects.all().delete()
        print(f"✅ Deleted {count} certificates")
    else:
        print(f"✅ Database already clean")
    
    print(f"\nDatabase is now ready for fresh certificates!")
    
    print("\n" + "="*80)
    print("  NEXT STEPS")
    print("="*80)
    print("""
1. Make sure Ganache is still running
2. Make sure Django is running
3. Make sure React is running
4. Issue a NEW certificate
5. Verify it - should work! ✅

Or run the deploy script if contract is missing:
    python deploy_contract.py
""")

if __name__ == "__main__":
    try:
        reset_database()
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
