# Verified Tests

Tests executed against production (`https://be-energy-six.vercel.app`) on 2026-03-05.

## Summary

| # | Test | Endpoint | Status | Result |
| --- | --- | --- | --- | --- |
| 1 | List active offers | `GET` | `200` | 4 offers with status `active` |
| 2 | Create offer | `POST` | `201` | `seller_short` computed server-side |
| 3 | Missing fields | `POST` | `400` | `Missing required fields` |
| 4 | Negative numbers | `POST` | `400` | `Numeric fields must be positive numbers` |
| 5 | Mark as sold | `PATCH` | `200` | Status `sold` + `tx_hash` saved |
| 6 | Missing id/status | `PATCH` | `400` | `Missing required fields: id and status` |
| 7 | Invalid status | `PATCH` | `400` | `Invalid status transition` |
| 8 | Sold offer filtered | `GET` | `200` | Sold offer no longer in listing |

All 8 tests passed.

---

## 1. GET — List Active Offers

```bash
curl -s https://be-energy-six.vercel.app/api/offers
```

**Response `200`:**

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
  },
  {
    "id": "9bb8b319-48f1-4cd6-b2a4-f890e19610e6",
    "seller_address": "GCSNZWMCCWX7O55W4PVBD4S7EOHG55JRNUNPDYW44TVV6GORLMY67LQZ",
    "seller_short": "GCSN...7LQZ",
    "amount_kwh": 50,
    "price_per_kwh": 0.5,
    "total_xlm": 25,
    "status": "active",
    "tx_hash": null,
    "created_at": "2026-03-05T05:42:09.707669+00:00"
  },
  {
    "id": "dac54e8c-950f-4018-b685-e0a5df06fc93",
    "seller_address": "GDEPRAQKNMTNGZCKL4GU5HGQ4UL6LZ4PS46LZ5HG44CSPBVZXQUL36B4",
    "seller_short": "GDEP...36B4",
    "amount_kwh": 1616,
    "price_per_kwh": 1.6,
    "total_xlm": 2585.6,
    "status": "active",
    "tx_hash": null,
    "created_at": "2026-03-05T05:37:16.996425+00:00"
  },
  {
    "id": "6fa0f654-969a-4c1d-9750-7b0366eb92ef",
    "seller_address": "GDEPRAQKNMTNGZCKL4GU5HGQ4UL6LZ4PS46LZ5HG44CSPBVZXQUL36B4",
    "seller_short": "GDEP...36B4",
    "amount_kwh": 50,
    "price_per_kwh": 0.5,
    "total_xlm": 25,
    "status": "active",
    "tx_hash": null,
    "created_at": "2026-03-05T04:50:51.612353+00:00"
  }
]
```

---

## 2. POST — Create Offer (happy path)

```bash
curl -s -X POST https://be-energy-six.vercel.app/api/offers \
  -H "Content-Type: application/json" \
  -d '{
    "seller_address": "GTEST1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCD",
    "amount_kwh": 5,
    "price_per_kwh": 0.2,
    "total_xlm": 1
  }'
```

**Response `201`:**

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

> `seller_short` is computed server-side (`GTES...ABCD`) — the client does not send it.

---

## 3. POST — Validation: Missing Fields

```bash
curl -s -X POST https://be-energy-six.vercel.app/api/offers \
  -H "Content-Type: application/json" \
  -d '{"seller_address": "GTEST"}'
```

**Response `400`:**

```json
{ "error": "Missing required fields" }
```

---

## 4. POST — Validation: Negative Numbers

```bash
curl -s -X POST https://be-energy-six.vercel.app/api/offers \
  -H "Content-Type: application/json" \
  -d '{
    "seller_address": "GTEST",
    "amount_kwh": -5,
    "price_per_kwh": 0.3,
    "total_xlm": 3
  }'
```

**Response `400`:**

```json
{ "error": "Numeric fields must be positive numbers" }
```

---

## 5. PATCH — Mark as Sold (happy path)

```bash
curl -s -X PATCH https://be-energy-six.vercel.app/api/offers \
  -H "Content-Type: application/json" \
  -d '{
    "id": "7150adb8-d2ae-47e5-9466-054b61ccba26",
    "status": "sold",
    "tx_hash": "test_verification_tx_456"
  }'
```

**Response `200`:**

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

---

## 6. PATCH — Validation: Missing id or status

```bash
curl -s -X PATCH https://be-energy-six.vercel.app/api/offers \
  -H "Content-Type: application/json" \
  -d '{"id": "abc"}'
```

**Response `400`:**

```json
{ "error": "Missing required fields: id and status" }
```

---

## 7. PATCH — Validation: Invalid Status

```bash
curl -s -X PATCH https://be-energy-six.vercel.app/api/offers \
  -H "Content-Type: application/json" \
  -d '{"id": "abc", "status": "deleted"}'
```

**Response `400`:**

```json
{ "error": "Invalid status transition. Allowed: sold" }
```

---

## 8. GET — Sold Offer Filtered Out

After marking the test offer as `sold`, the GET endpoint returns the original 4 offers. The sold offer is correctly filtered out.

```
4 active offers returned (test offer with status "sold" is not included)
```

All tests passed successfully.
