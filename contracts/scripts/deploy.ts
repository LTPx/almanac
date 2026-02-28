import { ethers, upgrades, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=".repeat(60));
  console.log("Desplegando AlmanacCertificate + AlmanacCollectible");
  console.log("=".repeat(60));
  console.log(`Red:       ${network.name} (chainId: ${network.config.chainId})`);
  console.log(`Deployer:  ${deployer.address}`);
  console.log(
    `Balance:   ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} MATIC`
  );

  // -------------------------------------------------------------------------
  // Parametros — ajustar antes de deployar en produccion
  // -------------------------------------------------------------------------
  const CERT_NAME = "Almanac Certificate";
  const CERT_SYMBOL = "ALMCERT";
  const COL_NAME = "Almanac Collectible";
  const COL_SYMBOL = "ALMCOL";
  const MAX_SUPPLY = 10_000;
  const ADMIN = deployer.address; // cambiar a multisig en mainnet

  console.log(`\nParametros:`);
  console.log(`  Certificado:   ${CERT_NAME} (${CERT_SYMBOL})`);
  console.log(`  Coleccionable: ${COL_NAME} (${COL_SYMBOL})`);
  console.log(`  MAX_SUPPLY:    ${MAX_SUPPLY}`);
  console.log(`  Admin:         ${ADMIN}`);

  // -------------------------------------------------------------------------
  // 1. Deploy AlmanacCertificate
  // -------------------------------------------------------------------------
  console.log("\n[1/2] Desplegando AlmanacCertificate...");
  const CertFactory = await ethers.getContractFactory("AlmanacCertificate");

  const certProxy = await upgrades.deployProxy(
    CertFactory,
    [CERT_NAME, CERT_SYMBOL, MAX_SUPPLY, ADMIN],
    { kind: "uups", initializer: "initialize" }
  );
  await certProxy.waitForDeployment();

  const certProxyAddress = await certProxy.getAddress();
  const certImplAddress =
    await upgrades.erc1967.getImplementationAddress(certProxyAddress);

  console.log(`  Proxy:          ${certProxyAddress}`);
  console.log(`  Implementation: ${certImplAddress}`);

  // -------------------------------------------------------------------------
  // 2. Deploy AlmanacCollectible (referencia al certificado)
  // -------------------------------------------------------------------------
  console.log("\n[2/2] Desplegando AlmanacCollectible...");
  const ColFactory = await ethers.getContractFactory("AlmanacCollectible");

  const colProxy = await upgrades.deployProxy(
    ColFactory,
    [COL_NAME, COL_SYMBOL, MAX_SUPPLY, ADMIN, certProxyAddress],
    { kind: "uups", initializer: "initialize" }
  );
  await colProxy.waitForDeployment();

  const colProxyAddress = await colProxy.getAddress();
  const colImplAddress =
    await upgrades.erc1967.getImplementationAddress(colProxyAddress);

  console.log(`  Proxy:          ${colProxyAddress}`);
  console.log(`  Implementation: ${colImplAddress}`);

  // -------------------------------------------------------------------------
  // Guardar deploy info
  // -------------------------------------------------------------------------
  const deployInfo = {
    network: network.name,
    chainId: network.config.chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    maxSupply: MAX_SUPPLY,
    certificate: {
      proxyAddress: certProxyAddress,
      implementationAddress: certImplAddress,
      name: CERT_NAME,
      symbol: CERT_SYMBOL,
    },
    collectible: {
      proxyAddress: colProxyAddress,
      implementationAddress: colImplAddress,
      name: COL_NAME,
      symbol: COL_SYMBOL,
    },
  };

  const outDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, `${network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deployInfo, null, 2));

  // -------------------------------------------------------------------------
  // Resumen
  // -------------------------------------------------------------------------
  console.log("\n" + "=".repeat(60));
  console.log("Deploy exitoso!");
  console.log("=".repeat(60));
  console.log(`\nDeploy info guardado en: ${outFile}`);
  console.log("\nProximos pasos:");
  console.log(`1. Verificar contratos:`);
  console.log(`   npx hardhat verify --network ${network.name} ${certImplAddress}`);
  console.log(`   npx hardhat verify --network ${network.name} ${colImplAddress}`);
  console.log(`2. Otorgar roles:`);
  console.log(`   npx hardhat run scripts/grant-roles.ts --network ${network.name}`);
  console.log(`3. Agregar al .env del app:`);
  console.log(`   CERTIFICATE_CONTRACT_ADDRESS=${certProxyAddress}`);
  console.log(`   COLLECTIBLE_CONTRACT_ADDRESS=${colProxyAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
