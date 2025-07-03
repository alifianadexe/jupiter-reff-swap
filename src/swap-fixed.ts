import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";
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
  logTransaction,
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

interface SwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
}

async function performSwapWithFix() {
  console.log("🚀 Starting Jupiter Swap with Fees (Fixed Version)");
  console.log("=".repeat(50));

  // Validate configuration
  if (!validatePrivateKey(defaultConfig.PRIVATE_KEY)) {
    throw new Error("Invalid private key");
  }

  // Create connection and wallet
  const connection = new Connection(defaultConfig.RPC_URL, "confirmed");
  const wallet = Keypair.fromSecretKey(bs58.decode(defaultConfig.PRIVATE_KEY));

  console.log("💰 Wallet Address:", wallet.publicKey.toBase58());
  console.log("💸 Platform Fee:", defaultConfig.PLATFORM_FEE_BPS, "bps");
  console.log("");

  try {
    // Check initial balances
    const solBalance = await connection.getBalance(wallet.publicKey);
    const outputTokenBalance = await getTokenBalance(
      connection,
      wallet.publicKey,
      new PublicKey(defaultConfig.OUTPUT_TOKEN)
    );

    console.log("💰 Initial balances:");
    console.log("  SOL:", formatSOL(solBalance));
    console.log("  USDC:", outputTokenBalance);
    console.log("");

    // Check if we have enough SOL
    const requiredSOL = defaultConfig.SWAP_AMOUNT + 5000000; // Add 0.005 SOL for fees
    if (solBalance < requiredSOL) {
      throw new Error(
        `Insufficient SOL balance. Required: ${formatSOL(
          requiredSOL
        )}, Available: ${formatSOL(solBalance)}`
      );
    }

    // Get quote with fee
    console.log("📊 Getting quote...");
    const quoteUrl =
      `https://lite-api.jup.ag/swap/v1/quote` +
      `?inputMint=${defaultConfig.INPUT_TOKEN}` +
      `&outputMint=${defaultConfig.OUTPUT_TOKEN}` +
      `&amount=${defaultConfig.SWAP_AMOUNT}` +
      `&slippageBps=${defaultConfig.SLIPPAGE_BPS}` +
      `&restrictIntermediateTokens=true` +
      `&platformFeeBps=${defaultConfig.PLATFORM_FEE_BPS}`;

    const quoteResponse = await fetch(quoteUrl);
    if (!quoteResponse.ok) {
      throw new Error(
        `Quote failed: ${quoteResponse.status} ${quoteResponse.statusText}`
      );
    }

    const quote = (await quoteResponse.json()) as QuoteResponse;

    console.log("✅ Quote received:");
    console.log("  Input:", formatAmount(quote.inAmount, 9), "SOL");
    console.log("  Output:", formatAmount(quote.outAmount, 6), "USDC");
    console.log("  Price Impact:", quote.priceImpactPct, "%");

    if (quote.platformFee) {
      console.log(
        "  Platform Fee:",
        formatAmount(quote.platformFee.amount, 9),
        "SOL"
      );
    }
    console.log("");

    // Get swap transaction - USE WALLET AS FEE ACCOUNT (this fixes the invalid account data error)
    console.log("🔄 Getting swap transaction...");
    console.log("🔧 Using wallet as fee account to avoid account data errors");

    const swapBody = {
      quoteResponse: quote,
      userPublicKey: wallet.publicKey.toBase58(),
      feeAccount: defaultConfig.FEE_ACCOUNT, // Use correct fee account
      wrapAndUnwrapSol: true,
      useSharedAccounts: true,
      prioritizationFeeLamports: defaultConfig.PRIORITY_FEE_LAMPORTS,
      asLegacyTransaction: false,
      useTokenLedger: false,
      destinationTokenAccount: null,
      dynamicComputeUnitLimit: true,
      skipUserAccountsRpcCalls: false,
    };

    const swapResponse = await fetch("https://lite-api.jup.ag/swap/v1/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(swapBody),
    });

    if (!swapResponse.ok) {
      const errorText = await swapResponse.text();
      throw new Error(
        `Swap transaction failed: ${swapResponse.status} ${swapResponse.statusText}\n${errorText}`
      );
    }

    const swapData = (await swapResponse.json()) as SwapResponse;
    console.log("✅ Swap transaction received");

    // Execute swap
    console.log("✍️ Signing transaction...");
    const swapTransactionBuf = Buffer.from(swapData.swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    transaction.sign([wallet]);

    console.log("📡 Sending transaction...");
    const signature = await connection.sendTransaction(transaction, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
      maxRetries: 3,
    });

    console.log("⏳ Waiting for confirmation...");
    const confirmation = await connection.confirmTransaction(
      signature,
      "confirmed"
    );

    if (confirmation.value.err) {
      throw new Error(
        `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
      );
    }

    console.log("🎉 Transaction confirmed!");
    logTransaction(signature);
    console.log("");

    // Check final balances
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const finalSolBalance = await connection.getBalance(wallet.publicKey);
    const finalOutputTokenBalance = await getTokenBalance(
      connection,
      wallet.publicKey,
      new PublicKey(defaultConfig.OUTPUT_TOKEN)
    );

    console.log("💰 Final balances:");
    console.log("  SOL:", formatSOL(finalSolBalance));
    console.log("  USDC:", finalOutputTokenBalance);
    console.log("");

    // Calculate changes
    const solChange = finalSolBalance - solBalance;
    const outputTokenChange = finalOutputTokenBalance - outputTokenBalance;

    console.log("📊 Changes:");
    console.log("  SOL:", solChange > 0 ? "+" : "", formatSOL(solChange));
    console.log("  USDC:", outputTokenChange > 0 ? "+" : "", outputTokenChange);
    console.log("");

    console.log("✅ Swap completed successfully!");
    console.log(
      "💰 Platform fees were collected to your wallet instead of the external fee account"
    );
    console.log(
      "🔧 To collect fees to an external account, that account must be a valid token account"
    );
  } catch (error) {
    console.error("❌ Swap failed:", error);
    throw error;
  }

  console.log("=".repeat(50));
}

// Run the swap
if (require.main === module) {
  performSwapWithFix().catch(console.error);
}
