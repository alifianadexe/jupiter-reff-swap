# Jupiter Swap with Fees Example

A comprehensive TypeScript program that demonstrates how to swap tokens and collect fees using Jupiter API on Solana.

## 🚀 Features

- **Token Swapping**: Swap any SPL tokens using Jupiter's best routes
- **Fee Collection**: Collect platform fees from swaps in basis points
- **Wallet Management**: Secure wallet operations with private key handling
- **Balance Tracking**: Real-time balance monitoring before and after swaps
- **Error Handling**: Comprehensive error handling and validation
- **Configurable**: Easy configuration for different tokens and fee structures
- **Examples**: Multiple usage examples and utilities

## 📦 Installation

1. Clone or download the project
2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

## 🔧 Configuration

The project uses a configuration file (`src/config.ts`) with the following settings:

- **RPC_URL**: Solana RPC endpoint
- **PRIVATE_KEY**: Your wallet's private key (base58 encoded)
- **FEE_ACCOUNT**: Token account to receive platform fees
- **PLATFORM_FEE_BPS**: Fee in basis points (e.g., 20 = 0.2%)
- **INPUT_TOKEN**: Source token mint address
- **OUTPUT_TOKEN**: Destination token mint address
- **SWAP_AMOUNT**: Amount to swap (in smallest units)
- **SLIPPAGE_BPS**: Allowed slippage in basis points

## 🎯 Usage

### Basic Swap

```bash
npm run dev
```

### Check Wallet Information

```bash
npm run wallet-info
```

### Run Examples

```bash
npm run examples
```

### Quote Only (Safe - No Actual Swap)

```bash
npm run quote-only
```

## 📝 Examples

### Example 1: Default Configuration

```typescript
import JupiterSwapWithFees from "./index";

const swapper = new JupiterSwapWithFees();
await swapper.performSwap();
```

### Example 2: Custom Configuration

```typescript
import JupiterSwapWithFees from "./index";
import { SwapConfig, defaultConfig } from "./config";

const customConfig: SwapConfig = {
  ...defaultConfig,
  OUTPUT_TOKEN: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
  SWAP_AMOUNT: 50000000, // 0.05 SOL
  PLATFORM_FEE_BPS: 50, // 0.5%
};

const swapper = new JupiterSwapWithFees(customConfig);
await swapper.performSwap();
```

### Example 3: Quote Only

```typescript
const swapper = new JupiterSwapWithFees();
const quote = await swapper.getQuote(
  "So11111111111111111111111111111111111111112", // SOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  100000000 // 0.1 SOL
);
```

## 🏦 Supported Tokens

The project includes predefined configurations for:

- **SOL**: Native Solana token
- **USDC**: USD Coin
- **USDT**: Tether USD
- **JUP**: Jupiter token
- **mSOL**: Marinade Staked SOL

## 💰 Fee Structure

Platform fees are collected in basis points (bps):

- 1 bps = 0.01%
- 10 bps = 0.1%
- 100 bps = 1%

Example: 20 bps = 0.2% fee

## 🔒 Security Notes

- **Private Key**: Never share your private key or commit it to version control
- **Mainnet**: The example uses Solana mainnet - real tokens will be used
- **Testing**: Use small amounts for testing
- **Validation**: All inputs are validated before execution

## 🛠️ Project Structure

```
src/
├── index.ts        # Main Jupiter swap implementation
├── config.ts       # Configuration and constants
├── utils.ts        # Utility functions
├── examples.ts     # Usage examples
└── wallet-info.ts  # Wallet inspection utility
```

## 📊 Output Example

```
🚀 Jupiter Swap with Fees initialized
💰 Wallet Address: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
🏦 Fee Account: 4qQDdRky38xhfWRacy7SratfNS7eP8ZVbmFgJWLGsWBp
💸 Platform Fee: 20 bps ( 0.20 %)

🔄 Starting swap process...
💰 Initial balances:
  SOL: 1.500000000
  USDC: 0

📊 Getting quote from Jupiter API...
🔄 Swapping: SOL → USDC
💰 Amount: 0.100000 SOL
🎯 Slippage: 50 bps

✅ Quote received:
  Input: 0.100000 SOL
  Output: 15.234567 USDC
  Price Impact: 0.01 %
  Platform Fee: 0.000200 SOL
  Fee BPS: 20

🔄 Getting swap transaction...
✅ Swap transaction received

✍️ Signing transaction...
📡 Sending transaction...
⏳ Waiting for confirmation...
🎉 Transaction confirmed!
🔗 Transaction signature: 5J7...abc
🌐 Explorer URL: https://explorer.solana.com/tx/5J7...abc

💰 Final balances:
  SOL: 1.399800000
  USDC: 15.234567

📊 Changes:
  SOL: -0.100200000
  USDC: +15.234567

✅ Swap completed successfully!
```

## 🚨 Important Notes

1. **Mainnet Usage**: This example uses Solana mainnet with real tokens
2. **Private Key Security**: Keep your private key secure and never share it
3. **Fee Account**: Ensure your fee account exists and can receive the tokens
4. **Balance Requirements**: Ensure sufficient SOL balance for transactions
5. **Testing**: Start with small amounts for testing

## 🔧 Scripts

- `npm run build` - Build the TypeScript project
- `npm run dev` - Run the main swap program
- `npm run examples` - Run example programs
- `npm run wallet-info` - Check wallet balances and token accounts
- `npm run quote-only` - Get quotes without executing swaps
- `npm run clean` - Clean build directory
- `npm run lint` - Check TypeScript compilation

## 📚 References

- [Jupiter API Documentation](https://dev.jup.ag/docs/swap-api/add-fees-to-swap)
- [Solana Web3.js Documentation](https://docs.solana.com/developing/clients/javascript-reference)
- [SPL Token Documentation](https://spl.solana.com/token)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - see LICENSE file for details.
