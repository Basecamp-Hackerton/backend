// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title WalletAuth
 * @dev 간단한 지갑 인증 컨트랙트
 * 사용자의 지갑 주소를 등록하고 관리합니다.
 */
contract WalletAuth {
    // 사용자 정보 구조체
    struct User {
        address walletAddress;
        uint256 registeredAt;
        bool isActive;
    }

    // 지갑 주소 => 사용자 정보 매핑
    mapping(address => User) public users;
    
    // 등록된 사용자 주소 목록
    address[] public registeredAddresses;
    
    /**
     * @dev 사용자 정보 조회
     * @param _walletAddress 조회할 지갑 주소
     * @return 사용자 정보
     */
    function getUserInfo(address _walletAddress) external view returns (User memory) {
        return users[_walletAddress];
    }

    /**
     * @dev 등록된 사용자 수 조회
     * @return 등록된 사용자 수
     */
    function getRegisteredCount() external view returns (uint256) {
        return registeredAddresses.length;
    }
}

