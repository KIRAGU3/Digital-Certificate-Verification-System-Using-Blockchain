from django.db import migrations, models
import django.db.models.deletion
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('certificates', '0005_certificate_blockchain_timestamp_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='InstitutionReward',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('wallet_address', models.CharField(max_length=42, unique=True)),
                ('institution_name', models.CharField(max_length=255)),
                ('total_certificates_issued', models.IntegerField(
                    default=0,
                    validators=[django.core.validators.MinValueValidator(0)]
                )),
                ('reward_points', models.IntegerField(
                    default=0,
                    validators=[django.core.validators.MinValueValidator(0)]
                )),
                ('current_tier', models.CharField(
                    max_length=20,
                    choices=[
                        ('BRONZE', 'Bronze'),
                        ('SILVER', 'Silver'),
                        ('GOLD', 'Gold'),
                        ('PLATINUM', 'Platinum'),
                        ('DIAMOND', 'Diamond'),
                    ],
                    default='BRONZE'
                )),
                ('badges_earned', models.JSONField(default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'institution_rewards',
                'ordering': ['-total_certificates_issued'],
            },
        ),
        migrations.CreateModel(
            name='NFTBadge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token_id', models.BigIntegerField(unique=True)),
                ('tier', models.CharField(
                    max_length=20,
                    choices=[
                        ('BRONZE', 'Bronze'),
                        ('SILVER', 'Silver'),
                        ('GOLD', 'Gold'),
                        ('PLATINUM', 'Platinum'),
                        ('DIAMOND', 'Diamond'),
                    ]
                )),
                ('certificate_count_at_mint', models.IntegerField()),
                ('transaction_hash', models.CharField(max_length=66)),
                ('block_number', models.BigIntegerField(null=True, blank=True)),
                ('token_uri', models.URLField(max_length=500, null=True, blank=True)),
                ('minted_at', models.DateTimeField(auto_now_add=True)),
                ('metadata', models.JSONField(default=dict)),
                ('institution_reward', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='nft_badges',
                    to='certificates.institutionreward'
                )),
            ],
            options={
                'db_table': 'nft_badges',
                'ordering': ['-minted_at'],
                'unique_together': {('institution_reward', 'tier')},
            },
        ),
        migrations.CreateModel(
            name='RewardTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_type', models.CharField(
                    max_length=30,
                    choices=[
                        ('CERTIFICATE_ISSUED', 'Certificate Issued'),
                        ('MILESTONE_REACHED', 'Milestone Reached'),
                        ('NFT_MINTED', 'NFT Minted'),
                        ('BONUS_POINTS', 'Bonus Points'),
                    ]
                )),
                ('points_awarded', models.IntegerField(default=0)),
                ('description', models.TextField()),
                ('blockchain_tx_hash', models.CharField(max_length=66, null=True, blank=True)),
                ('metadata', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('institution_reward', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='transactions',
                    to='certificates.institutionreward'
                )),
            ],
            options={
                'db_table': 'reward_transactions',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='MilestoneAchievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('milestone_count', models.IntegerField()),
                ('tier_achieved', models.CharField(
                    max_length=20,
                    choices=[
                        ('BRONZE', 'Bronze'),
                        ('SILVER', 'Silver'),
                        ('GOLD', 'Gold'),
                        ('PLATINUM', 'Platinum'),
                        ('DIAMOND', 'Diamond'),
                    ]
                )),
                ('achieved_at', models.DateTimeField(auto_now_add=True)),
                ('institution_reward', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='milestones',
                    to='certificates.institutionreward'
                )),
                ('nft_badge', models.OneToOneField(
                    null=True,
                    blank=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='milestone',
                    to='certificates.nftbadge'
                )),
            ],
            options={
                'db_table': 'milestone_achievements',
                'ordering': ['-achieved_at'],
                'unique_together': {('institution_reward', 'milestone_count')},
            },
        ),
    ]
