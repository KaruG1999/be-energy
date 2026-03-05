# DeFindex Vaults

BeEnergy integrates [DeFindex](https://defindex.io/) (by PaltaLabs) to offer yield farming on HDROP tokens.

## What is a Vault?

A vault is a smart contract that:

1. Accepts token deposits
2. Invests tokens in yield strategies
3. Generates yield (interest) on deposits
4. Allows withdrawals at any time

## How It Works in BeEnergy

```
User deposits HDROP in vault
      ↓
Vault invests according to its strategy
      ↓
Yield accumulates (variable APY)
      ↓
User withdraws HDROP + earnings
```

## Deposit

```typescript
const { deposit } = useDefindex()

// Deposit 100 HDROP in the vault
const txXDR = await deposit(100, userAddress)
// → Sign with wallet → tokens deposited
```

Internally:
1. `POST /api/defindex/deposit` generates the transaction XDR
2. The frontend signs it with the user's wallet
3. Tokens are deposited in the vault earning yield

## Withdraw

```typescript
const { withdraw } = useDefindex()

// Withdraw 50 HDROP from the vault
const txXDR = await withdraw(50, userAddress)
// → Sign with wallet → tokens + yield returned
```

## Query Stats

```typescript
const { stats, vaultInfo, fetchStats, fetchVaultInfo } = useDefindex()

await fetchVaultInfo()
// vaultInfo.apy → current vault APY

await fetchStats(userAddress)
// stats.balance → deposited tokens
// stats.dailyInterest → estimated daily yield
// stats.monthlyInterest → estimated monthly yield
```

## Vault Parameters

| Parameter | Description |
| --- | --- |
| `vaultAddress` | Vault contract address |
| `APY` | Annual percentage yield (variable) |
| `slippageBps` | Slippage tolerance in basis points |
