# Governance

The community governance contract enables creating proposals for collective decisions.

> **Current status:** Skeleton in development. Proposal creation works, but the voting mechanism is not yet implemented.

## Implemented Features

### Create Proposal

Any community member can create a proposal:

```rust
create_proposal(proposer: Address, title: String) -> u32
```

Returns the ID of the created proposal.

### Query Proposals

```rust
get_proposal(id: u32) -> Proposal
get_proposal_count() -> u32
```

## Proposal Structure

```rust
pub struct Proposal {
    id: u32,
    proposer: Address,
    title: String,
    votes_for: u32,
    votes_against: u32,
    executed: bool,
}
```

## Not Yet Implemented

* Voting mechanism (vote for / vote against)
* Quorum logic (minimum participation threshold)
* Automatic execution of approved proposals
* Time limits for voting
* Vote delegation

## Tests

10 tests covering initialization, proposal creation, and edge cases.

```bash
cd apps/contracts && cargo test --package community-governance
```
