# Base Camp Backend (Smart Contracts)

Base Camp의 Solidity 스마트 컨트랙트입니다.

## 설치

```bash
npm install
```

## 컴파일

```bash
npm run compile
```

## 테스트

```bash
npm run test
```

## 배포

### 로컬 네트워크

```bash
# 터미널 1: 로컬 하드햇 노드 실행
npm run node

# 터미널 2: 배포
npm run deploy:local
```

### Base Sepolia 테스트넷

환경 변수 설정:
```bash
export PRIVATE_KEY=your_private_key
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

배포:
```bash
npm run deploy:base-sepolia
```

## 컨트랙트

### WalletAuth.sol

지갑 인증을 위한 컨트랙트입니다.

주요 기능:
- 지갑 주소 등록
- 사용자 정보 조회
- 사용자 활성화/비활성화

