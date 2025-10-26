import json
import os
from datetime import datetime
from web3 import Web3
from django.conf import settings
from .rewards_models import InstitutionReward, NFTBadge, RewardTransaction, MilestoneAchievement


class RewardService:
    MILESTONE_TIERS = {
        10: 'BRONZE',
        50: 'SILVER',
        100: 'GOLD',
        250: 'PLATINUM',
        500: 'DIAMOND'
    }

    POINTS_PER_CERTIFICATE = 10
    MILESTONE_BONUS_POINTS = {
        10: 100,
        50: 500,
        100: 1000,
        250: 2500,
        500: 5000
    }

    def __init__(self):
        self.web3 = self._get_web3()
        self.nft_contract = self._get_nft_contract()

    def _get_web3(self):
        blockchain_url = getattr(settings, 'BLOCKCHAIN_URL', 'http://127.0.0.1:8545')
        try:
            web3 = Web3(Web3.HTTPProvider(blockchain_url))
            if not web3.is_connected():
                print(f"Warning: Could not connect to blockchain at {blockchain_url}")
                return None
            return web3
        except Exception as e:
            print(f"Error initializing Web3: {str(e)}")
            return None

    def _get_nft_contract(self):
        if not self.web3:
            return None

        try:
            nft_address = getattr(settings, 'NFT_REWARD_CONTRACT_ADDRESS', None)
            if not nft_address:
                print("NFT Reward contract address not configured")
                return None

            abi_path = os.path.join(
                os.path.dirname(__file__),
                'nft_reward_abi.json'
            )

            if not os.path.exists(abi_path):
                print(f"NFT contract ABI not found at {abi_path}")
                return None

            with open(abi_path, 'r') as f:
                abi_data = json.load(f)
                abi = abi_data.get('abi', abi_data)

            contract_address = Web3.to_checksum_address(nft_address)
            return self.web3.eth.contract(address=contract_address, abi=abi)

        except Exception as e:
            print(f"Error initializing NFT contract: {str(e)}")
            return None

    def get_or_create_institution(self, wallet_address, institution_name):
        wallet_address = wallet_address.lower()
        institution, created = InstitutionReward.objects.get_or_create(
            wallet_address=wallet_address,
            defaults={'institution_name': institution_name}
        )
        return institution

    def record_certificate_issuance(self, wallet_address, institution_name, cert_hash):
        institution = self.get_or_create_institution(wallet_address, institution_name)

        institution.total_certificates_issued += 1
        institution.reward_points += self.POINTS_PER_CERTIFICATE

        old_tier = institution.current_tier
        new_tier = institution.calculate_tier()

        if new_tier:
            institution.current_tier = new_tier

        institution.save()

        RewardTransaction.objects.create(
            institution_reward=institution,
            transaction_type='CERTIFICATE_ISSUED',
            points_awarded=self.POINTS_PER_CERTIFICATE,
            description=f"Certificate issued: {cert_hash}",
            metadata={'cert_hash': cert_hash}
        )

        self._check_and_award_milestone(institution)

        return institution

    def _check_and_award_milestone(self, institution):
        count = institution.total_certificates_issued

        for milestone, tier in self.MILESTONE_TIERS.items():
            if count == milestone:
                existing = MilestoneAchievement.objects.filter(
                    institution_reward=institution,
                    milestone_count=milestone
                ).first()

                if not existing:
                    bonus_points = self.MILESTONE_BONUS_POINTS.get(milestone, 0)
                    institution.reward_points += bonus_points
                    institution.save()

                    milestone_obj = MilestoneAchievement.objects.create(
                        institution_reward=institution,
                        milestone_count=milestone,
                        tier_achieved=tier
                    )

                    RewardTransaction.objects.create(
                        institution_reward=institution,
                        transaction_type='MILESTONE_REACHED',
                        points_awarded=bonus_points,
                        description=f"Milestone reached: {milestone} certificates ({tier} tier)",
                        metadata={
                            'milestone': milestone,
                            'tier': tier
                        }
                    )

                    self._mint_nft_badge(institution, tier, milestone)

                    return True
        return False

    def _mint_nft_badge(self, institution, tier, certificate_count):
        if not self.web3 or not self.nft_contract:
            print("Blockchain not available, skipping NFT mint")
            return None

        try:
            tier_enum = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'].index(tier)

            token_uri = self._generate_token_uri(institution, tier, certificate_count)

            account = self.web3.eth.accounts[0]

            tx_hash = self.nft_contract.functions.mintBadge(
                Web3.to_checksum_address(institution.wallet_address),
                institution.institution_name,
                tier_enum,
                certificate_count,
                token_uri
            ).transact({'from': account})

            tx_receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)

            if tx_receipt.status != 1:
                print(f"NFT mint transaction failed for {institution.institution_name}")
                return None

            logs = self.nft_contract.events.BadgeMinted().process_receipt(tx_receipt)
            token_id = logs[0]['args']['tokenId'] if logs else None

            nft_badge = NFTBadge.objects.create(
                institution_reward=institution,
                token_id=token_id,
                tier=tier,
                certificate_count_at_mint=certificate_count,
                transaction_hash=tx_hash.hex(),
                block_number=tx_receipt.blockNumber,
                token_uri=token_uri,
                metadata={
                    'institution_name': institution.institution_name,
                    'tier': tier,
                    'certificate_count': certificate_count
                }
            )

            milestone = MilestoneAchievement.objects.filter(
                institution_reward=institution,
                milestone_count=certificate_count,
                nft_badge__isnull=True
            ).first()

            if milestone:
                milestone.nft_badge = nft_badge
                milestone.save()

            RewardTransaction.objects.create(
                institution_reward=institution,
                transaction_type='NFT_MINTED',
                points_awarded=0,
                description=f"NFT Badge minted: {tier} tier (Token #{token_id})",
                blockchain_tx_hash=tx_hash.hex(),
                metadata={
                    'token_id': token_id,
                    'tier': tier,
                    'certificate_count': certificate_count
                }
            )

            badges_list = institution.badges_earned or []
            badges_list.append({
                'tier': tier,
                'token_id': token_id,
                'certificate_count': certificate_count,
                'minted_at': datetime.now().isoformat()
            })
            institution.badges_earned = badges_list
            institution.save()

            print(f"Successfully minted {tier} badge (Token #{token_id}) for {institution.institution_name}")
            return nft_badge

        except Exception as e:
            print(f"Error minting NFT badge: {str(e)}")
            return None

    def _generate_token_uri(self, institution, tier, certificate_count):
        base_url = getattr(settings, 'NFT_METADATA_BASE_URL', 'https://ceversys.com/nft-metadata')
        return f"{base_url}/{institution.wallet_address}/{tier.lower()}.json"

    def get_institution_stats(self, wallet_address):
        try:
            institution = InstitutionReward.objects.get(wallet_address=wallet_address.lower())
            nft_badges = NFTBadge.objects.filter(institution_reward=institution).order_by('-minted_at')
            milestones = MilestoneAchievement.objects.filter(institution_reward=institution).order_by('-achieved_at')
            recent_transactions = RewardTransaction.objects.filter(
                institution_reward=institution
            ).order_by('-created_at')[:10]

            return {
                'institution': {
                    'name': institution.institution_name,
                    'wallet_address': institution.wallet_address,
                    'total_certificates': institution.total_certificates_issued,
                    'reward_points': institution.reward_points,
                    'current_tier': institution.current_tier,
                    'next_milestone': institution.get_next_milestone(),
                    'milestone_progress': institution.get_milestone_progress(),
                },
                'badges': [
                    {
                        'token_id': badge.token_id,
                        'tier': badge.tier,
                        'certificate_count': badge.certificate_count_at_mint,
                        'transaction_hash': badge.transaction_hash,
                        'minted_at': badge.minted_at.isoformat(),
                        'token_uri': badge.token_uri
                    }
                    for badge in nft_badges
                ],
                'milestones': [
                    {
                        'count': m.milestone_count,
                        'tier': m.tier_achieved,
                        'achieved_at': m.achieved_at.isoformat(),
                        'has_nft': m.nft_badge is not None
                    }
                    for m in milestones
                ],
                'recent_transactions': [
                    {
                        'type': tx.transaction_type,
                        'points': tx.points_awarded,
                        'description': tx.description,
                        'created_at': tx.created_at.isoformat()
                    }
                    for tx in recent_transactions
                ]
            }
        except InstitutionReward.DoesNotExist:
            return None

    def get_leaderboard(self, limit=10):
        institutions = InstitutionReward.objects.order_by('-total_certificates_issued')[:limit]
        return [
            {
                'rank': idx + 1,
                'institution_name': inst.institution_name,
                'wallet_address': inst.wallet_address,
                'total_certificates': inst.total_certificates_issued,
                'reward_points': inst.reward_points,
                'current_tier': inst.current_tier,
                'badges_count': inst.nft_badges.count()
            }
            for idx, inst in enumerate(institutions)
        ]
