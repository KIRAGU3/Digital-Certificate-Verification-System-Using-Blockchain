// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTReward is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    enum AchievementTier { BRONZE, SILVER, GOLD, PLATINUM, DIAMOND }

    struct Badge {
        address institution;
        string institutionName;
        AchievementTier tier;
        uint256 certificateCount;
        uint256 mintedAt;
    }

    mapping(uint256 => Badge) public badges;
    mapping(address => uint256[]) public institutionBadges;
    mapping(address => mapping(AchievementTier => bool)) public institutionHasTier;

    event BadgeMinted(
        uint256 indexed tokenId,
        address indexed institution,
        string institutionName,
        AchievementTier tier,
        uint256 certificateCount
    );

    constructor() ERC721("CEVERSYS Achievement Badge", "CAB") {}

    function mintBadge(
        address institution,
        string memory institutionName,
        AchievementTier tier,
        uint256 certificateCount,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        require(!institutionHasTier[institution][tier], "Institution already has this tier badge");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(institution, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        badges[newTokenId] = Badge({
            institution: institution,
            institutionName: institutionName,
            tier: tier,
            certificateCount: certificateCount,
            mintedAt: block.timestamp
        });

        institutionBadges[institution].push(newTokenId);
        institutionHasTier[institution][tier] = true;

        emit BadgeMinted(newTokenId, institution, institutionName, tier, certificateCount);

        return newTokenId;
    }

    function getBadgeDetails(uint256 tokenId) public view returns (
        address institution,
        string memory institutionName,
        AchievementTier tier,
        uint256 certificateCount,
        uint256 mintedAt
    ) {
        require(_exists(tokenId), "Badge does not exist");
        Badge memory badge = badges[tokenId];
        return (
            badge.institution,
            badge.institutionName,
            badge.tier,
            badge.certificateCount,
            badge.mintedAt
        );
    }

    function getInstitutionBadges(address institution) public view returns (uint256[] memory) {
        return institutionBadges[institution];
    }

    function hasTierBadge(address institution, AchievementTier tier) public view returns (bool) {
        return institutionHasTier[institution][tier];
    }

    function getTierName(AchievementTier tier) public pure returns (string memory) {
        if (tier == AchievementTier.BRONZE) return "Bronze";
        if (tier == AchievementTier.SILVER) return "Silver";
        if (tier == AchievementTier.GOLD) return "Gold";
        if (tier == AchievementTier.PLATINUM) return "Platinum";
        if (tier == AchievementTier.DIAMOND) return "Diamond";
        return "Unknown";
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    function _burn(uint256 tokenId) internal override(ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
