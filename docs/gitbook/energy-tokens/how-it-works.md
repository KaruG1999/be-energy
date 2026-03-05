# How It Works

## From Solar Panel to Token

```
☀️ Solar Panel
      ↓ generates electricity
⚡ Inverter
      ↓ converts DC → AC
📊 Smart Meter
      ↓ measures kWh injected/consumed
🌐 Power Grid (injection)
      ↓ data reported
💻 BeEnergy API (POST /api/readings)
      ↓ stored in Supabase
🔗 Smart Contract (record_generation)
      ↓ distributes proportionally
🪙 HDROP Token in your wallet
```

## What is HDROP?

**HDROP** (HoneyDrop) is a token on the Stellar blockchain that represents solar energy:

* **1 HDROP = 1 kWh** of solar energy generated and injected into the grid
* **SEP-41** standard (compatible with the entire Stellar ecosystem)
* **7 decimals** (Stellar standard)
* Verifiable on-chain — every token has full traceability

## Token Lifecycle

```
MINTING → HOLDING → USAGE
   ↓         ↓         ↓
Energy     User has   Can:
generation HDROP in   • Sell on marketplace
recorded   wallet     • Deposit in vault (yield)
                      • Transfer P2P
                      • Burn (consume)
```

## Who Can Mint?

Only accounts with the **MINTER** role can create new tokens. This role is granted by the system admin.

In the current flow:
1. The prosumer reports their energy reading
2. The server-side API (with `MINTER_SECRET_KEY`) signs the transaction
3. The distribution contract mints tokens for each member according to their percentage

## What Happens to the Actual Electricity?

Electricity and tokens are **separate layers**:

* Electricity flows through the power grid as always
* Tokens represent a **digital certificate** of that generation
* No electricity is "sent" via blockchain — what's sent is the right/credit
* This allows energy trading between people who aren't physically connected
