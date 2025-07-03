import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TOKEN_NAMES } from "./config";

export function getTokenName(mint: string): string {
  return TOKEN_NAMES[mint] || mint.slice(0, 8) + "...";
}

export function formatAmount(
  amount: string | number,
  decimals: number = 9
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return (num / Math.pow(10, decimals)).toFixed(decimals);
}

export function formatSOL(lamports: number): string {
  return (lamports / 1e9).toFixed(9);
}

export async function getTokenBalance(
  connection: Connection,
  walletAddress: PublicKey,
  tokenMint: PublicKey
): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      walletAddress
    );
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return balance.value.uiAmount || 0;
  } catch (error) {
    console.log(
      `Token account for ${tokenMint.toBase58()} not found or has zero balance`
    );
    return 0;
  }
}

export async function checkTokenAccountExists(
  connection: Connection,
  walletAddress: PublicKey,
  tokenMint: PublicKey
): Promise<boolean> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      walletAddress
    );
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    return accountInfo !== null;
  } catch (error) {
    return false;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function calculateFeeAmount(amount: number, feeBps: number): number {
  return Math.floor((amount * feeBps) / 10000);
}

export function validatePrivateKey(privateKey: string): boolean {
  try {
    const decoded = require("bs58").decode(privateKey);
    return decoded.length === 64;
  } catch (error) {
    return false;
  }
}

export function validatePublicKey(publicKey: string): boolean {
  try {
    new PublicKey(publicKey);
    return true;
  } catch (error) {
    return false;
  }
}

export function logTransaction(
  signature: string,
  network: string = "mainnet-beta"
): void {
  console.log("🔗 Transaction signature:", signature);
  console.log(
    "🌐 Explorer URL:",
    `https://explorer.solana.com/tx/${signature}?cluster=${network}`
  );
  console.log(
    "📊 SolanaFM URL:",
    `https://solana.fm/tx/${signature}?cluster=${network}-solanafm`
  );
}
