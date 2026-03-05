# Smart Contracts

Three Soroban contracts written in Rust, deployed on Stellar Testnet.

## Energy Token (HDROP)

**File:** `apps/contracts/contracts/energy_token/src/lib.rs` (260 lines, 21 tests)

The token representing solar energy. **1 HDROP = 1 kWh**.

### Specifications

| Property | Value |
| --- | --- |
| Name | HoneyDrop |
| Symbol | HDROP |
| Decimals | 7 (Stellar standard) |
| Standard | SEP-41 |

### Main Functions

| Function | Access | Description |
| --- | --- | --- |
| `mint_energy(to, amount, minter)` | MINTER | Mint tokens when generation is recorded |
| `burn_energy(from, amount)` | Owner | Burn tokens when energy is consumed |
| `grant_minter(new_minter)` | ADMIN | Grant minter role |
| `revoke_minter(minter)` | ADMIN | Revoke minter role |
| `is_minter(account)` | Public | Check minter role |
| `transfer(from, to, amount)` | Owner | Standard P2P transfer |

### Security

* Uses OpenZeppelin `stellar-access` for role-based access control
* Uses OpenZeppelin `stellar-tokens` for SEP-41 standard
* Only accounts with MINTER role can create tokens
* Only ADMIN can manage roles

---

## Energy Distribution

**File:** `apps/contracts/contracts/energy_distribution/src/lib.rs` + `privacy.rs` (481 lines, 26 tests)

Distributes HDROP tokens proportionally among community members.

### Main Functions

| Function | Access | Description |
| --- | --- | --- |
| `add_members_multisig(approvers, members, percents)` | Multisig | Register members with N-of-M approvals |
| `record_generation(kwh_generated)` | ADMIN | Record generation and distribute tokens |
| `enable_privacy()` | ADMIN | Enable privacy mode |
| `record_private_consumption(user, commitment)` | User | Store SHA256 commitment |
| `get_total_generated()` | Public | Total kWh generated |
| `get_member_list()` | Public | List of members |
| `get_member_percent(address)` | Public | Member's percentage |

### Proportional Distribution

When energy generation is recorded:

```
For each member:
  share = (kwh_generated × member_percent) / 100
  → mint_energy(member, share)
```

All member percentages must sum to exactly 100.

### Privacy Module

Current status: **placeholder** for ZK-SNARKs.

* Uses SHA256 commitments as proof of concept
* Current verification reveals data (not actually private)
* Prepared for Groth16/BLS12-381 integration in production

---

## Community Governance

**File:** `apps/contracts/contracts/community_governance/src/lib.rs` (58 lines, 10 tests)

**Status:** Skeleton — **in development**.

### Implemented Functions

| Function | Access | Description |
| --- | --- | --- |
| `create_proposal(proposer, title)` | Members | Create proposal (returns ID) |
| `get_proposal_count()` | Public | Total proposals |
| `get_proposal(id)` | Public | Fetch proposal by ID |

### Not Yet Implemented

* Voting mechanism
* Quorum logic
* Proposal execution
* Time bounds

---

## Tests

**57 tests total, all passing.**

```bash
cd apps/contracts && cargo test
```

| Contract | Tests | Coverage |
| --- | --- | --- |
| Energy Token | 21 | Constructor, minting, burning, transfers, access control, edge cases |
| Energy Distribution | 26 | Initialization, multisig, generation, privacy, views |
| Community Governance | 10 | Initialization, proposals, edge cases |
