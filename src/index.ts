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
import { SwapConfig, defaultConfig } from "./config";
import {
  getTokenName,
  formatAmount,
  formatSOL,
  getTokenBalance,
  checkTokenAccountExists,
  sleep,
  calculateFeeAmount,
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

class JupiterSwapWithFees {
  private connection: Connection;
  private wallet: Keypair;
  private feeAccount: PublicKey;
  private config: SwapConfig;

  constructor(config: SwapConfig = defaultConfig) {
    // Validate configuration
    if (!validatePrivateKey(config.PRIVATE_KEY)) {
      throw new Error("Invalid private key provided");
    }
    if (!validatePublicKey(config.FEE_ACCOUNT)) {
      throw new Error("Invalid fee account provided");
    }

    this.config = config;
    this.connection = new Connection(config.RPC_URL, "confirmed");
    this.wallet = Keypair.fromSecretKey(bs58.decode(config.PRIVATE_KEY));
    this.feeAccount = new PublicKey(config.FEE_ACCOUNT);

    console.log("🚀 Jupiter Swap with Fees initialized");
    console.log("💰 Wallet Address:", this.wallet.publicKey.toBase58());
    console.log("🏦 Fee Account:", this.feeAccount.toBase58());
    console.log(
      "💸 Platform Fee:",
      config.PLATFORM_FEE_BPS,
      "bps (",
      (config.PLATFORM_FEE_BPS / 100).toFixed(2),
      "%)"
    );
  }

  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = this.config.SLIPPAGE_BPS
  ): Promise<QuoteResponse> {
    const url =
      `https://lite-api.jup.ag/swap/v1/quote` +
      `?inputMint=${inputMint}` +
      `&outputMint=${outputMint}` +
      `&amount=${amount}` +
      `&slippageBps=${slippageBps}` +
      `&restrictIntermediateTokens=true` +
      `&platformFeeBps=${this.config.PLATFORM_FEE_BPS}`;

    console.log("📊 Getting quote from Jupiter API...");
    console.log(
      "🔄 Swapping:",
      getTokenName(inputMint),
      "→",
      getTokenName(outputMint)
    );

    // Determine decimals based on token
    const inputDecimals =
      inputMint === "So11111111111111111111111111111111111111112" ? 9 : 6;
    const outputDecimals =
      outputMint === "So11111111111111111111111111111111111111112" ? 9 : 6;

    console.log(
      "💰 Amount:",
      formatAmount(amount.toString(), inputDecimals),
      getTokenName(inputMint)
    );
    console.log("🎯 Slippage:", slippageBps, "bps");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to get quote: ${response.status} ${response.statusText}`
      );
    }

    const quoteResponse = (await response.json()) as QuoteResponse;

    console.log("✅ Quote received:");
    console.log(
      "  Input:",
      formatAmount(quoteResponse.inAmount, inputDecimals),
      getTokenName(inputMint)
    );
    console.log(
      "  Output:",
      formatAmount(quoteResponse.outAmount, outputDecimals),
      getTokenName(outputMint)
    );
    console.log("  Price Impact:", quoteResponse.priceImpactPct, "%");

    if (quoteResponse.platformFee) {
      console.log(
        "  Platform Fee:",
        formatAmount(quoteResponse.platformFee.amount, inputDecimals),
        getTokenName(inputMint)
      );
      console.log("  Fee BPS:", quoteResponse.platformFee.feeBps);
    }

    return quoteResponse;
  }

  async getSwapTransaction(
    quoteResponse: QuoteResponse
  ): Promise<SwapResponse> {
    const swapBody = {
      quoteResponse,
      userPublicKey: this.wallet.publicKey.toBase58(),
      feeAccount: this.feeAccount.toBase58(),
      wrapAndUnwrapSol: true,
      useSharedAccounts: true,
      prioritizationFeeLamports: this.config.PRIORITY_FEE_LAMPORTS,
      asLegacyTransaction: false,
      useTokenLedger: false,
      destinationTokenAccount: null,
      dynamicComputeUnitLimit: true,
      skipUserAccountsRpcCalls: false,
    };

    console.log("🔄 Getting swap transaction...");

    const response = await fetch("https://api.jup.ag/swap/v1/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(swapBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get swap transaction: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    const swapResponse = (await response.json()) as SwapResponse;
    console.log("✅ Swap transaction received");

    return swapResponse;
  }

  async executeSwap(swapResponse: SwapResponse): Promise<string> {
    try {
      // Deserialize the transaction
      const swapTransactionBuf = Buffer.from(
        swapResponse.swapTransaction,
        "base64"
      );
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      console.log("✍️ Signing transaction...");

      // Sign the transaction
      transaction.sign([this.wallet]);

      console.log("📡 Sending transaction...");

      // Send the transaction
      const signature = await this.connection.sendTransaction(transaction, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 3,
      });

      console.log("⏳ Waiting for confirmation...");

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(
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

      return signature;
    } catch (error) {
      console.error("❌ Error executing swap:", error);
      throw error;
    }
  }

  async checkTokenBalance(tokenMint: string): Promise<number> {
    return await getTokenBalance(
      this.connection,
      this.wallet.publicKey,
      new PublicKey(tokenMint)
    );
  }

  async performSwap(): Promise<void> {
    try {
      console.log("🔄 Starting swap process...");

      // Check initial balances
      const solBalance = await this.connection.getBalance(
        this.wallet.publicKey
      );
      const outputTokenBalance = await this.checkTokenBalance(
        this.config.OUTPUT_TOKEN
      );

      console.log("💰 Initial balances:");
      console.log("  SOL:", formatSOL(solBalance));
      console.log(
        " ",
        getTokenName(this.config.OUTPUT_TOKEN) + ":",
        outputTokenBalance
      );

      // Check if we have enough SOL
      const requiredSOL = this.config.SWAP_AMOUNT + 5000000; // Add 0.005 SOL for transaction fees
      if (solBalance < requiredSOL) {
        throw new Error(
          `Insufficient SOL balance. Required: ${formatSOL(
            requiredSOL
          )}, Available: ${formatSOL(solBalance)}`
        );
      }

      // Get quote
      const quote = await this.getQuote(
        this.config.INPUT_TOKEN,
        this.config.OUTPUT_TOKEN,
        this.config.SWAP_AMOUNT
      );

      // Get swap transaction
      const swapTransaction = await this.getSwapTransaction(quote);

      // Execute swap
      const signature = await this.executeSwap(swapTransaction);

      // Wait a moment for balances to update
      await sleep(5000);

      // Check final balances
      const finalSolBalance = await this.connection.getBalance(
        this.wallet.publicKey
      );
      const finalOutputTokenBalance = await this.checkTokenBalance(
        this.config.OUTPUT_TOKEN
      );

      console.log("💰 Final balances:");
      console.log("  SOL:", formatSOL(finalSolBalance));
      console.log(
        " ",
        getTokenName(this.config.OUTPUT_TOKEN) + ":",
        finalOutputTokenBalance
      );

      // Calculate changes
      const solChange = finalSolBalance - solBalance;
      const outputTokenChange = finalOutputTokenBalance - outputTokenBalance;

      console.log("📊 Changes:");
      console.log("  SOL:", solChange > 0 ? "+" : "", formatSOL(solChange));
      console.log(
        " ",
        getTokenName(this.config.OUTPUT_TOKEN) + ":",
        outputTokenChange > 0 ? "+" : "",
        outputTokenChange
      );

      console.log("✅ Swap completed successfully!");
    } catch (error) {
      console.error("❌ Swap failed:", error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting Jupiter Swap with Fees Example");
  console.log("=".repeat(50));

  const swapper = new JupiterSwapWithFees();

  try {
    await swapper.performSwap();
  } catch (error) {
    console.error("💥 Program failed:", error);
    process.exit(1);
  }

  console.log("=".repeat(50));
  console.log("✅ Program completed successfully!");
}

// Run the program
if (require.main === module) {
  main().catch(console.error);
}

export default JupiterSwapWithFees;
export { JupiterSwapWithFees };
