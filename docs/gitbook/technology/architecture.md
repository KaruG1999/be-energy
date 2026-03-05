# Architecture

BeEnergy is a monorepo powered by Turborepo + pnpm workspaces.

## High-Level Diagram

```
┌─────────────────────────────────────────────────┐
│                 Frontend (Next.js 16)            │
│  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
│  │ Dashboard  │  │Marketplace│  │    DeFi     │  │
│  └─────┬─────┘  └─────┬─────┘  └──────┬──────┘  │
│        │              │               │          │
│  ┌─────┴──────────────┴───────────────┴──────┐   │
│  │           React Hooks Layer               │   │
│  │  useEnergyToken  useEnergyDistribution    │   │
│  │  useDefindex     useHorizonPayments       │   │
│  └─────┬──────────────┬───────────────┬──────┘   │
├────────┼──────────────┼───────────────┼──────────┤
│        │     API Routes (server-side)  │          │
│  ┌─────┴─────┐  ┌─────┴─────┐  ┌─────┴─────┐   │
│  │/api/offers│  │ /api/mint │  │/api/defindex│   │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘   │
└────────┼──────────────┼───────────────┼──────────┘
         │              │               │
    ┌────┴────┐   ┌─────┴─────┐   ┌────┴─────┐
    │Supabase │   │  Soroban  │   │ DeFindex │
    │  (DB)   │   │ Contracts │   │  Vaults  │
    └─────────┘   └─────┬─────┘   └──────────┘
                        │
                  ┌─────┴─────┐
                  │  Stellar  │
                  │  Testnet  │
                  └───────────┘
```

## Packages

| Package | Path | Description |
| --- | --- | --- |
| `@be-energy/web` | `apps/web` | Next.js 16 frontend |
| `@be-energy/contracts` | `apps/contracts` | Soroban smart contracts (Rust) |
| `@be-energy/stellar` | `packages/stellar` | Shared Stellar utilities |

## Key External Dependencies

| Dependency | Version | Purpose |
| --- | --- | --- |
| `@stellar/stellar-sdk` | 14.3.3+ | Official Stellar SDK |
| `@creit.tech/stellar-wallets-kit` | 1.9.5 | Multi-wallet abstraction |
| `@defindex/sdk` | 0.1.2 | Yield farming protocol |
| `soroban-sdk` | 23.1.0 | Rust SDK for contracts |
| `stellar-access` | 0.5.1 | Access control (OpenZeppelin) |
| `stellar-tokens` | 0.5.1 | Token standards (OpenZeppelin) |
| `@supabase/supabase-js` | Latest | PostgreSQL + auth |

## Deployment

* **Hosting:** Vercel
* **Branch:** `main` (automatic deploys)
* **Build:** `pnpm turbo build --filter=@be-energy/web`
* **Output:** `apps/web/.next`
