# Environment Setup

Environment variables required to run the project.

## Public Variables (frontend)

These variables are exposed to the browser (`NEXT_PUBLIC_` prefix).

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_STELLAR_NETWORK` | Stellar network | `TESTNET` |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | Soroban RPC endpoint | `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_STELLAR_HORIZON_URL` | Horizon API endpoint | `https://horizon-testnet.stellar.org` |
| `NEXT_PUBLIC_ENERGY_TOKEN_CONTRACT` | HDROP token contract ID | `CXXX...` |
| `NEXT_PUBLIC_ENERGY_DISTRIBUTION_CONTRACT` | Distribution contract ID | `CXXX...` |
| `NEXT_PUBLIC_COMMUNITY_GOVERNANCE_CONTRACT` | Governance contract ID | `CXXX...` |
| `NEXT_PUBLIC_ADMIN_ADDRESS` | System admin address | `GXXX...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |

## Secret Variables (server-side)

These variables are **never** exposed to the browser.

| Variable | Description | How to obtain |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |
| `MINTER_SECRET_KEY` | Minter account private key | Generate a keypair with Stellar Laboratory |

## Supabase

### Required Tables

**prosumers**
```sql
CREATE TABLE prosumers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stellar_address TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  panel_capacity_kw NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**readings**
```sql
CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stellar_address TEXT NOT NULL REFERENCES prosumers(stellar_address),
  kwh_injected NUMERIC NOT NULL,
  kwh_consumed NUMERIC NOT NULL,
  net_kwh NUMERIC GENERATED ALWAYS AS (kwh_injected - kwh_consumed) STORED,
  reading_date DATE NOT NULL,
  minted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**offers**
```sql
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_address TEXT NOT NULL,
  seller_short TEXT,
  amount_kwh NUMERIC NOT NULL,
  price_per_kwh NUMERIC NOT NULL,
  total_xlm NUMERIC NOT NULL,
  status TEXT DEFAULT 'active',
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Fund Minter Account (Testnet)

```bash
curl "https://friendbot.stellar.org/?addr=YOUR_MINTER_ADDRESS"
```
