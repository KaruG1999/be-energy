# Stellar & Soroban

BeEnergy runs on the Stellar blockchain using Soroban smart contracts.

## Why Stellar?

* **Fast transactions:** ~5 second finality
* **Low costs:** Fractions of a cent per transaction
* **Native DEX:** Decentralized exchange built into the protocol
* **Soroban:** Smart contract platform with WASM execution

## Stellar Components Used

### Soroban (Smart Contracts)

Contracts run on the Soroban VM and compile to WebAssembly:

* **Energy Token (HDROP)** — SEP-41 token representing energy
* **Energy Distribution** — Proportional token distribution
* **Community Governance** — Community proposals (WIP)

### Horizon API

REST API for querying the Stellar ledger:

* Query account balances
* Payment and transaction history
* Asset information

### Soroban RPC

Endpoint for interacting with smart contracts:

* Simulate transactions (gas estimation)
* Submit signed transactions
* Query contract state (read-only invocations)

## Current Network

| Parameter | Value |
| --- | --- |
| Network | Stellar Testnet |
| Passphrase | `Test SDF Network ; September 2015` |
| Soroban RPC | `https://soroban-testnet.stellar.org` |
| Horizon | `https://horizon-testnet.stellar.org` |

## Soroban Transaction Flow

```
1. Build transaction (TransactionBuilder)
       ↓
2. Simulate (server.simulateTransaction)
       ↓ estimates fees + validates
3. Prepare (server.prepareTransaction)
       ↓ adds footprint + fees
4. Sign (kit.signTransaction → Freighter popup)
       ↓
5. Submit (server.sendTransaction)
       ↓
6. Poll (server.getTransaction) until SUCCESS
       ↓ timeout: 30 seconds
7. Result confirmed on-chain
```
