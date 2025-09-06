import { ethers } from "ethers";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY!;

export function createUserWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
}

export function encryptPrivateKey(privateKey: string): string {
  const cipher = crypto.createCipher("aes-256-cbc", ENCRYPTION_KEY);
  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decryptPrivateKey(encryptedKey: string): string {
  const decipher = crypto.createDecipher("aes-256-cbc", ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedKey, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
