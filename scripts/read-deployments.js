const fs = require("fs");
const path = require("path");

/**
 * 배포 정보를 읽는 유틸리티 스크립트
 */
function readDeployments() {
  const deploymentsPath = path.join(__dirname, "..", "deployments.json");

  if (!fs.existsSync(deploymentsPath)) {
    console.log("배포 정보가 없습니다. 먼저 컨트랙트를 배포하세요.");
    return null;
  }

  try {
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
    return deployments;
  } catch (error) {
    console.error("배포 정보를 읽을 수 없습니다:", error);
    return null;
  }
}

// 스크립트로 직접 실행할 때
if (require.main === module) {
  const deployments = readDeployments();
  if (deployments) {
    console.log(JSON.stringify(deployments, null, 2));
  }
}

module.exports = { readDeployments };

