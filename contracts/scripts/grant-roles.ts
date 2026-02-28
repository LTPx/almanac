import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Otorga MINTER_ROLE al wallet admin del app en ambos contratos.
 *
 * Prerequisito: haber corrido deploy.ts antes.
 * El proxy address se lee del archivo deployments/{network}.json
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  // Leer deployment info
  const deployFile = path.join(
    __dirname,
    `../deployments/${network.name}.json`
  );
  if (!fs.existsSync(deployFile)) {
    throw new Error(
      `No se encontro deployment info en ${deployFile}. Corre deploy.ts primero.`
    );
  }

  const deployInfo = JSON.parse(fs.readFileSync(deployFile, "utf-8"));

  const adminWalletAddress = process.env.ADMIN_WALLET_ADDRESS;
  if (!adminWalletAddress) {
    throw new Error(
      "Falta ADMIN_WALLET_ADDRESS en .env — es el wallet que firma los mints en el app"
    );
  }

  if (!ethers.isAddress(adminWalletAddress)) {
    throw new Error(`ADMIN_WALLET_ADDRESS no es una direccion valida: ${adminWalletAddress}`);
  }

  console.log("=".repeat(60));
  console.log("Otorgando roles");
  console.log("=".repeat(60));
  console.log(`Red:            ${network.name}`);
  console.log(`Deployer:       ${deployer.address}`);
  console.log(`Admin wallet:   ${adminWalletAddress}`);

  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

  // -------------------------------------------------------------------------
  // AlmanacCertificate — MINTER_ROLE
  // -------------------------------------------------------------------------
  console.log(`\n--- AlmanacCertificate (${deployInfo.certificate.proxyAddress}) ---`);

  const cert = await ethers.getContractAt(
    "AlmanacCertificate",
    deployInfo.certificate.proxyAddress,
    deployer
  );

  const certHasMinter = await cert.hasRole(MINTER_ROLE, adminWalletAddress);
  if (certHasMinter) {
    console.log(`MINTER_ROLE: ya asignado, omitiendo.`);
  } else {
    console.log(`Otorgando MINTER_ROLE...`);
    const tx = await cert.grantRole(MINTER_ROLE, adminWalletAddress);
    await tx.wait();
    console.log(`  Tx: ${tx.hash}`);
  }

  // -------------------------------------------------------------------------
  // AlmanacCollectible — MINTER_ROLE
  // -------------------------------------------------------------------------
  console.log(`\n--- AlmanacCollectible (${deployInfo.collectible.proxyAddress}) ---`);

  const col = await ethers.getContractAt(
    "AlmanacCollectible",
    deployInfo.collectible.proxyAddress,
    deployer
  );

  const colHasMinter = await col.hasRole(MINTER_ROLE, adminWalletAddress);
  if (colHasMinter) {
    console.log(`MINTER_ROLE: ya asignado, omitiendo.`);
  } else {
    console.log(`Otorgando MINTER_ROLE...`);
    const tx = await col.grantRole(MINTER_ROLE, adminWalletAddress);
    await tx.wait();
    console.log(`  Tx: ${tx.hash}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Roles configurados correctamente.");
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
