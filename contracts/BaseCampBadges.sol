// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";

/**
 * @title BaseCampBadges
 * @dev Base Camp 커뮤니티 활동을 위한 ERC-721 NFT 배지 컨트랙트
 *      현재는 "첫 게시글 작성" 배지만 지원하며, 주소 당 1회만 발급됩니다.
 */
contract BaseCampBadges is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // 첫 게시글 배지 URI
    string public firstPostBadgeURI;

    // 주소당 첫 게시글 배지 발급 여부
    mapping(address => bool) public hasClaimedFirstPostBadge;

    event FirstPostBadgeClaimed(address indexed user, uint256 tokenId);
    event FirstPostBadgeURIUpdated(string previousURI, string newURI);

    /**
     * @dev 컨트랙트 배포자 = 초기 소유자
     * @param _firstPostBadgeURI 첫 게시글 배지 기본 메타데이터 URI
     */
    constructor(string memory _firstPostBadgeURI) ERC721("BaseCamp Badges", "BCB") Ownable(msg.sender) {
        firstPostBadgeURI = _firstPostBadgeURI;
    }

    /**
     * @dev 첫 게시글 배지를 발급 (주소 당 1회)
     * @return tokenId 새로 발급된 토큰 ID
     */
    function claimFirstPostBadge() external returns (uint256 tokenId) {
        console.log("User claiming badge:", msg.sender);
        require(!hasClaimedFirstPostBadge[msg.sender], "Already claimed");
        require(bytes(firstPostBadgeURI).length > 0, "Badge URI not set");

        hasClaimedFirstPostBadge[msg.sender] = true;

        _nextTokenId += 1;
        tokenId = _nextTokenId;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, firstPostBadgeURI);

        emit FirstPostBadgeClaimed(msg.sender, tokenId);
    }

    /**
     * @dev 특정 주소가 첫 게시글 배지를 보유하고 있는지 확인
     */
    function hasFirstPostBadge(address account) external view returns (bool) {
        console.log("Checking badge for account:", account);
        return hasClaimedFirstPostBadge[account];
    }

    /**
     * @dev 첫 게시글 배지 메타데이터 URI 업데이트 (소유자만)
     */
    function setFirstPostBadgeURI(string memory newURI) external onlyOwner {
        require(bytes(newURI).length > 0, "Invalid URI");

        string memory previousURI = firstPostBadgeURI;
        firstPostBadgeURI = newURI;

        emit FirstPostBadgeURIUpdated(previousURI, newURI);
    }
}


