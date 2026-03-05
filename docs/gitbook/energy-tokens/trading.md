# Trading

HDROP tokens can be transferred peer-to-peer through the marketplace or directly on-chain.

## Marketplace (P2P)

The primary way to trade energy on BeEnergy.

### Selling Energy

1. Create an offer in the marketplace (kWh amount + price in XLM)
2. The offer is visible to all users
3. When someone buys, tokens are transferred automatically
4. Seller receives XLM, buyer receives HDROP

### Buying Energy

1. Browse available offers
2. Select and confirm purchase
3. Sign transaction in wallet
4. HDROP tokens transferred to your wallet

See [API Reference](../marketplace/api-reference.md) for technical details.

## Direct Transfer

Tokens can also be transferred directly without going through the marketplace:

```typescript
const { transfer } = useEnergyToken()

// Transfer 10 kWh to another address
const txHash = await transfer("GDEST...", 10)
```

Internally this invokes `EnergyToken.transfer()` on the smart contract, which:

1. Verifies the sender has sufficient balance
2. Debits the sender and credits the receiver
3. Emits an on-chain event with the tx_hash

## On-Chain Verification

Every transfer is recorded on Stellar and can be verified:

* **tx_hash** — Unique transaction identifier
* **Horizon API** — Query transaction details
* **Soroban events** — Events emitted by the contract

```
https://horizon-testnet.stellar.org/transactions/{tx_hash}
```

## Transaction History

The `useHorizonPayments` hook queries the last 50 transactions:

```typescript
const { payments, isLoading } = useHorizonPayments()
```

Each payment includes: type, amount, asset, from/to, timestamp.
