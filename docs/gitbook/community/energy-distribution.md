# Energy Distribution

The distribution contract distributes HDROP tokens proportionally among community members every time energy generation is recorded.

## How It Works

1. The admin registers community members with their percentages
2. When energy generation is recorded, the contract calculates each member's share
3. HDROP tokens are minted directly to each member's wallet

## Member Registration (Multisig)

Members are added through a multi-approval process:

```rust
add_members_multisig(
    approvers: Vec<Address>,   // who approves
    members: Vec<Address>,     // new members
    percents: Vec<u32>         // percentages (must sum to 100)
)
```

### Example

| Member | Percentage |
| --- | --- |
| Alice | 40% |
| Bob | 35% |
| Carol | 25% |
| **Total** | **100%** |

## Record Generation

When solar energy is generated:

```rust
record_generation(kwh_generated: u128)
```

The contract automatically:

1. Calculates `share = (kwh × percent) / 100` for each member
2. Calls `EnergyToken.mint_energy(member, share)` for each one
3. Increments the `TotalGenerated` counter

### Example with 100 kWh generated

| Member | % | Tokens minted |
| --- | --- | --- |
| Alice | 40% | 40 HDROP |
| Bob | 35% | 35 HDROP |
| Carol | 25% | 25 HDROP |

## Query Functions

```typescript
const { getTotalGenerated, getMemberList, getMemberInfo } = useEnergyDistribution()

const total = await getTotalGenerated()      // total kWh generated
const members = await getMemberList()         // list of addresses
const percent = await getMemberInfo(address)  // member's percentage
```

## Privacy Module

The contract includes an experimental privacy module for consumption:

* Uses **SHA256 commitments** as proof of concept
* Prepared for **ZK-SNARKs** (Groth16/BLS12-381) integration in production
* Allows recording consumption without revealing the exact amount

> **Note:** The current implementation is a placeholder. Verification reveals the data, so it's not actually private. ZK proof integration is required for real privacy.

## Tests

26 tests covering initialization, multisig, generation, privacy, and view functions.

```bash
cd apps/contracts && cargo test --package energy-distribution
```
