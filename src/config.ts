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

export const defaultConfig: SwapConfig = {
  RPC_URL: "https://api.mainnet-beta.solana.com",
  PRIVATE_KEY:
    "R4v3drTsiRkGesVpA6ivwM5UEmHcTHefZjhQJrDjBefi1EYv6tVvVCZWS2k8z53RziYwehzJrS1HQSSMeujHX9p",
  REFFERAL_ACCOUNT: "jWYWeXGCNDM8EbuGM6oVhUUfkc875CP4KmkS4VGLu25",
  FEE_ACCOUNT: "4JF9VBJKVKdNimntgm4BsYDuxF7nGv8jkieiXUZ7UczV",
  PLATFORM_FEE_BPS: 20, // 0.2%
  INPUT_TOKEN: "So11111111111111111111111111111111111111112", // SOL
  OUTPUT_TOKEN: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  SWAP_AMOUNT: 10000000, // 0.01 SOL (10 million lamports)
  SLIPPAGE_BPS: 50, // 0.5%
  PRIORITY_FEE_LAMPORTS: "auto",
};

export const TOKEN_NAMES: { [key: string]: string } = {
  So11111111111111111111111111111111111111112: "SOL",
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: "JUP",
  mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: "mSOL",
};
