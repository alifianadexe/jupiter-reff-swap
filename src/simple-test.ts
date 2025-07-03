import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import bs58 from "bs58";
import fetch from "node-fetch";
import { defaultConfig } from "./config";
import {
  getTokenName,
  formatAmount,
  formatSOL,
  getTokenBalance,
  validatePrivateKey,
  validatePublicKey,
} from "./utils";

interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: any[];
  contextSlot: number;
  timeTaken: number;
}

async function testQuote() {
  console.log("🧪 Testing Jupiter Quote API");
  console.log("=".repeat(50));

  // Validate private key
  if (!validatePrivateKey(defaultConfig.PRIVATE_KEY)) {
    throw new Error("Invalid private key");
  }

  // Create connection and wallet
  const connection = new Connection(defaultConfig.RPC_URL, "confirmed");
  const wallet = Keypair.fromSecretKey(bs58.decode(defaultConfig.PRIVATE_KEY));

  console.log("💰 Wallet Address:", wallet.publicKey.toBase58());

  // Check balance
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("💎 SOL Balance:", formatSOL(balance));

  // Create quote URL
  const url =
    `https://lite-api.jup.ag/swap/v1/quote` +
    `?inputMint=${defaultConfig.INPUT_TOKEN}` +
    `&outputMint=${defaultConfig.OUTPUT_TOKEN}` +
    `&amount=${defaultConfig.SWAP_AMOUNT}` +
    `&slippageBps=${defaultConfig.SLIPPAGE_BPS}` +
    `&restrictIntermediateTokens=true` +
    `&platformFeeBps=${defaultConfig.PLATFORM_FEE_BPS}`;

  console.log("📊 Getting quote...");
  console.log(
    "🔄 Swapping:",
    formatAmount(defaultConfig.SWAP_AMOUNT.toString(), 9),
    "SOL → USDC"
  );

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const quote = (await response.json()) as QuoteResponse;

    console.log("✅ Quote received:");
    console.log("  Input:", formatAmount(quote.inAmount, 9), "SOL");
    console.log("  Output:", formatAmount(quote.outAmount, 6), "USDC");
    console.log("  Price Impact:", quote.priceImpactPct, "%");
    console.log("  Route Plans:", quote.routePlan.length);

    if (quote.platformFee) {
      console.log(
        "  Platform Fee:",
        formatAmount(quote.platformFee.amount, 9),
        "SOL"
      );
      console.log("  Fee BPS:", quote.platformFee.feeBps);
    }

    console.log("");
    console.log("🎯 Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }

  console.log("=".repeat(50));
}

if (require.main === module) {
  testQuote().catch(console.error);
}
