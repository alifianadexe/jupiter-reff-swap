import { defaultConfig } from "./config";

console.log("🔧 Configuration Test");
console.log("═══════════════════════════════════════");

try {
  console.log("✅ Config loaded successfully");
  console.log(`📡 RPC URL: ${defaultConfig.RPC_URL}`);
  console.log(`💰 Fee Account: ${defaultConfig.FEE_ACCOUNT}`);
  console.log(`🔗 Referral Account: ${defaultConfig.REFFERAL_ACCOUNT}`);
  console.log(`💸 Platform Fee: ${defaultConfig.PLATFORM_FEE_BPS} bps`);
  console.log(`🎯 Slippage: ${defaultConfig.SLIPPAGE_BPS} bps`);
  console.log(`💰 Swap Amount: ${defaultConfig.SWAP_AMOUNT} lamports`);
  console.log(`🏷️ Input Token: ${defaultConfig.INPUT_TOKEN}`);
  console.log(`🏷️ Output Token: ${defaultConfig.OUTPUT_TOKEN}`);

  // Check if private key is loaded (without displaying it)
  if (defaultConfig.PRIVATE_KEY && defaultConfig.PRIVATE_KEY.length > 0) {
    console.log("🔑 Private key: ✅ Loaded from .env");
  } else {
    console.log("🔑 Private key: ❌ Not found in .env");
  }

  console.log("\n📝 Next steps:");
  console.log("1. Add your PRIVATE_KEY to the .env file");
  console.log("2. Run: npm run wallet-info");
  console.log("3. Run: npm run simple-test");
} catch (error) {
  console.error("❌ Configuration error:", error);
  console.log("\n🔧 Make sure to:");
  console.log("1. Copy .env.example to .env");
  console.log("2. Fill in your PRIVATE_KEY in .env");
}
