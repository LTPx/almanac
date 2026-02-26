import { ethers, upgrades, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=".repeat(60));
  console.log("Desplegando AlmanacCertificate");
  console.log("=".repeat(60));
  console.log(`Red:       ${network.name} (chainId: ${network.config.chainId})`);
  console.log(`Deployer:  ${deployer.address}`);
  console.log(
    `Balance:   ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} MATIC`
  );

  // -------------------------------------------------------------------------
  // Parámetros del contrato — ajustar antes de deployar en producción
  // -------------------------------------------------------------------------
  const NAME = "Almanac Certificate";
  const SYMBOL = "ALMN";
  const MAX_PAIRS = 10_000; // número total de certificados a emitir
  const ADMIN = deployer.address; // se puede cambiar a un multisig en mainnet

  console.log(`\nParámetros:`);
  console.log(`  Nombre:    ${NAME}`);
  console.log(`  Símbolo:   ${SYMBOL}`);
  console.log(`  MAX_PAIRS: ${MAX_PAIRS}`);
  console.log(`  Admin:     ${ADMIN}`);

  // -------------------------------------------------------------------------
  // Deploy via proxy UUPS
  // -------------------------------------------------------------------------
  console.log("\nDesplegando proxy UUPS...");
  const Factory = await ethers.getContractFactory("AlmanacCertificate");

  const proxy = await upgrades.deployProxy(
    Factory,
    [NAME, SYMBOL, MAX_PAIRS, ADMIN],
    {
      kind: "uups",
      initializer: "initialize",
    }
  );

  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const implementationAddress =
    await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("\n" + "=".repeat(60));
  console.log("Deploy exitoso!");
  console.log("=".repeat(60));
  console.log(`Proxy address:          ${proxyAddress}`);
  console.log(`Implementation address: ${implementationAddress}`);

  // -------------------------------------------------------------------------
  // Guardar addresses en archivo JSON
  // -------------------------------------------------------------------------
  const deployInfo = {
    network: network.name,
    chainId: network.config.chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    proxyAddress,
    implementationAddress,
    params: { NAME, SYMBOL, MAX_PAIRS, ADMIN },
  };

  const outDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, `${network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deployInfo, null, 2));
  console.log(`\nDeploy info guardado en: ${outFile}`);

  // -------------------------------------------------------------------------
  // Instrucciones post-deploy
  // -------------------------------------------------------------------------
  console.log("\n" + "=".repeat(60));
  console.log("Próximos pasos:");
  console.log("=".repeat(60));
  console.log(
    `1. Verificar contrato:\n   npx hardhat verify --network ${network.name} ${implementationAddress}`
  );
  console.log(
    `2. Otorgar roles:\n   npx hardhat run scripts/grant-roles.ts --network ${network.name}`
  );
  console.log(
    `3. Agregar al .env del app:\n   ALMANAC_CONTRACT_ADDRESS=${proxyAddress}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
