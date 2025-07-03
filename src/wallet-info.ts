import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import bs58 from "bs58";
import { defaultConfig, TOKEN_NAMES } from "./config";
import { formatSOL, getTokenBalance } from "./utils";

class WalletInfo {
  private connection: Connection;
  private wallet: Keypair;

  constructor(privateKey: string = defaultConfig.PRIVATE_KEY) {
    this.connection = new Connection(defaultConfig.RPC_URL, "confirmed");
    this.wallet = Keypair.fromSecretKey(bs58.decode(privateKey));
  }

  async getSOLBalance(): Promise<number> {
    return await this.connection.getBalance(this.wallet.publicKey);
  }

  async getTokenBalances(): Promise<{ [mint: string]: number }> {
    const balances: { [mint: string]: number } = {};

    for (const [mint, name] of Object.entries(TOKEN_NAMES)) {
      try {
        const balance = await getTokenBalance(
          this.connection,
          this.wallet.publicKey,
          new PublicKey(mint)
        );
        if (balance > 0) {
          balances[mint] = balance;
        }
      } catch (error) {
        // Token account doesn't exist or has zero balance
      }
    }

    return balances;
  }

  async checkTokenAccount(mint: string): Promise<boolean> {
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        new PublicKey(mint),
        this.wallet.publicKey
      );

      const accountInfo = await this.connection.getAccountInfo(tokenAccount);
      return accountInfo !== null;
    } catch (error) {
      return false;
    }
  }

  async displayWalletInfo(): Promise<void> {
    console.log("💰 Wallet Information");
    console.log("=".repeat(50));
    console.log("📍 Address:", this.wallet.publicKey.toBase58());
    console.log("");

    // Get SOL balance
    const solBalance = await this.getSOLBalance();
    console.log("💎 SOL Balance:", formatSOL(solBalance));
    console.log("");

    // Get token balances
    console.log("🪙 Token Balances:");
    const tokenBalances = await this.getTokenBalances();

    if (Object.keys(tokenBalances).length === 0) {
      console.log("  No tokens found");
    } else {
      for (const [mint, balance] of Object.entries(tokenBalances)) {
        const tokenName = TOKEN_NAMES[mint] || mint.slice(0, 8) + "...";
        console.log(`  ${tokenName}:`, balance);
      }
    }

    console.log("");
    console.log("🏦 Token Account Status:");
    for (const [mint, name] of Object.entries(TOKEN_NAMES)) {
      const exists = await this.checkTokenAccount(mint);
      console.log(`  ${name}:`, exists ? "✅ Created" : "❌ Not created");
    }

    console.log("");
    console.log("🔧 Fee Account:", defaultConfig.FEE_ACCOUNT);
    console.log("💸 Platform Fee:", defaultConfig.PLATFORM_FEE_BPS, "bps");
    console.log("=".repeat(50));
  }
}

async function main() {
  console.log("🔍 Wallet Inspector");
  console.log("");

  const walletInfo = new WalletInfo();
  await walletInfo.displayWalletInfo();
}

if (require.main === module) {
  main().catch(console.error);
}

export default WalletInfo;
