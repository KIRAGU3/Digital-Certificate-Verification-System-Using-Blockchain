from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .rewards_views import (
    InstitutionRewardViewSet,
    NFTBadgeViewSet,
    LeaderboardView,
    register_certificate_issuance,
    check_milestone_eligibility,
    register_wallet
)

router = DefaultRouter()
router.register(r'institutions', InstitutionRewardViewSet, basename='institution-reward')
router.register(r'badges', NFTBadgeViewSet, basename='nft-badge')

urlpatterns = [
    path('', include(router.urls)),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('register-issuance/', register_certificate_issuance, name='register-issuance'),
    path('check-milestone/', check_milestone_eligibility, name='check-milestone'),
    path('register-wallet/', register_wallet, name='register-wallet'),
]
