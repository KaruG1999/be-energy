# Marketplace API Reference

Base URL: `https://be-energy-six.vercel.app`

## GET /api/offers

Lists all active offers, ordered by creation date (newest first).

### Request

```bash
curl -s https://be-energy-six.vercel.app/api/offers
```

### Response `200 OK`

```json
[
  {
    "id": "932b3828-3ae3-4cee-8cba-75e9d7a11857",
    "seller_address": "GBIUCGDMGXM2ZMNEOCPRVIGDPBPWZ73YANLK4KMOEVDDBXNS43UDWLYM",
    "seller_short": "GBIU...WLYM",
    "amount_kwh": 50,
    "price_per_kwh": 0.5,
    "total_xlm": 25,
    "status": "active",
    "tx_hash": null,
    "created_at": "2026-03-05T05:42:53.583827+00:00"
  }
]
```

---

## POST /api/offers

Creates a new energy offer.

### Request

```bash
curl -s -X POST https://be-energy-six.vercel.app/api/offers \
  -H "Content-Type: application/json" \
  -d '{
    "seller_address": "GXXX...YYYY",
    "amount_kwh": 10,
    "price_per_kwh": 0.3,
    "total_xlm": 3
  }'
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `seller_address` | string | Yes | Seller's Stellar address |
| `amount_kwh` | number | Yes | kWh amount (positive) |
| `price_per_kwh` | number | Yes | Price per kWh in XLM (positive) |
| `total_xlm` | number | Yes | Total in XLM (positive) |

> `seller_short` is automatically computed server-side from `seller_address`.

### Response `201 Created`

```json
{
  "id": "7150adb8-d2ae-47e5-9466-054b61ccba26",
  "seller_address": "GTEST1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCD",
  "seller_short": "GTES...ABCD",
  "amount_kwh": 5,
  "price_per_kwh": 0.2,
  "total_xlm": 1,
  "status": "active",
  "tx_hash": null,
  "created_at": "2026-03-05T15:56:22.294163+00:00"
}
```

### Errors

| Status | Error | Cause |
| --- | --- | --- |
| `400` | `Missing required fields` | A required field is missing |
| `400` | `Numeric fields must be positive numbers` | Numeric fields are not positive |
| `500` | `Failed to create offer` | Internal Supabase error |

---

## PATCH /api/offers

Marks an offer as sold. Only allowed transition: `active → sold`.

### Request

```bash
curl -s -X PATCH https://be-energy-six.vercel.app/api/offers \
  -H "Content-Type: application/json" \
  -d '{
    "id": "7150adb8-d2ae-47e5-9466-054b61ccba26",
    "status": "sold",
    "tx_hash": "abc123..."
  }'
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string (UUID) | Yes | Offer ID |
| `status` | string | Yes | Only `"sold"` is allowed |
| `tx_hash` | string | No | On-chain transaction hash |

### Response `200 OK`

```json
{
  "id": "7150adb8-d2ae-47e5-9466-054b61ccba26",
  "seller_address": "GTEST1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCD",
  "seller_short": "GTES...ABCD",
  "amount_kwh": 5,
  "price_per_kwh": 0.2,
  "total_xlm": 1,
  "status": "sold",
  "tx_hash": "test_verification_tx_456",
  "created_at": "2026-03-05T15:56:22.294163+00:00"
}
```

### Errors

| Status | Error | Cause |
| --- | --- | --- |
| `400` | `Missing required fields: id and status` | Missing `id` or `status` |
| `400` | `Invalid status transition. Allowed: sold` | Status other than `"sold"` |
| `500` | `Failed to update offer` | Internal Supabase error |
