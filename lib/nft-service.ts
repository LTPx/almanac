import { createThirdwebClient, getContract, sendTransaction } from "thirdweb";
import { mintTo, tokenURI } from "thirdweb/extensions/erc721";
import { privateKeyToAccount } from "thirdweb/wallets";
import { polygonAmoy } from "thirdweb/chains";
import { getRpcClient, eth_getTransactionReceipt } from "thirdweb/rpc";
import prisma from "./prisma";

const ADMIN_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY;
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

if (!ADMIN_PRIVATE_KEY)
  throw new Error("Falta ADMIN_WALLET_PRIVATE_KEY en env");
if (!THIRDWEB_SECRET_KEY) throw new Error("Falta THIRDWEB_SECRET_KEY en env");

/** Evento Transfer topic (ERC-721 estándar) */
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

/** Inicializar thirdweb client + account admin */
const client = createThirdwebClient({ secretKey: THIRDWEB_SECRET_KEY });
const account = privateKeyToAccount({ client, privateKey: ADMIN_PRIVATE_KEY });

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface MintResult {
  tokenId: string | null;
  transactionHash: string;
  metadataUri: string | null;
  explorerUrl: string | null;
  collectionId: string;
  collectionName: string;
}

export const RARITIES = ["NORMAL", "RARE", "EPIC", "UNIQUE"] as const;
export type Rarity = (typeof RARITIES)[number];

/**
 * 🆕 Obtiene una colección por ID
 */
export async function getCollectionById(collectionId: string) {
  const collection = await prisma.nFTCollection.findUnique({
    where: { id: collectionId }
  });

  if (!collection) {
    throw new Error(`Colección ${collectionId} no encontrada`);
  }

  if (!collection.isActive) {
    throw new Error(`La colección ${collection.name} está desactivada`);
  }

  return collection;
}

/**
 * 🆕 Crea una instancia de contrato para una colección específica
 */
function getContractForCollection(contractAddress: string) {
  return getContract({
    client,
    chain: polygonAmoy,
    address: contractAddress
  });
}

/**
 * Crea los metadatos para el NFT del certificado educativo
 */
export function createNFTMetadata({
  courseName,
  unitName,
  rarity,
  imageUrl,
  customDescription,
  collectionName
}: {
  courseName: string;
  unitName: string;
  rarity: Rarity;
  imageUrl: string;
  customDescription?: string;
  collectionName?: string;
}): NFTMetadata {
  const defaultDescription = `Certificado de completitud para la unidad "${unitName}" del curso "${courseName}"`;

  return {
    name: `${courseName} - ${unitName}`,
    description: customDescription || defaultDescription,
    image: imageUrl,
    attributes: [
      { trait_type: "Rarity", value: rarity },
      { trait_type: "Course", value: courseName },
      { trait_type: "Unit", value: unitName },
      {
        trait_type: "Completed Date",
        value: new Date().toISOString().split("T")[0]
      },
      { trait_type: "Type", value: "Educational Certificate" },
      ...(collectionName
        ? [{ trait_type: "Collection", value: collectionName }]
        : [])
    ]
  };
}

/**
 * Obtiene una imagen/nft disponible basado en rareza y colección
 */
export async function getAvailableNFTImage(
  preferredRarity: Rarity,
  collectionId: string
) {
  const rarityPriority: Rarity[] = [
    preferredRarity,
    ...RARITIES.filter((r) => r !== preferredRarity)
  ];

  for (const rarity of rarityPriority) {
    const image = await prisma.nFTAsset.findFirst({
      where: {
        rarity,
        isUsed: false,
        collectionId
      },
      orderBy: { id: "asc" }
    });

    if (image) {
      const updated = await prisma.nFTAsset.update({
        where: { id: image.id },
        data: { isUsed: true, usedAt: new Date() }
      });

      return {
        nftImage: updated.imageUrl,
        nftImageId: updated.id,
        rarityUsed: rarity
      };
    }
  }

  throw new Error(
    `No hay imágenes disponibles para la colección ${collectionId}`
  );
}

