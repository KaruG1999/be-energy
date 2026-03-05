# Minting

Minting is the process of creating HDROP tokens when solar energy generation is recorded.

## Minting Flow

### 1. Submit Reading

A prosumer reports their daily reading:

```bash
POST /api/readings
{
  "stellar_address": "GXXX...",
  "kwh_injected": 45.5,
  "kwh_consumed": 12.3,
  "reading_date": "2026-03-05"
}
```

The system calculates `net_kwh = kwh_injected - kwh_consumed = 33.2 kWh`.

### 2. Mint Tokens

The server-side API signs the transaction with the minter key:

```bash
POST /api/mint
{
  "stellar_address": "GXXX...",
  "reading_id": "uuid..."
}
```

Internally:
1. Verifies the reading exists and hasn't been minted before
2. Calls `EnergyDistribution.record_generation(net_kwh)`
3. The contract distributes tokens proportionally among members
4. Marks the reading as `minted: true`

### 3. Proportional Distribution

If the community has 3 members:

| Member | Percentage | kWh received (from 33.2 kWh) |
| --- | --- | --- |
| Alice | 50% | 16.6 HDROP |
| Bob | 30% | 9.96 HDROP |
| Carol | 20% | 6.64 HDROP |

## Minting Security

* Only accounts with the **MINTER** role can mint
* Minting is executed **server-side** (private key never reaches the browser)
* Each reading can only be minted **once** (`minted` flag in Supabase)
* The admin can grant/revoke the minter role at any time

## Frontend Hooks

```typescript
const { mintEnergy, checkIsMinter } = useEnergyToken()

// Check if account is a minter
const isMinter = await checkIsMinter(address)

// Mint (only works with MINTER role)
await mintEnergy(recipientAddress, amountKwh)
```

## Burning Tokens

When energy is consumed, tokens can be burned:

```typescript
const { burnEnergy } = useEnergyToken()
await burnEnergy(amountKwh)
```

This reduces the token's `total_supply` and reflects energy consumption.
