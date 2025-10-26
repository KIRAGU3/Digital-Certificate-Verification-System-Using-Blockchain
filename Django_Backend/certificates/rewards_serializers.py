from rest_framework import serializers
from .rewards_models import InstitutionReward, NFTBadge, RewardTransaction, MilestoneAchievement


class NFTBadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NFTBadge
        fields = [
            'id', 'token_id', 'tier', 'certificate_count_at_mint',
            'transaction_hash', 'block_number', 'token_uri',
            'minted_at', 'metadata'
        ]


class RewardTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardTransaction
        fields = [
            'id', 'transaction_type', 'points_awarded', 'description',
            'blockchain_tx_hash', 'metadata', 'created_at'
        ]


class MilestoneAchievementSerializer(serializers.ModelSerializer):
    nft_badge = NFTBadgeSerializer(read_only=True)

    class Meta:
        model = MilestoneAchievement
        fields = [
            'id', 'milestone_count', 'tier_achieved',
            'achieved_at', 'nft_badge'
        ]


class InstitutionRewardSerializer(serializers.ModelSerializer):
    nft_badges = NFTBadgeSerializer(many=True, read_only=True)
    milestones = MilestoneAchievementSerializer(many=True, read_only=True)
    next_milestone = serializers.SerializerMethodField()
    milestone_progress = serializers.SerializerMethodField()

    class Meta:
        model = InstitutionReward
        fields = [
            'id', 'wallet_address', 'institution_name',
            'total_certificates_issued', 'reward_points', 'current_tier',
            'badges_earned', 'nft_badges', 'milestones',
            'next_milestone', 'milestone_progress',
            'created_at', 'updated_at'
        ]

    def get_next_milestone(self, obj):
        return obj.get_next_milestone()

    def get_milestone_progress(self, obj):
        return obj.get_milestone_progress()


class InstitutionStatsSerializer(serializers.Serializer):
    institution = serializers.DictField()
    badges = serializers.ListField()
    milestones = serializers.ListField()
    recent_transactions = serializers.ListField()


class LeaderboardEntrySerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    institution_name = serializers.CharField()
    wallet_address = serializers.CharField()
    total_certificates = serializers.IntegerField()
    reward_points = serializers.IntegerField()
    current_tier = serializers.CharField()
    badges_count = serializers.IntegerField()
