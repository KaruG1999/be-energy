# Soroban Contracts Reference

> BeEnergy v0.2.0 → v0.3.0

## Contratos actuales

3 contratos en `apps/contracts/`, compilados a WASM, desplegados en Stellar Testnet.

| Contrato | Propósito | OZ Libraries | Tests |
|----------|-----------|-------------|-------|
| `energy_token` | Token SEP-41 (1 token = 1 kWh) | stellar-tokens, stellar-access, stellar-macros | 21 |
| `energy_distribution` | Distribución proporcional + registro de lecturas | stellar-access, stellar-macros | 26 |
| `community_governance` | Propuestas (skeleton, sin votación) | Ninguna | 10 |

**Dependencias:** soroban-sdk 23.1.0, OpenZeppelin stellar-contracts v0.5.1, Rust 1.89.0, target wasm32v1-none.

---

## 1. Energy Token

Token fungible SEP-41. Cada cooperativa tiene su propia instancia con nombre y símbolo propios.

| Función | Auth | Descripción |
|---------|------|-------------|
| `__constructor(admin, distribution_contract, initial_supply)` | Deploy | Configura metadata, grants MINTER role |
| `mint_energy(to, amount, minter)` | MINTER | Mintea cuando la cooperativa valida una lectura |
| `burn_energy(from, amount)` | Holder | Quema cuando se aplica crédito a factura |
| `grant_minter(new_minter)` | Admin | Agrega minter |
| `revoke_minter(minter)` | Admin | Revoca minter |
| SEP-41 estándar | Público | transfer, balance, approve, total_supply, etc. |

**Cambios planificados (v0.3.0):**
- Constructor recibe `name`, `symbol`, `cooperative_id` como parámetros (hoy hardcodeado como "HoneyDrop"/"HDROP")
- Agregar `transfer_admin` para rotar administrador

---

## 2. Energy Distribution

Gestiona lecturas de medidores, valida y distribuye créditos proporcionalmente.

| Función | Auth | Descripción |
|---------|------|-------------|
| `initialize(admin, token_contract, required_approvals)` | Admin | Setup inicial |
| `add_members_multisig(approvers, members, percents)` | Multi-sig | Registra miembros con % de propiedad |
| `record_generation(kwh_generated)` | Admin | Valida lectura + mintea proporcional a cada miembro |
| `is_member(address)` | Público | Check membresía |
| `get_member_percent(address)` | Público | % de propiedad |
| `get_total_generated()` | Público | kWh totales generados |

**Cambios planificados (v0.3.0):**
- Migrar a `__constructor` (hoy usa `initialize`)
- Agregar `cooperative_id`
- Agregar `update_members`, `remove_member`
- Agregar `transfer_admin`
- **Eliminar módulo privacy** (simulación SHA256 sin valor real, ~150 líneas)

---

## 3. Community Governance

Skeleton para gobernanza. Solo crea propuestas, no tiene votación.

| Función | Auth | Descripción |
|---------|------|-------------|
| `initialize(admin)` | Admin | Setup |
| `create_proposal(proposer, title)` | Autenticado | Crea propuesta |
| `get_proposal(id)` | Público | Lee propuesta |

**Cambios planificados (v0.4.0):**
- Agregar `vote(proposal_id, voter, in_favor)`
- Agregar quorum y finalización
- Integrar con distribution (solo miembros votan)

---

## 4. Contratos nuevos (v0.3.0)

### Cooperative Factory

Despliega token + distribution por cooperativa en 1 transacción.

```
Factory.create_cooperative(admin, name, symbol, required_approvals)
  → deploy energy_token(admin, name, symbol, cooperative_id)
  → deploy energy_distribution(admin, token_address, cooperative_id)
  → registra en Registry
  → retorna { token_address, distribution_address }
```

### Cooperative Registry

Registro central de cooperativas.

```rust
pub struct CooperativeInfo {
    pub id: u32,
    pub name: String,
    pub admin: Address,
    pub token_contract: Address,
    pub distribution_contract: Address,
    pub active: bool,
}
```

- `register_cooperative(info)` — Solo Factory
- `get_cooperative(id)` — Público
- `list_cooperatives()` — Público
- `deactivate_cooperative(id)` — Admin global

### Cooperative Swap (v0.5.0)

Intercambio bilateral entre cooperativas. Burn en token A → mint en token B.

---

## 5. Tests

**57 tests, todos pasando.** `cd apps/contracts && cargo test`

| Contrato | Tests |
|----------|-------|
| energy_token | 21 (constructor, mint, burn, transfer, access control) |
| energy_distribution | 26 (init, multisig, generation, privacy, views) |
| community_governance | 10 (init, proposals, edge cases) |

---

## 6. Testnet Deployments (actuales, se reemplazarán)

| Contrato | Address |
|----------|---------|
| Token | `CAUH3NUZGCNRHHVJK5S3FLXIS244GCNPC2LDZDU2SVOK66G3IGAGBBL2` |
| Distribution | `CDXWZSWTM6DGYTDME3BEDE6U7JBHMG4YM7ZW237UZS2XTUWFVEEMIROR` |
| Governance | `CCH2EXXNSDW2BAKBIPFAG6CCZS6LV4VJFUP2CZZCW5LEY4JOAXBJD6YI` |
