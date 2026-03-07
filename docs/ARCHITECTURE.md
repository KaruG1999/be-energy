# BeEnergy — Arquitectura

> v0.3.0 · Modelo cooperativo · Stellar Testnet

---

## System Architecture

```
┌──────────────┐
│  Medidor     │  Hardware del usuario-generador
│  bidireccional│  Registra kWh inyectados a la red
└──────┬───────┘
       │ dato de lectura (kWh, fecha, medidor_id)
       │
       │ Fase 1: carga manual / CSV
       │ Fase 2: integración automática (ver abajo)
       ▼
┌──────────────┐
│  Cooperativa │  Admin humano con acceso al dashboard
│  (admin)     │  Valida que la lectura sea correcta
└──────┬───────┘
       │ POST /api/readings  →  POST /api/validate
       ▼
┌──────────────────────────────────────────────────┐
│  Backend BeEnergy (Next.js API Routes)           │
│                                                  │
│  /api/readings      → Supabase (INSERT lectura)  │
│  /api/validate      → Supabase (UPDATE estado)   │
│                       + Soroban (mint_energy)     │
│  /api/apply-credit  → Soroban (burn_energy)      │
│                       + Supabase (UPDATE factura) │
│  /api/balance       → Soroban (balance query)    │
│                                                  │
│  Supabase: lecturas, usuarios, logs              │
│  Soroban RPC: transacciones on-chain             │
└──────────────────┬───────────────────────────────┘
                   │ simulateTransaction → sendTransaction
                   ▼
┌──────────────────────────────────────────────────┐
│  Stellar Network (Soroban)                       │
│                                                  │
│  energy_token         mint / burn / balance      │
│  energy_distribution  registro + distribución    │
│                                                  │
│  Inmutable. Auditable. ~0.00001 XLM por tx.      │
└──────────────────┬───────────────────────────────┘
                   │ balance, historial
                   ▼
┌──────────────────────────────────────────────────┐
│  Dashboard (Next.js + React)                     │
│                                                  │
│  Vista cooperativa: lecturas, validación, totales│
│  Vista usuario: generación, créditos, historial  │
│                                                  │
│  Wallet: Freighter (SEP-43) para firmar txs      │
│  El usuario no necesita saber qué es blockchain  │
└──────────────────────────────────────────────────┘
```

---

## Integración con medidores (Fase 2)

La infraestructura de medición remota ya existe en Argentina. BeEnergy no instala hardware — se conecta a lo que la cooperativa ya tiene o va a tener (plazo regulatorio: diciembre 2028).

### Fuentes de datos

```
Opción A: Inversor solar (API REST del fabricante)
┌──────────────┐     ┌─────────────────────────────┐
│  Inversor    │────▶│  API del fabricante          │
│  Fronius /   │     │                             │
│  Huawei /    │     │  Fronius: Solar API (JSON)   │
│  SMA         │     │  Huawei: OpenAPI             │
└──────────────┘     │  SMA: Sunny Portal API       │
                     │                             │
                     │  Dato: kWh generados,        │
                     │  kWh inyectados, potencia    │
                     │  Frecuencia: cada 1 min      │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                          POST /api/readings

Opción B: Medidor bidireccional (vía sistema HES de la cooperativa)
┌──────────────┐     ┌─────────────────────────────┐
│  Medidor     │────▶│  HES / MDM cooperativa      │
│  bidireccional│     │                             │
│  (DLMS/COSEM)│     │  Protocolo: IEC 62056       │
│              │     │  Lectura cada 15 min         │
└──────────────┘     │  Energía activa/reactiva     │
                     │  Import + export (OBIS)      │
                     │                             │
                     │  Ej: DISCAR Mr.DiMS          │
                     │  (Justiniano Posse, Vicuña   │
                     │   Mackenna - Córdoba)         │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                          POST /api/readings
```

### Qué cambia en BeEnergy para Fase 2

| Componente | Fase 1 (hoy) | Fase 2 |
|------------|-------------|--------|
| Ingesta de datos | Manual / CSV | Webhook o polling desde API del inversor o HES |
| `/api/readings` | Recibe JSON del admin | Recibe JSON del sistema de medición |
| Validación | Admin revisa y aprueba | Auto-validación con reglas + revisión por excepción |
| Frecuencia | Cuando la cooperativa carga | Cada 15 min (medidor) o 1 min (inversor) |

