import { NextRequest, NextResponse } from "next/server";
import { createThirdwebClient, getContract, sendTransaction } from "thirdweb";
import { mintTo, tokenURI } from "thirdweb/extensions/erc721";
import { privateKeyToAccount } from "thirdweb/wallets";
import { polygonAmoy } from "thirdweb/chains";
import { getRpcClient, eth_getTransactionReceipt } from "thirdweb/rpc";
import prisma from "@/lib/prisma";

const ADMIN_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY;
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const CONTRACT_ADDRESS = process.env.THIRDWEB_CONTRACT_ADDRESS!;

if (!ADMIN_PRIVATE_KEY)
  throw new Error("Falta ADMIN_WALLET_PRIVATE_KEY en env");
if (!THIRDWEB_SECRET_KEY) throw new Error("Falta THIRDWEB_SECRET_KEY en env");

/** Evento Transfer topic (ERC-721 estándar) */
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

/** Inicializar thirdweb client + account admin */
const client = createThirdwebClient({ secretKey: THIRDWEB_SECRET_KEY });
const account = privateKeyToAccount({ client, privateKey: ADMIN_PRIVATE_KEY });

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    const unitId = body.unitId ?? body.tokenUnit;

    if (!unitId)
      return NextResponse.json(
        { error: "unitId es requerido" },
        { status: 400 }
      );

    // 1) Obtener user + unit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userUnitTokens: { include: { unit: true } } }
    });

    if (!user)
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    if (!user.walletAddress)
      return NextResponse.json(
        { error: "Usuario sin walletAddress" },
        { status: 400 }
      );

    const userUnitToken = user.userUnitTokens.find(
      (t) => t.unitId === Number(unitId)
    );
    if (!userUnitToken || userUnitToken.quantity <= 0) {
      return NextResponse.json(
        { error: "No hay tokens disponibles para esta unidad" },
        { status: 400 }
      );
    }

    // 2) Metadata NFT
    const courseName = "Almanac";
    const unitName = userUnitToken.unit.name;
    const metadata = {
      name: `${courseName} - ${unitName}`,
      description: `Certificado de completitud para la unidad "${unitName}" del curso "${courseName}"`,
      image:
        "https://gateway.pinata.cloud/ipfs/bafybeia25ohj632vt35cl242hrqtubxjmqsbgwyrhydjkdeigtxt7thbye",
      attributes: [
        { trait_type: "Course", value: courseName },
        { trait_type: "Unit", value: unitName },
        {
          trait_type: "Completed Date",
          value: new Date().toISOString().split("T")[0]
        },
        { trait_type: "Type", value: "Educational Certificate" }
      ]
    };

    // 3) Inicializar contrato
    const contract = getContract({
      client,
      chain: polygonAmoy,
      address: CONTRACT_ADDRESS
    });

    // 4) Crear transacción
    const transaction = mintTo({
      contract,
      to: user.walletAddress,
      nft: metadata
    });

    // 5) Enviar transacción
    const { transactionHash } = await sendTransaction({ account, transaction });
    if (!transactionHash) {
      return NextResponse.json(
        { error: "No se obtuvo transactionHash" },
        { status: 500 }
      );
    }

    // 6) Obtener receipt vía RPC
    const rpcRequest = getRpcClient({ client, chain: polygonAmoy });
    // const receipt = await eth_getTransactionReceipt(rpcRequest, {
    //   hash: transactionHash
    // });

    const receipt = await waitForReceipt(rpcRequest, transactionHash);

    // 7) Parsear logs para obtener tokenId
    let tokenId: string | null = null;
    const paddedTo =
      "0x" +
      user.walletAddress.toLowerCase().replace(/^0x/, "").padStart(64, "0");

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase())
        continue;
      if ((log.topics?.[0] ?? "").toLowerCase() !== TRANSFER_TOPIC) continue;
      const topicTo = (log.topics?.[2] ?? "").toLowerCase();
      if (topicTo === paddedTo) {
        const rawId = log.topics?.[3];
        if (rawId) {
          tokenId = BigInt(rawId).toString();
          break;
        }
      }
    }

    // 8) Obtener metadataUri
    let metadataUri: string | null = null;
    if (tokenId) {
      try {
        metadataUri = await tokenURI({ contract, tokenId: BigInt(tokenId) });
      } catch (err) {
        console.error("Error fetching tokenURI:", err);
      }
    }

    // 9) Construir explorerUrl (Amoy)
    const explorerUrl = tokenId
      ? `https://amoy.polygonscan.com/token/${CONTRACT_ADDRESS}?a=${tokenId}`
      : null;

    // 10) Guardar en DB
    const now = new Date();
    const saved = await prisma.$transaction(async (tx) => {
      const newQuantity = userUnitToken.quantity - 1;
      if (newQuantity <= 0) {
        await tx.userUnitToken.delete({ where: { id: userUnitToken.id } });
      } else {
        await tx.userUnitToken.update({
          where: { id: userUnitToken.id },
          data: { quantity: newQuantity, updatedAt: now }
        });
      }

      return tx.educationalNFT.create({
        data: {
          tokenId: tokenId ?? "",
          userId,
          unitId: String(unitId),
          contractAddress: CONTRACT_ADDRESS,
          transactionHash,
          metadataUri: metadataUri ?? JSON.stringify(metadata),
          mintedAt: now
        }
      });
    });

    return NextResponse.json({
      success: true,
      nft: saved,
      tokenId,
      transactionHash,
      metadataUri,
      explorerUrl
    });
  } catch (err: any) {
    console.error("mint endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    );
  }
}

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
      // El error esperado mientras aún no existe el receipt
      if (err.message?.includes("not found")) {
        console.log(
          `Receipt aún no disponible (intento ${i + 1}/${maxRetries})`
        );
      } else {
        throw err; // otros errores son críticos
      }
    }

    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error("Transaction receipt not found after waiting");
}
