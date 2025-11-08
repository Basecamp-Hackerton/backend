const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying WalletAuth contract...");

  const WalletAuth = await hre.ethers.getContractFactory("WalletAuth");
  const walletAuth = await WalletAuth.deploy();
  await walletAuth.waitForDeployment();
  const walletAuthAddress = await walletAuth.getAddress();

  console.log("WalletAuth deployed to:", walletAuthAddress);

  console.log("\nDeploying BaseCampBadges contract...");
  const defaultBadgeURI =
    process.env.FIRST_POST_BADGE_URI ||
    "ipfs://QmPlaceholderBadgeMetadataURI"; // TODO: 환경 변수로 교체하세요.
  const BaseCampBadges = await hre.ethers.getContractFactory("BaseCampBadges");
  const baseCampBadges = await BaseCampBadges.deploy(defaultBadgeURI);
  await baseCampBadges.waitForDeployment();
  const baseCampBadgesAddress = await baseCampBadges.getAddress();

  console.log("BaseCampBadges deployed to:", baseCampBadgesAddress);

  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const networkName = hre.network.name;

  console.log("Network:", networkName);
  console.log("Chain ID:", chainId);

  persistDeployments(networkName, chainId, walletAuthAddress, baseCampBadgesAddress);
  updateFrontendConfig("WalletAuth", walletAuthAddress, chainId);
  updateFrontendConfig("BaseCampBadges", baseCampBadgesAddress, chainId);
}

function persistDeployments(networkName, chainId, walletAuthAddress, baseCampBadgesAddress) {
  const deploymentsPath = path.join(__dirname, "..", "deployments.json");
  let deployments = {};

  if (fs.existsSync(deploymentsPath)) {
    try {
      deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
    } catch (error) {
      console.warn("기존 deployments.json을 읽을 수 없습니다. 새로 생성합니다.");
    }
  }

  if (!deployments[networkName]) {
    deployments[networkName] = {};
  }

  deployments[networkName].WalletAuth = {
    address: walletAuthAddress,
    chainId,
    deployedAt: new Date().toISOString(),
  };

  deployments[networkName].BaseCampBadges = {
    address: baseCampBadgesAddress,
    chainId,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    deploymentsPath,
    JSON.stringify(deployments, null, 2),
    "utf8"
  );

  console.log(`\n✅ 배포 정보가 ${deploymentsPath}에 저장되었습니다.`);
}

function updateFrontendConfig(contractName, address, chainId) {
  const frontendConfigPath = path.join(
    __dirname,
    "..",
    "..",
    "frontend",
    "lib",
    "contracts.ts"
  );

  if (!fs.existsSync(frontendConfigPath)) {
    console.warn("프론트엔드 설정 파일을 찾을 수 없습니다:", frontendConfigPath);
    return;
  }

  let content = fs.readFileSync(frontendConfigPath, "utf8");

  const replaceMap = {
    WalletAuth: {
      [1337]: /export const WALLET_AUTH_CONTRACT_ADDRESS_LOCAL = ".*";/,
      [31337]: /export const WALLET_AUTH_CONTRACT_ADDRESS_LOCAL = ".*";/,
      [84532]: /export const WALLET_AUTH_CONTRACT_ADDRESS_SEPOLIA = ".*";/,
      [8453]: /export const WALLET_AUTH_CONTRACT_ADDRESS_MAINNET = ".*";/,
    },
    BaseCampBadges: {
      [1337]: /export const BADGE_CONTRACT_ADDRESS_LOCAL = ".*";/,
      [31337]: /export const BADGE_CONTRACT_ADDRESS_LOCAL = ".*";/,
      [84532]: /export const BADGE_CONTRACT_ADDRESS_SEPOLIA = ".*";/,
      [8453]: /export const BADGE_CONTRACT_ADDRESS_MAINNET = ".*";/,
    },
  };

  const replacementPatterns = replaceMap[contractName];
  if (!replacementPatterns) {
    console.warn(`프론트엔드 설정 업데이트를 위한 계약명이 정의되지 않았습니다: ${contractName}`);
    return;
  }

  const targetPattern = replacementPatterns[chainId];
  if (!targetPattern) {
    console.warn(`해당 체인 ID(${chainId})에 대한 대체 패턴이 없습니다. 프론트엔드 설정을 수동으로 업데이트하세요.`);
    return;
  }

  content = content.replace(
    targetPattern,
    contractName === "WalletAuth"
      ? `export const WALLET_AUTH_CONTRACT_ADDRESS_${getNetworkKey(chainId)} = "${address}";`
      : `export const BADGE_CONTRACT_ADDRESS_${getNetworkKey(chainId)} = "${address}";`
  );

  const logLabel = getNetworkLabel(chainId);
  console.log(`✅ ${contractName} ${logLabel} 주소가 자동으로 업데이트되었습니다.`);

  fs.writeFileSync(frontendConfigPath, content, "utf8");
  console.log(`\n📝 프론트엔드 설정 파일이 업데이트되었습니다: ${frontendConfigPath}`);
}

function getNetworkKey(chainId) {
  if (chainId === 84532) return "SEPOLIA";
  if (chainId === 8453) return "MAINNET";
  return "LOCAL";
}

function getNetworkLabel(chainId) {
  if (chainId === 84532) return "Base Sepolia";
  if (chainId === 8453) return "Base Mainnet";
  return "로컬 네트워크";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
