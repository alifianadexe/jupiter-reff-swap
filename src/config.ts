import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export interface SwapConfig {
  // RPC configuration
  RPC_URL: string;

  // Wallet configuration
  PRIVATE_KEY: string;

  // Fee configuration
  REFFERAL_ACCOUNT: string;
  FEE_ACCOUNT: string;
  PLATFORM_FEE_BPS: number; // Fee in basis points (e.g., 20 = 0.2%)

  // Token configuration
  INPUT_TOKEN: string;
  OUTPUT_TOKEN: string;
  SWAP_AMOUNT: number; // Amount in smallest units

  // Transaction configuration
  SLIPPAGE_BPS: number; // Slippage in basis points (e.g., 50 = 0.5%)
  PRIORITY_FEE_LAMPORTS: number | "auto";
}

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Please check your .env file.`
    );
  }
  return value;
}

function getEnvVarAsNumber(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(
      `Environment variable ${name} must be a valid number. Got: ${value}`
    );
  }
  return parsed;
}

function getEnvVarAsNumberOrString(
  name: string,
  defaultValue: number | "auto"
): number | "auto" {
  const value = process.env[name];
  if (!value) return defaultValue;
  if (value === "auto") return "auto";
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(
      `Environment variable ${name} must be a valid number or "auto". Got: ${value}`
    );
  }
  return parsed;
}

export const defaultConfig: SwapConfig = {
  RPC_URL: process.env.RPC_URL || "https://api.mainnet-beta.solana.com",
  PRIVATE_KEY: getRequiredEnvVar("PRIVATE_KEY"),
  REFFERAL_ACCOUNT:
    process.env.REFFERAL_ACCOUNT ||
    "jWYWeXGCNDM8EbuGM6oVhUUfkc875CP4KmkS4VGLu25",
  FEE_ACCOUNT:
    process.env.FEE_ACCOUNT || "4JF9VBJKVKdNimntgm4BsYDuxF7nGv8jkieiXUZ7UczV",
  PLATFORM_FEE_BPS: getEnvVarAsNumber("PLATFORM_FEE_BPS", 20), // 0.2%
  INPUT_TOKEN:
    process.env.INPUT_TOKEN || "So11111111111111111111111111111111111111112", // SOL
  OUTPUT_TOKEN:
    process.env.OUTPUT_TOKEN || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  SWAP_AMOUNT: getEnvVarAsNumber("SWAP_AMOUNT", 10000000), // 0.01 SOL (10 million lamports)
  SLIPPAGE_BPS: getEnvVarAsNumber("SLIPPAGE_BPS", 50), // 0.5%
  PRIORITY_FEE_LAMPORTS: getEnvVarAsNumberOrString(
    "PRIORITY_FEE_LAMPORTS",
    "auto"
  ),
};

export const TOKEN_NAMES: { [key: string]: string } = {
  So11111111111111111111111111111111111111112: "SOL",
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: "JUP",
  mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: "mSOL",
};
