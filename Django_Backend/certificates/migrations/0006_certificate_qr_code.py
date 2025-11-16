# Generated migration for adding QR code field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('certificates', '0005_certificate_blockchain_timestamp_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='certificate',
            name='qr_code',
            field=models.ImageField(blank=True, null=True, upload_to='qr_codes/'),
        ),
    ]
