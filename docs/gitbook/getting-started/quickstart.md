# Quickstart

Get the project running on your machine in 5 minutes.

## Prerequisites

* Node.js 18+
* pnpm 9+
* Rust + Soroban CLI (only if working with contracts)
* Freighter wallet (browser extension)

## 1. Clone and install

```bash
git clone https://github.com/BuenDia-Builders/be-energy.git
cd be-energy
pnpm install
```

## 2. Configure environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in the required variables (see [Environment Setup](environment-setup.md)).

## 3. Start development server

```bash
pnpm dev --filter=@be-energy/web
```

The app will be available at `http://localhost:3000`.

## 4. Connect wallet

1. Install [Freighter](https://www.freighter.app/) in your browser
2. Create a Stellar Testnet account
3. Fund your account with [Friendbot](https://friendbot.stellar.org/?addr=YOUR_ADDRESS)
4. Open the app and click "Connect Wallet"

## 5. Build contracts (optional)

```bash
cd apps/contracts
cargo build --target wasm32-unknown-unknown --release
cargo test
```

## Project Structure

```
be-energy/
├── apps/
│   ├── web/              # Next.js 16 frontend
│   └── contracts/        # Soroban smart contracts (Rust)
├── packages/
│   └── stellar/          # Shared Stellar utilities
├── tooling/
│   └── issues/           # Issue templates
├── docs/                 # Documentation
├── turbo.json            # Turborepo config
└── pnpm-workspace.yaml   # Workspaces
```
