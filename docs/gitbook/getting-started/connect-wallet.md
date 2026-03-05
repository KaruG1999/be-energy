# Connect Wallet

BeEnergy uses [Stellar Wallets Kit](https://github.com/nicholasgasior/stellar-wallets-kit) to support multiple wallets.

## Supported Wallets

| Wallet | Type | Notes |
| --- | --- | --- |
| **Freighter** | Browser extension | Recommended |
| **HotWallet** | Built-in | For quick testing |
| Any SEP-43 wallet | Varies | Automatically compatible |

## Connection Flow

1. User clicks "Connect Wallet"
2. Wallet selection modal opens (Wallets Kit)
3. User approves the connection in their wallet
4. The app stores `walletId`, `walletAddress`, and `networkPassphrase` in localStorage
5. A 2-second polling interval keeps balances in sync

## Wallet State

The `WalletContext` provides all necessary information:

```typescript
const {
  isConnected,       // boolean — is wallet connected?
  address,           // string | null — full address
  shortAddress,      // string | null — G...XXXX format
  xlmBalance,        // string | null — XLM balance
  balances,          // MappedBalances — all assets
  connectWallet,     // () => Promise<void>
  disconnectWallet,  // () => void
  signTransaction,   // signs Soroban transactions
} = useWallet()
```

## Freighter Detection

The app automatically detects if Freighter is installed:

```typescript
const { isFreighterInstalled } = useWallet()
```

If not installed, a message suggests installing it.

## Network

The app currently operates on **Stellar Testnet**. The network is configured via environment variables:

* `NEXT_PUBLIC_STELLAR_NETWORK` — `TESTNET`
* `NEXT_PUBLIC_STELLAR_RPC_URL` — Soroban RPC node URL
* `NEXT_PUBLIC_STELLAR_HORIZON_URL` — Horizon API URL
