import { JupiterSwapWithFees } from "./index";
import { SwapConfig, defaultConfig } from "./config";

// Example 1: Using default configuration (SOL → USDC)
async function example1() {
  console.log("🚀 Example 1: Default SOL → USDC Swap");
  console.log("=".repeat(50));

  const swapper = new JupiterSwapWithFees();

  try {
    await swapper.performSwap();
  } catch (error) {
    console.error("Example 1 failed:", error);
  }

  console.log("=".repeat(50));
  console.log("");
}

// Example 2: Custom configuration with different tokens
async function example2() {
  console.log("🚀 Example 2: Custom Configuration (SOL → USDT)");
  console.log("=".repeat(50));

  const customConfig: SwapConfig = {
    ...defaultConfig,
    OUTPUT_TOKEN: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
    SWAP_AMOUNT: 50000000, // 0.05 SOL
    PLATFORM_FEE_BPS: 50, // 0.5%
    SLIPPAGE_BPS: 100, // 1%
  };

  const swapper = new JupiterSwapWithFees(customConfig);

  try {
    await swapper.performSwap();
  } catch (error) {
    console.error("Example 2 failed:", error);
  }

  console.log("=".repeat(50));
  console.log("");
}

// Example 3: Quote only (without executing swap)
async function example3() {
  console.log("🚀 Example 3: Quote Only (No Swap Execution)");
  console.log("=".repeat(50));

  const swapper = new JupiterSwapWithFees();

  try {
    // Just get a quote without executing the swap
    const quote = await swapper.getQuote(
      "So11111111111111111111111111111111111111112", // SOL
      "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", // JUP
      100000000 // 0.1 SOL
    );

    console.log("📊 Quote Summary:");
    console.log("  Route found:", quote.routePlan.length > 0 ? "Yes" : "No");
    console.log("  Price impact:", quote.priceImpactPct + "%");
    console.log("  Time taken:", quote.timeTaken + "ms");
  } catch (error) {
    console.error("Example 3 failed:", error);
  }

  console.log("=".repeat(50));
  console.log("");
}

// Main function to run examples
async function runExamples() {
  console.log("🎯 Jupiter Swap Examples");
  console.log("⚠️  WARNING: These examples use real tokens on mainnet!");
  console.log("⚠️  Make sure you have sufficient SOL balance before running.");
  console.log(
    "⚠️  Only run Example 1 or 2 if you want to perform actual swaps."
  );
  console.log("");

  // Run quote-only example (safe)
  await example3();

  // Uncomment the lines below to run actual swap examples
  // await example1();
  // await example2();
}

// Execute examples
if (require.main === module) {
  runExamples().catch(console.error);
}

export { example1, example2, example3 };
