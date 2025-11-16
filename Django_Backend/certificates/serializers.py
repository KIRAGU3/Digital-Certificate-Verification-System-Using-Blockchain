# certificates/serializers.py
from rest_framework import serializers
from .models import Certificate
import time

class CertificateSerializer(serializers.ModelSerializer):
    # Add a serialized timestamp field for issue_date
    issue_date_timestamp = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Certificate
        fields = '__all__'
    
    def get_issue_date_timestamp(self, obj):
        """Convert the issue_date to a Unix timestamp"""
        try:
            return int(obj.issue_date.timestamp())
        except (AttributeError, ValueError, TypeError):
            return None
    
    def get_qr_code_url(self, obj):
        """Get the URL for the QR code image"""
        try:
            if obj.qr_code:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.qr_code.url)
                else:
                    return obj.qr_code.url
            return None
        except (AttributeError, ValueError, TypeError):
            return None
