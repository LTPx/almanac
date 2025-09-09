import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { PolygonAmoyTestnet } from "@thirdweb-dev/chains";
import prisma from "./prisma";

// Configuración del SDK
const sdk = ThirdwebSDK.fromPrivateKey(
  process.env.ADMIN_PRIVATE_KEY!, // Wallet admin para pagar gas
  PolygonAmoyTestnet,
  {
    clientId: process.env.THIRDWEB_CLIENT_ID!
  }
);

interface MintNFTParams {
  userAddress: string;
  unitName: string;
  courseName: string;
  userId: string;
  unitId: string;
  userLevel?: number;
}

export async function mintEducationalNFT(params: MintNFTParams) {
  const {
    userAddress,
    unitName,
    courseName,
    userId,
    unitId,
    userLevel = 1
  } = params;

  try {
    console.log(`🎓 Minting NFT for unit: ${unitName}`);

    // Obtener el contrato
    const contract = await sdk.getContract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
    );

    // Metadata del NFT
    const metadata = {
      name: `${courseName} - ${unitName}`,
      description: `Certificado de completitud para la unidad "${unitName}" del curso "${courseName}"`,
      image: await generateCertificateImage({
        courseName,
        unitName,
        userLevel,
        completedAt: new Date().toLocaleDateString("es-ES")
      }),
      attributes: [
        {
          trait_type: "Course",
          value: courseName
        },
        {
          trait_type: "Unit",
          value: unitName
        },
        {
          trait_type: "Level",
          value: userLevel
        },
        {
          trait_type: "Completed Date",
          value: new Date().toISOString().split("T")[0]
        },
        {
          trait_type: "Type",
          value: "Educational Certificate"
        }
      ]
    };

    // Mintear NFT
    const tx = await contract.erc721.mintTo(userAddress, metadata);
    console.log(`✅ NFT minted! Transaction: ${tx.receipt.transactionHash}`);

    // Guardar en base de datos
    const nftRecord = await prisma.educationalNFT.create({
      data: {
        tokenId: tx.id.toString(),
        userId,
        unitId,
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        transactionHash: tx.receipt.transactionHash,
        metadataUri: `ipfs://${tx.receipt.logs[0]?.topics[0] || "pending"}`
      }
    });

    return {
      tokenId: tx.id.toString(),
      transactionHash: tx.receipt.transactionHash,
      nftRecord
    };
  } catch (error) {
    console.error("❌ Error minting NFT:", error);
    throw error;
  }
}

// Función para generar imagen del certificado
async function generateCertificateImage(params: {
  courseName: string;
  unitName: string;
  userLevel: number;
  completedAt: string;
}): Promise<string> {
  const defaultImages = {
    1: "https://gateway.pinata.cloud/ipfs/bafybeibc25ly62n6bt76lxnmd3ql2tm7baefmymycd3jkw3jeq7xp5xccq",
    2: "https://gateway.pinata.cloud/ipfs/bafybeia25ohj632vt35cl242hrqtubxjmqsbgwyrhydjkdeigtxt7thbye",
    3: "https://gateway.pinata.cloud/ipfs/bafybeibc25ly62n6bt76lxnmd3ql2tm7baefmymycd3jkw3jeq7xp5xccq"
  };
  return (
    defaultImages[params.userLevel as keyof typeof defaultImages] ||
    defaultImages[1]
  );
}
