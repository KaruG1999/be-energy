# DeFindex API

Server-side API routes for interacting with DeFindex vaults.

## GET /api/defindex/health

Checks connectivity with the DeFindex service.

```bash
curl -s https://be-energy-six.vercel.app/api/defindex/health
```

**Response `200`:**

```json
{ "status": "ok" }
```

---

## GET /api/defindex/vault/[address]

Gets vault information and current APY.

```bash
curl -s https://be-energy-six.vercel.app/api/defindex/vault/CVAULT_ADDRESS
```

**Response `200`:**

```json
{
  "vault": { ... },
  "apy": 5.2
}
```

---

## GET /api/defindex/stats/[vaultAddress]/[userAddress]

Gets user yield statistics for a specific vault.

```bash
curl -s https://be-energy-six.vercel.app/api/defindex/stats/CVAULT/GUSER
```

**Response `200`:**

```json
{
  "balance": 100,
  "apy": 5.2,
  "dailyInterest": 0.0142,
  "monthlyInterest": 0.433
}
```

---

## POST /api/defindex/deposit

Generates a transaction XDR for depositing tokens in a vault.

```bash
curl -s -X POST https://be-energy-six.vercel.app/api/defindex/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "vaultAddress": "CVAULT...",
    "amount": 100,
    "userAddress": "GUSER...",
    "invest": true,
    "slippageBps": 100
  }'
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `vaultAddress` | string | Yes | Vault address |
| `amount` | number | Yes | Amount to deposit |
| `userAddress` | string | Yes | User address |
| `invest` | boolean | No | Auto-invest (default: true) |
| `slippageBps` | number | No | Slippage in basis points |

**Response `200`:** Unsigned transaction XDR for the frontend to sign with the wallet.

---

## POST /api/defindex/withdraw

Generates a transaction XDR for withdrawing tokens from a vault.

```bash
curl -s -X POST https://be-energy-six.vercel.app/api/defindex/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "vaultAddress": "CVAULT...",
    "amount": 50,
    "userAddress": "GUSER..."
  }'
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `vaultAddress` | string | Yes | Vault address |
| `amount` | number | Yes | Amount to withdraw |
| `userAddress` | string | Yes | User address |

**Response `200`:** Unsigned transaction XDR.
