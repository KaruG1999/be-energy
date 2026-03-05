# Data Flow

Main data flows in BeEnergy.

## Generation Recording → Token Minting

```
Solar Panel → Smart Meter
                  ↓
          POST /api/readings
          (kwh_injected, kwh_consumed)
                  ↓
          Supabase (readings table)
          net_kwh = injected - consumed
                  ↓
          POST /api/mint
          (server-side signing)
                  ↓
      Energy Distribution Contract
      record_generation(net_kwh)
                  ↓
      For each member:
      share = (net_kwh × percent) / 100
                  ↓
      Energy Token Contract
      mint_energy(member, share)
                  ↓
      HDROP tokens in member's wallet
```

## Marketplace: Create Offer

```
User (seller)
      ↓
POST /api/offers
{seller_address, amount_kwh, price_per_kwh, total_xlm}
      ↓
Server computes seller_short
Validates numeric fields > 0
      ↓
Supabase (offers table)
status: "active"
      ↓
Offer visible in GET /api/offers
```

## Marketplace: Buy Offer

```
User (buyer) selects offer
      ↓
useEnergyToken().transfer(seller, amount)
      ↓
Soroban: HDROP transfer on-chain
      ↓ tx_hash
PATCH /api/offers
{id, status: "sold", tx_hash}
      ↓
Supabase: offer marked as "sold"
No longer appears in active listing
      ↓
localStorage: updates stock + history
```

## DeFindex: Deposit to Vault

```
User wants to earn yield
      ↓
POST /api/defindex/deposit
{vaultAddress, amount, userAddress}
      ↓
DeFindex SDK generates transaction XDR
      ↓
Frontend signs with wallet
      ↓
Tokens deposited in vault
Earning yield (variable APY)
```

## DeFindex: Withdraw from Vault

```
User wants to withdraw
      ↓
POST /api/defindex/withdraw
{vaultAddress, amount, userAddress}
      ↓
DeFindex SDK generates transaction XDR
      ↓
Frontend signs with wallet
      ↓
Tokens + yield returned to user
```

## Balance Queries

```
Polling every 2 seconds (WalletContext)
      ↓
Horizon API: /accounts/{address}
      ↓
Balance mapping:
  - XLM (native)
  - HDROP (credit_alphanum12)
  - Other assets
      ↓
Global state available via useWallet()
```
