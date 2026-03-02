import { ethers } from "ethers";
import AlmanacCertificateABI from "./AlmanacCertificate.json";
import AlmanacCollectibleABI from "./AlmanacCollectible.json";

const ADMIN_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY;
const RPC_URL = process.env.POLYGON_RPC_URL;

if (!ADMIN_PRIVATE_KEY)
  throw new Error("Falta ADMIN_WALLET_PRIVATE_KEY en env");
if (!RPC_URL) throw new Error("Falta POLYGON_RPC_URL en env");

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

export interface ContractMintResult {
  tokenId: string;
  transactionHash: string;
}

/**
 * Mintea un certificado soulbound via AlmanacCertificate.mint(to, uri)
 */
export async function mintCertificate(
  contractAddress: string,
  to: string,
  uri: string
): Promise<ContractMintResult> {
  const contract = new ethers.Contract(
    contractAddress,
    AlmanacCertificateABI.abi,
    signer
  );

  const tx = await contract.mint(to, uri);
  const receipt = await tx.wait();

  const tokenId = extractTokenIdFromReceipt(receipt);

  return {
    tokenId,
    transactionHash: receipt.transactionHash
  };
}

/**
 * Mintea un coleccionable tradeable via AlmanacCollectible.mint(to, uri, linkedCertId, authorWallet, royaltyBps)
 */
export async function mintCollectible(
  contractAddress: string,
  to: string,
  uri: string,
  linkedCertId: number,
  authorWallet: string,
  royaltyBps: number
): Promise<ContractMintResult> {
  const contract = new ethers.Contract(
    contractAddress,
    AlmanacCollectibleABI.abi,
    signer
  );

  const tx = await contract.mint(
    to,
    uri,
    linkedCertId,
    authorWallet,
    royaltyBps
  );
  const receipt = await tx.wait();

  const tokenId = extractTokenIdFromReceipt(receipt);

  return {
    tokenId,
    transactionHash: receipt.transactionHash
  };
}

/**
 * Extrae el tokenId del evento Transfer(address,address,uint256) en el receipt
 */
function extractTokenIdFromReceipt(
  receipt: ethers.providers.TransactionReceipt
): string {
  const TRANSFER_TOPIC = ethers.utils.id("Transfer(address,address,uint256)");

  for (const log of receipt.logs) {
    if (log.topics[0] === TRANSFER_TOPIC && log.topics.length === 4) {
      // tokenId is the 4th topic (indexed)
      return ethers.BigNumber.from(log.topics[3]).toString();
    }
  }

  throw new Error(
    "No se encontró evento Transfer en la transacción: " +
      receipt.transactionHash
  );
}
