from django.db import models
from django.core.validators import MinValueValidator


class InstitutionReward(models.Model):
    TIER_CHOICES = [
        ('BRONZE', 'Bronze'),
        ('SILVER', 'Silver'),
        ('GOLD', 'Gold'),
        ('PLATINUM', 'Platinum'),
        ('DIAMOND', 'Diamond'),
    ]

    wallet_address = models.CharField(max_length=42, unique=True)
    institution_name = models.CharField(max_length=255)
    total_certificates_issued = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    reward_points = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    current_tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='BRONZE')
    badges_earned = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'institution_rewards'
        ordering = ['-total_certificates_issued']

    def __str__(self):
        return f"{self.institution_name} ({self.wallet_address}) - {self.current_tier}"

    def calculate_tier(self):
        count = self.total_certificates_issued
        if count >= 500:
            return 'DIAMOND'
        elif count >= 250:
            return 'PLATINUM'
        elif count >= 100:
            return 'GOLD'
        elif count >= 50:
            return 'SILVER'
        elif count >= 10:
            return 'BRONZE'
        return None

    def get_next_milestone(self):
        count = self.total_certificates_issued
        if count < 10:
            return 10
        elif count < 50:
            return 50
        elif count < 100:
            return 100
        elif count < 250:
            return 250
        elif count < 500:
            return 500
        return None

    def get_milestone_progress(self):
        next_milestone = self.get_next_milestone()
        if not next_milestone:
            return 100
        return int((self.total_certificates_issued / next_milestone) * 100)


class NFTBadge(models.Model):
    TIER_CHOICES = InstitutionReward.TIER_CHOICES

    institution_reward = models.ForeignKey(
        InstitutionReward,
        on_delete=models.CASCADE,
        related_name='nft_badges'
    )
    token_id = models.BigIntegerField(unique=True)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES)
    certificate_count_at_mint = models.IntegerField()
    transaction_hash = models.CharField(max_length=66)
    block_number = models.BigIntegerField(null=True, blank=True)
    token_uri = models.URLField(max_length=500, null=True, blank=True)
    minted_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict)

    class Meta:
        db_table = 'nft_badges'
        ordering = ['-minted_at']
        unique_together = ['institution_reward', 'tier']

    def __str__(self):
        return f"Badge #{self.token_id} - {self.tier} for {self.institution_reward.institution_name}"


class RewardTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('CERTIFICATE_ISSUED', 'Certificate Issued'),
        ('MILESTONE_REACHED', 'Milestone Reached'),
        ('NFT_MINTED', 'NFT Minted'),
        ('BONUS_POINTS', 'Bonus Points'),
    ]

    institution_reward = models.ForeignKey(
        InstitutionReward,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    transaction_type = models.CharField(max_length=30, choices=TRANSACTION_TYPES)
    points_awarded = models.IntegerField(default=0)
    description = models.TextField()
    blockchain_tx_hash = models.CharField(max_length=66, null=True, blank=True)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reward_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type} - {self.points_awarded} points for {self.institution_reward.institution_name}"


class MilestoneAchievement(models.Model):
    institution_reward = models.ForeignKey(
        InstitutionReward,
        on_delete=models.CASCADE,
        related_name='milestones'
    )
    milestone_count = models.IntegerField()
    tier_achieved = models.CharField(max_length=20, choices=InstitutionReward.TIER_CHOICES)
    achieved_at = models.DateTimeField(auto_now_add=True)
    nft_badge = models.OneToOneField(
        NFTBadge,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='milestone'
    )

    class Meta:
        db_table = 'milestone_achievements'
        ordering = ['-achieved_at']
        unique_together = ['institution_reward', 'milestone_count']

    def __str__(self):
        return f"{self.institution_reward.institution_name} - {self.milestone_count} certificates ({self.tier_achieved})"
