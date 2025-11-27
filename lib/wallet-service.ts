import { createUserWallet, encryptPrivateKey } from "./wallet-utils";
import prisma from "./prisma";

export async function createWalletForUser(userId: string): Promise<string> {
  try {
    console.log(`🔐 Creating wallet for user: ${userId}`);

    const wallet = createUserWallet();
    const encryptedKey = encryptPrivateKey(wallet.privateKey);

    await prisma.user.update({
      where: { id: userId },
      data: {
        walletAddress: wallet.address,
        encryptedKey: encryptedKey
      }
    });

    console.log(`✅ Wallet created: ${wallet.address}`);
    return wallet.address;
  } catch (error) {
    console.error("❌ Error creating wallet:", error);
    throw error;
  }
}
