import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { ReferralProvider } from "@jup-ag/referral-sdk";
import bs58 from "bs58";
import { defaultConfig } from "./config";
import { validatePrivateKey, validatePublicKey, getTokenName } from "./utils";

async function createReferralTokenAccount() {
  console.log("🔧 Creating Referral Token Account");
  console.log("=".repeat(50));

  // Validate configuration
  if (!validatePrivateKey(defaultConfig.PRIVATE_KEY)) {
    throw new Error("Invalid private key");
  }

  if (!validatePublicKey(defaultConfig.REFFERAL_ACCOUNT)) {
    throw new Error("Invalid fee account");
  }

  // Create connection and wallet
  const connection = new Connection(defaultConfig.RPC_URL, "confirmed");
  const wallet = Keypair.fromSecretKey(bs58.decode(defaultConfig.PRIVATE_KEY));
  const referralAccount = new PublicKey(defaultConfig.REFFERAL_ACCOUNT);

  // For SOL to USDC swap, we need a USDC token account for fees
  const mintAccount = new PublicKey(defaultConfig.OUTPUT_TOKEN);

  console.log("💰 Wallet Address:", wallet.publicKey.toBase58());
  console.log("🎯 Referral Account:", referralAccount.toBase58());
  console.log("🪙 Mint Token:", getTokenName(defaultConfig.OUTPUT_TOKEN));
  console.log("🆔 Mint Address:", mintAccount.toBase58());
  console.log("");

  try {
    // Initialize referral provider
    const provider = new ReferralProvider(connection);

    console.log("🔨 Creating referral token account...");

    const { referralTokenAccountPubKey } =
      await provider.initializeReferralTokenAccount({
        payerPubKey: wallet.publicKey,
        referralAccountPubKey: referralAccount,
        mint: mintAccount,
      });

    console.log("✅ Referral token account created successfully!");
    console.log(
      "📍 Token Account Address:",
      referralTokenAccountPubKey.toBase58()
    );
    console.log("");
    console.log(
      "🎯 Use this token account address as your feeAccount in Jupiter swap API calls"
    );
    console.log(
      "💡 This account can now receive",
      getTokenName(defaultConfig.OUTPUT_TOKEN),
      "tokens as platform fees"
    );
  } catch (error) {
    console.error("❌ Failed to create referral token account:", error);
    throw error;
  }

  console.log("=".repeat(50));
}

// Run the function
if (require.main === module) {
  createReferralTokenAccount().catch(console.error);
}

export { createReferralTokenAccount };
