import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Script para otorgar roles al wallet admin del app.
 *
 * Roles:
 *   MINTER_ROLE  → admin wallet del app (firma los mints)
 *   KYC_ROLE     → admin wallet del app (convierte coleccionables a tradeable)
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
      `No se encontró deployment info en ${deployFile}. Corre deploy.ts primero.`
    );
  }

  const deployInfo = JSON.parse(fs.readFileSync(deployFile, "utf-8"));
  const proxyAddress = deployInfo.proxyAddress;

  // Dirección del admin wallet del app (de .env o directo)
  const adminWalletAddress = process.env.ADMIN_WALLET_ADDRESS;
  if (!adminWalletAddress) {
    throw new Error(
      "Falta ADMIN_WALLET_ADDRESS en .env — es el wallet que firma los mints en el app"
    );
  }

  if (!ethers.isAddress(adminWalletAddress)) {
    throw new Error(`ADMIN_WALLET_ADDRESS no es una dirección válida: ${adminWalletAddress}`);
  }

  console.log("=".repeat(60));
  console.log("Otorgando roles en AlmanacCertificate");
  console.log("=".repeat(60));
  console.log(`Red:            ${network.name}`);
  console.log(`Proxy:          ${proxyAddress}`);
  console.log(`Deployer:       ${deployer.address}`);
  console.log(`Admin wallet:   ${adminWalletAddress}`);

  const contract = await ethers.getContractAt(
    "AlmanacCertificate",
    proxyAddress,
    deployer
  );

  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const KYC_ROLE = ethers.keccak256(ethers.toUtf8Bytes("KYC_ROLE"));

  // MINTER_ROLE
  const hasMinter = await contract.hasRole(MINTER_ROLE, adminWalletAddress);
  if (hasMinter) {
    console.log(`\nMINTER_ROLE: ya asignado, omitiendo.`);
  } else {
    console.log(`\nOtorgando MINTER_ROLE...`);
    const tx1 = await contract.grantRole(MINTER_ROLE, adminWalletAddress);
    await tx1.wait();
    console.log(`  Tx: ${tx1.hash}`);
    console.log(`  MINTER_ROLE otorgado a ${adminWalletAddress}`);
  }

  // KYC_ROLE
  const hasKyc = await contract.hasRole(KYC_ROLE, adminWalletAddress);
  if (hasKyc) {
    console.log(`\nKYC_ROLE: ya asignado, omitiendo.`);
  } else {
    console.log(`\nOtorgando KYC_ROLE...`);
    const tx2 = await contract.grantRole(KYC_ROLE, adminWalletAddress);
    await tx2.wait();
    console.log(`  Tx: ${tx2.hash}`);
    console.log(`  KYC_ROLE otorgado a ${adminWalletAddress}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("Roles configurados correctamente.");
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