No se necesita hardware nuevo. La cooperativa ya tiene medidores bidireccionales (obligatorios para generación distribuida) y muchas ya tienen lectura remota.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Blockchain | Stellar Testnet → Mainnet |
| Smart contracts | Soroban (Rust), soroban-sdk 23.1.0, OpenZeppelin v0.5.1 |
| Frontend | Next.js 16, React 19, Tailwind v4, shadcn/ui |
| Wallet | Stellar Wallets Kit (Freighter, SEP-43) |
| Backend | Next.js API Routes |
| Base de datos | Supabase (lecturas, usuarios, logs) |
| Deploy | Vercel (main branch) |

---

## Monorepo

```
be-energy/
├── apps/
│   ├── web/                          # Next.js 16 (@be-energy/web)
│   │   ├── app/
│   │   │   ├── dashboard/            # Dashboard cooperativa + usuario
│   │   │   ├── admin/                # Panel admin cooperativa
│   │   │   └── api/                  # API Routes
│   │   │       ├── readings/         # Cargar lecturas
│   │   │       ├── validate/         # Validar → mint
│   │   │       ├── apply-credit/     # Aplicar a factura → burn
│   │   │       └── balance/          # Consultar saldo
│   │   ├── components/ui/            # shadcn/ui
│   │   ├── hooks/                    # Contract hooks
│   │   ├── lib/                      # Contexts, config, supabase
│   │   └── styles/                   # Tailwind v4
│   │
│   └── contracts/                    # Soroban (Rust)
│       ├── energy_token/             # Token SEP-41 por cooperativa
│       ├── energy_distribution/      # Lecturas + distribución
│       └── community_governance/     # Propuestas (WIP)
│
├── packages/
│   └── stellar/                      # Shared wallet & config
│
├── docs/                             # Documentación
├── scripts/                          # Simulación testnet
└── vercel.json                       # Deploy config
```

---

## Contratos Soroban

```
┌─────────────────────────┐
│  Cooperative Factory     │  ← Fase 2
│  Despliega por coop     │
└────────────┬────────────┘
             │ deploy
             ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  Energy Token            │     │  Cooperative Registry    │  ← Fase 2
│  SEP-41 (1 token = 1kWh)│◄────│  Directorio de coops    │
└────────────▲────────────┘     └─────────────────────────┘
             │
             │ mint_energy()
             │
┌────────────┴────────────┐
│  Energy Distribution     │
│  Lecturas + distribución │
└─────────────────────────┘

┌─────────────────────────┐
│  Community Governance    │  ← Fase 3
│  Votación (WIP)          │
└─────────────────────────┘
```

**Detalle de contratos:** ver `docs/CONTRACTS.md`

---

## API Routes

| Route | Method | Descripción |
|-------|--------|-------------|
| `/api/readings` | POST | Cooperativa carga lectura de medidor |
| `/api/validate` | POST | Admin valida lectura → mintea crédito on-chain |
| `/api/apply-credit` | POST | Aplica crédito a factura → quema token |
| `/api/balance/:address` | GET | Saldo de créditos de un usuario |
| `/api/cooperatives` | GET/POST | Listar/registrar cooperativas (Fase 2) |

---

## Client Hooks

| Hook | Contrato | Funciones |
|------|----------|-----------|
| `useEnergyToken` | energy_token | `getBalance`, `transfer`, `mintEnergy`, `burnEnergy`, `checkIsMinter` |
| `useEnergyDistribution` | energy_distribution | `getMemberInfo`, `getTotalGenerated`, `getMemberList`, `recordGeneration` |

---

## Shared Package: @be-energy/stellar

| Módulo | Qué hace |
|--------|----------|
| `stellar-config.ts` | Endpoints RPC/Horizon, network passphrase |
| `wallet.ts` | Conexión wallet (Freighter), balance queries |
| `storage.ts` | localStorage tipado para wallet state |

---

## Environment Variables

### Públicas (client-side)

| Variable | Propósito |
|----------|----------|
| `NEXT_PUBLIC_STELLAR_NETWORK` | TESTNET / PUBLIC |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | Soroban RPC endpoint |
| `NEXT_PUBLIC_STELLAR_HORIZON_URL` | Horizon API endpoint |
| `NEXT_PUBLIC_ENERGY_TOKEN_CONTRACT` | Address del token |
| `NEXT_PUBLIC_ENERGY_DISTRIBUTION_CONTRACT` | Address de distribución |

### Secretas (server-side)

| Variable | Propósito |
|----------|----------|
| `MINTER_SECRET_KEY` | Clave del minter para firmar mints server-side |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key |

---

## Deploy

| | |
|---|---|
| **Plataforma** | Vercel |
| **Build** | `pnpm turbo build --filter=@be-energy/web` |
| **Output** | `apps/web/.next` |
| **Branch** | `main` |
| **Workflow** | `develop` → PR → `main` |