/**
 * Espera a que la transacción sea confirmada y retorna el receipt
 */
async function waitForReceipt(
  rpcRequest: any,
  hash: `0x${string}`,
  maxRetries = 20,
  delayMs = 3000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const receipt = await eth_getTransactionReceipt(rpcRequest, { hash });
      if (receipt) return receipt;
    } catch (err: any) {
      if (err.message?.includes("not found")) {
        console.log(
          `Receipt aún no disponible (intento ${i + 1}/${maxRetries})`
        );
      } else {
        throw err;
      }
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error("Transaction receipt not found after waiting");
}

/**
 * Extrae el tokenId de los logs de la transacción
 */
function extractTokenIdFromLogs(
  logs: any[],
  walletAddress: string,
  contractAddress: string
): string | null {
  const paddedTo =
    "0x" + walletAddress.toLowerCase().replace(/^0x/, "").padStart(64, "0");

  for (const log of logs) {
    if (log.address.toLowerCase() !== contractAddress.toLowerCase()) continue;
    if ((log.topics?.[0] ?? "").toLowerCase() !== TRANSFER_TOPIC) continue;

    const topicTo = (log.topics?.[2] ?? "").toLowerCase();
    if (topicTo === paddedTo) {
      const rawId = log.topics?.[3];
      if (rawId) {
        return BigInt(rawId).toString();
      }
    }
  }
  return null;
}

/**
 * Genera la URL del explorador para el NFT
 */
function generateExplorerUrl(
  tokenId: string | null,
  contractAddress: string
): string | null {
  return tokenId
    ? `https://amoy.polygonscan.com/token/${contractAddress}?a=${tokenId}`
    : null;
}

/**
 * Obtiene el URI de metadatos del token
 */
async function getTokenMetadataUri(
  tokenId: string,
  contract: any
): Promise<string | null> {
  try {
    return await tokenURI({ contract, tokenId: BigInt(tokenId) });
  } catch (err) {
    console.error("Error fetching tokenURI:", err);
    return null;
  }
}

/**
 * 🔄 Mintea un NFT educativo para el usuario especificado en una colección específica
 */
export async function mintEducationalNFT(
  walletAddress: string,
  metadata: NFTMetadata,
  collectionId: string
): Promise<MintResult> {
  // 1) Obtener la colección
  const collection = await getCollectionById(collectionId);

  // 2) Crear instancia del contrato para esta colección
  const contract = getContractForCollection(collection.contractAddress);

  console.log(
    `🎨 Minteando en colección: ${collection.name} (${collection.contractAddress})`
  );

  // 3) Crear y enviar transacción
  const transaction = mintTo({
    contract,
    to: walletAddress,
    //@ts-expect-error - thirdweb typing issue
    nft: metadata
  });

  const { transactionHash } = await sendTransaction({ account, transaction });
  if (!transactionHash) {
    throw new Error("No se obtuvo transactionHash");
  }

  // 4) Esperar por el receipt
  const rpcRequest = getRpcClient({ client, chain: polygonAmoy });
  const receipt = await waitForReceipt(rpcRequest, transactionHash);

  // 5) Extraer tokenId de los logs
  const tokenId = extractTokenIdFromLogs(
    receipt.logs,
    walletAddress,
    collection.contractAddress
  );

  // 6) Obtener metadataUri si tenemos tokenId
  const metadataUri = tokenId
    ? await getTokenMetadataUri(tokenId, contract)
    : null;

  // 7) Generar URL del explorador
  const explorerUrl = generateExplorerUrl(tokenId, collection.contractAddress);

  return {
    tokenId,
    transactionHash,
    metadataUri,
    explorerUrl,
    collectionId: collection.id,
    collectionName: collection.name
  };
}

export function getRandomRarity(): Rarity {
  const random = Math.random() * 100;

  if (random < 95) return "NORMAL";
  if (random < 99) return "RARE";
  if (random < 99.8) return "EPIC";
  return "UNIQUE";
}
