/**
 * Copia los ABIs compilados de ambos contratos al directorio lib/contracts/ del app.
 * Correr despues de `npx hardhat compile`.
 */
const fs = require("fs");
const path = require("path");

const contracts = [
  {
    name: "AlmanacCertificate",
    artifact: "../artifacts/contracts/AlmanacCertificate.sol/AlmanacCertificate.json",
  },
  {
    name: "AlmanacCollectible",
    artifact: "../artifacts/contracts/AlmanacCollectible.sol/AlmanacCollectible.json",
  },
  {
    name: "ERC1967Proxy",
    artifact: "../node_modules/@openzeppelin/contracts/build/contracts/ERC1967Proxy.json",
    includeBytecode: true,
  },
  {
    name: "AlmanacSplitter",
    artifact: "../artifacts/contracts/AlmanacSplitter.sol/AlmanacSplitter.json",
    includeBytecode: true,
  },
];

const outputDir = path.join(__dirname, "../../lib/contracts");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (const contract of contracts) {
  const artifactPath = path.join(__dirname, contract.artifact);

  if (!fs.existsSync(artifactPath)) {
    console.error(
      `No se encontro el artifact de ${contract.name}. Corre \`npx hardhat compile\` primero.`
    );
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  const output = {
    contractName: artifact.contractName,
    abi: artifact.abi,
    ...(contract.includeBytecode && { bytecode: artifact.bytecode }),
  };

  const outputPath = path.join(outputDir, `${contract.name}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`ABI copiado: ${outputPath}`);
}
