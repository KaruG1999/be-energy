# Marketplace Overview

The marketplace allows prosumers to buy and sell tokenized solar energy (HDROP) peer-to-peer, using XLM as the payment method.

## How It Works

1. **Seller** publishes an offer specifying kWh amount and price per kWh in XLM
2. The offer is visible to all connected users
3. **Buyer** selects an offer and confirms the purchase
4. An on-chain HDROP token transfer is executed
5. The offer is marked as sold in the database with the `tx_hash`

## User Flow

### Create Offer (sell)

1. Click "Create Offer"
2. Enter kWh amount and price per kWh
3. Total XLM is calculated automatically
4. Click "Publish"
5. The offer appears in the marketplace

### Buy Offer

1. Browse available offers
2. Click "Buy" (disabled on your own offers)
3. Review details: seller, amount, price, total
4. Confirm purchase
5. Sign transaction in wallet (Freighter popup)
6. HDROP tokens transferred + offer removed from marketplace

## Persistence

Offers are stored in **Supabase** (`offers` table):

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Unique identifier |
| `seller_address` | TEXT | Seller's Stellar address |
| `seller_short` | TEXT | Abbreviated format (GXXX...YYYY) |
| `amount_kwh` | NUMERIC | kWh offered |
| `price_per_kwh` | NUMERIC | Price per kWh in XLM |
| `total_xlm` | NUMERIC | Total payment in XLM |
| `status` | TEXT | `active` or `sold` |
| `tx_hash` | TEXT | Purchase transaction hash |
| `created_at` | TIMESTAMPTZ | Creation date |

## Security

* `seller_short` is computed server-side (client input is not trusted)
* Numeric fields are validated as positive numbers
* Only the `active → sold` transition is allowed
* The `tx_hash` enables on-chain purchase verification
