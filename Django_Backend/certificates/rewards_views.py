from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .rewards_models import InstitutionReward, NFTBadge, RewardTransaction, MilestoneAchievement
from .rewards_serializers import (
    InstitutionRewardSerializer,
    NFTBadgeSerializer,
    RewardTransactionSerializer,
    MilestoneAchievementSerializer,
    InstitutionStatsSerializer,
    LeaderboardEntrySerializer
)
from .rewards_service import RewardService


class InstitutionRewardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InstitutionReward.objects.all()
    serializer_class = InstitutionRewardSerializer
    lookup_field = 'wallet_address'

    def get_queryset(self):
        queryset = InstitutionReward.objects.all()
        wallet = self.request.query_params.get('wallet', None)
        if wallet:
            queryset = queryset.filter(wallet_address=wallet.lower())
        return queryset

    @action(detail=True, methods=['get'])
    def stats(self, request, wallet_address=None):
        reward_service = RewardService()
        stats = reward_service.get_institution_stats(wallet_address)

        if stats:
            serializer = InstitutionStatsSerializer(stats)
            return Response(serializer.data)
        return Response(
            {'error': 'Institution not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    @action(detail=True, methods=['get'])
    def badges(self, request, wallet_address=None):
        institution = get_object_or_404(
            InstitutionReward,
            wallet_address=wallet_address.lower()
        )
        badges = NFTBadge.objects.filter(institution_reward=institution)
        serializer = NFTBadgeSerializer(badges, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def transactions(self, request, wallet_address=None):
        institution = get_object_or_404(
            InstitutionReward,
            wallet_address=wallet_address.lower()
        )
        transactions = RewardTransaction.objects.filter(
            institution_reward=institution
        ).order_by('-created_at')[:50]
        serializer = RewardTransactionSerializer(transactions, many=True)
        return Response(serializer.data)


class LeaderboardView(APIView):
    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        reward_service = RewardService()
        leaderboard = reward_service.get_leaderboard(limit=limit)
        serializer = LeaderboardEntrySerializer(leaderboard, many=True)
        return Response(serializer.data)


class NFTBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NFTBadge.objects.all()
    serializer_class = NFTBadgeSerializer
    lookup_field = 'token_id'

    def get_queryset(self):
        queryset = NFTBadge.objects.all()
        wallet = self.request.query_params.get('wallet', None)
        tier = self.request.query_params.get('tier', None)

        if wallet:
            queryset = queryset.filter(
                institution_reward__wallet_address=wallet.lower()
            )
        if tier:
            queryset = queryset.filter(tier=tier.upper())

        return queryset.order_by('-minted_at')


@api_view(['POST'])
def register_certificate_issuance(request):
    wallet_address = request.data.get('wallet_address')
    institution_name = request.data.get('institution_name')
    cert_hash = request.data.get('cert_hash')

    if not all([wallet_address, institution_name, cert_hash]):
        return Response(
            {'error': 'Missing required fields'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        reward_service = RewardService()
        institution = reward_service.record_certificate_issuance(
            wallet_address,
            institution_name,
            cert_hash
        )

        serializer = InstitutionRewardSerializer(institution)
        return Response({
            'success': True,
            'institution': serializer.data,
            'message': 'Certificate issuance recorded successfully'
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def check_milestone_eligibility(request):
    wallet_address = request.query_params.get('wallet')

    if not wallet_address:
        return Response(
            {'error': 'Wallet address required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        institution = InstitutionReward.objects.get(
            wallet_address=wallet_address.lower()
        )

        next_milestone = institution.get_next_milestone()
        progress = institution.get_milestone_progress()
        eligible_for_mint = False

        if next_milestone and institution.total_certificates_issued >= next_milestone:
            existing_milestone = MilestoneAchievement.objects.filter(
                institution_reward=institution,
                milestone_count=next_milestone
            ).exists()
            eligible_for_mint = not existing_milestone

        return Response({
            'wallet_address': institution.wallet_address,
            'current_certificates': institution.total_certificates_issued,
            'next_milestone': next_milestone,
            'progress_percentage': progress,
            'current_tier': institution.current_tier,
            'eligible_for_nft_mint': eligible_for_mint
        })

    except InstitutionReward.DoesNotExist:
        return Response(
            {'error': 'Institution not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
def register_wallet(request):
    wallet_address = request.data.get('wallet_address')
    institution_name = request.data.get('institution_name')

    if not wallet_address:
        return Response(
            {'error': 'Wallet address required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    wallet_address = wallet_address.lower()

    try:
        institution = InstitutionReward.objects.get(wallet_address=wallet_address)
        return Response({
            'success': True,
            'message': 'Wallet already registered',
            'institution': {
                'wallet_address': institution.wallet_address,
                'institution_name': institution.institution_name,
                'total_certificates': institution.total_certificates_issued,
                'reward_points': institution.reward_points,
                'current_tier': institution.current_tier
            }
        })
    except InstitutionReward.DoesNotExist:
        institution = InstitutionReward.objects.create(
            wallet_address=wallet_address,
            institution_name=institution_name or f'Institution {wallet_address[:8]}'
        )

        return Response({
            'success': True,
            'message': 'Wallet registered successfully',
            'institution': {
                'wallet_address': institution.wallet_address,
                'institution_name': institution.institution_name,
                'total_certificates': institution.total_certificates_issued,
                'reward_points': institution.reward_points,
                'current_tier': institution.current_tier
            }
        }, status=status.HTTP_201_CREATED)
