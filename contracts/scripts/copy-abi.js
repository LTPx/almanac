/**
 * Copia el ABI compilado de AlmanacCertificate al directorio lib/contracts/ del app.
 * Correr después de `npx hardhat compile`.
 */
const fs = require("fs");
const path = require("path");

const artifactPath = path.join(
  __dirname,
  "../artifacts/contracts/AlmanacCertificate.sol/AlmanacCertificate.json"
);

const outputPath = path.join(
  __dirname,
  "../../lib/contracts/AlmanacCertificate.json"
);

if (!fs.existsSync(artifactPath)) {
  console.error(
    "No se encontró el artifact. Corre `npx hardhat compile` primero."
  );
  process.exit(1);
}

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

// Solo guardar el ABI (no el bytecode completo)
const output = {
  contractName: artifact.contractName,
  abi: artifact.abi,
};

const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`ABI copiado a: ${outputPath}`);
