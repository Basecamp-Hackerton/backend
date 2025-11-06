const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying WalletAuth contract...");

  const WalletAuth = await hre.ethers.getContractFactory("WalletAuth");
  const walletAuth = await WalletAuth.deploy();

  await walletAuth.waitForDeployment();

  const address = await walletAuth.getAddress();
  const network = await hre.ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  console.log("WalletAuth deployed to:", address);
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", chainId);

  // 배포 정보를 JSON 파일에 저장
  const deploymentsPath = path.join(__dirname, "..", "deployments.json");
  let deployments = {};

  // 기존 배포 정보가 있으면 읽기
  if (fs.existsSync(deploymentsPath)) {
    try {
      deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
    } catch (error) {
      console.warn("기존 deployments.json을 읽을 수 없습니다. 새로 생성합니다.");
    }
  }

  // 네트워크별 주소 저장
  const networkName = hre.network.name;
  if (!deployments[networkName]) {
    deployments[networkName] = {};
  }

  deployments[networkName].WalletAuth = {
    address: address,
    chainId: chainId,
    deployedAt: new Date().toISOString(),
  };

  // JSON 파일에 저장
  fs.writeFileSync(
    deploymentsPath,
    JSON.stringify(deployments, null, 2),
    "utf8"
  );

  console.log(`\n✅ 배포 정보가 ${deploymentsPath}에 저장되었습니다.`);

  // 프론트엔드 설정 파일 자동 업데이트
  updateFrontendConfig(address, chainId, networkName);
}

function updateFrontendConfig(address, chainId, networkName) {
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

  // 네트워크별 주소 업데이트
  if (chainId === 1337 || chainId === 31337) {
    // 로컬 네트워크
    content = content.replace(
      /export const WALLET_AUTH_CONTRACT_ADDRESS_LOCAL = ".*";/,
      `export const WALLET_AUTH_CONTRACT_ADDRESS_LOCAL = "${address}";`
    );
    console.log("✅ 로컬 네트워크 주소가 자동으로 업데이트되었습니다.");
  } else if (chainId === 84532) {
    // Base Sepolia
    content = content.replace(
      /export const WALLET_AUTH_CONTRACT_ADDRESS_SEPOLIA = ".*";/,
      `export const WALLET_AUTH_CONTRACT_ADDRESS_SEPOLIA = "${address}";`
    );
    console.log("✅ Base Sepolia 주소가 자동으로 업데이트되었습니다.");
  } else if (chainId === 8453) {
    // Base Mainnet
    content = content.replace(
      /export const WALLET_AUTH_CONTRACT_ADDRESS_MAINNET = ".*";/,
      `export const WALLET_AUTH_CONTRACT_ADDRESS_MAINNET = "${address}";`
    );
    console.log("✅ Base Mainnet 주소가 자동으로 업데이트되었습니다.");
  }

  fs.writeFileSync(frontendConfigPath, content, "utf8");
  console.log(`\n📝 프론트엔드 설정 파일이 업데이트되었습니다: ${frontendConfigPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
