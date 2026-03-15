import { ethers } from "ethers";
import ERC1967ProxyArtifact from "./ERC1967Proxy.json";
import AlmanacCertificateArtifact from "./AlmanacCertificate.json";
import AlmanacCollectibleArtifact from "./AlmanacCollectible.json";

export interface DeployedCollectionContracts {
  certProxyAddress: string;
  collectibleProxyAddress: string | null;
  certTxHash: string;
  collectibleTxHash: string | null;
}

export interface DeployCollectionParams {
  name: string;
  symbol: string;
  maxSupply: number;
  chainId?: number;
  deployCollectible?: boolean;
}

function getSigner(chainId: number) {
  const privateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
  const rpcUrl = process.env.POLYGON_RPC_URL;

  if (!privateKey) throw new Error("Falta ADMIN_WALLET_PRIVATE_KEY en env");
  if (!rpcUrl) throw new Error("Falta POLYGON_RPC_URL en env");

  const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl, {
    name: "polygon-amoy",
    chainId
  });
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Deploya un par de contratos (AlmanacCertificate + AlmanacCollectible) como
 * proxies UUPS reutilizando las implementations ya desplegadas.
 *
 * Las implementations se configuran via env:
 *   CERT_IMPLEMENTATION_ADDRESS
 *   COLLECTIBLE_IMPLEMENTATION_ADDRESS
 */
export async function deployCollectionContracts(
  params: DeployCollectionParams
): Promise<DeployedCollectionContracts> {
  const { name, symbol, maxSupply, chainId = 80002, deployCollectible = true } = params;

  const certImplAddress = process.env.CERT_IMPLEMENTATION_ADDRESS;
  const collectibleImplAddress = process.env.COLLECTIBLE_IMPLEMENTATION_ADDRESS;

  if (!certImplAddress) throw new Error("Falta CERT_IMPLEMENTATION_ADDRESS en env");
  if (!collectibleImplAddress) throw new Error("Falta COLLECTIBLE_IMPLEMENTATION_ADDRESS en env");

  const signer = getSigner(chainId);
  const adminAddress = await signer.getAddress();

  const gasOverrides = {
    maxPriorityFeePerGas: ethers.utils.parseUnits("30", "gwei"),
    maxFeePerGas: ethers.utils.parseUnits("60", "gwei")
  };

  const proxyFactory = new ethers.ContractFactory(
    ERC1967ProxyArtifact.abi,
    ERC1967ProxyArtifact.bytecode,
    signer
  );

  // 1. Deploy proxy del certificado
  const certIface = new ethers.utils.Interface(AlmanacCertificateArtifact.abi);
  const certInitData = certIface.encodeFunctionData("initialize", [
    `${name} Certificate`,
    `${symbol}CERT`,
    maxSupply,
    adminAddress
  ]);

  console.log(`[deploy] Desplegando AlmanacCertificate proxy para "${name}"...`);
  const certProxy = await proxyFactory.deploy(certImplAddress, certInitData, gasOverrides);
  const certReceipt = await certProxy.deployTransaction.wait();
  const certProxyAddress = certProxy.address;
  console.log(`[deploy] AlmanacCertificate proxy: ${certProxyAddress}`);

  if (!deployCollectible) {
    return {
      certProxyAddress,
      collectibleProxyAddress: null,
      certTxHash: certReceipt.transactionHash,
      collectibleTxHash: null
    };
  }

  // 2. Deploy proxy del coleccionable (referencia al proxy del certificado)
  const colIface = new ethers.utils.Interface(AlmanacCollectibleArtifact.abi);
  const colInitData = colIface.encodeFunctionData("initialize", [
    `${name} Collectible`,
    `${symbol}COL`,
    maxSupply,
    adminAddress,
    certProxyAddress
  ]);

  console.log(`[deploy] Desplegando AlmanacCollectible proxy para "${name}"...`);
  const colProxy = await proxyFactory.deploy(collectibleImplAddress, colInitData, gasOverrides);
  const colReceipt = await colProxy.deployTransaction.wait();
  const collectibleProxyAddress = colProxy.address;
  console.log(`[deploy] AlmanacCollectible proxy: ${collectibleProxyAddress}`);

  return {
    certProxyAddress,
    collectibleProxyAddress,
    certTxHash: certReceipt.transactionHash,
    collectibleTxHash: colReceipt.transactionHash
  };
}
