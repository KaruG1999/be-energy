# BeEnergy — Plan de Producto

## Qué es

SaaS para cooperativas eléctricas argentinas. Tokeniza la gestión de créditos de generación distribuida.

## Cómo gana plata BeEnergy

Suscripción SaaS mensual por cooperativa + fee de setup por onboarding.

| Plan | Incluye |
|------|---------|
| Starter | Hasta 50 usuarios-generadores, dashboard básico, 1 admin |
| Pro | Hasta 500 usuarios-generadores, analytics, múltiples admins |
| Enterprise | Ilimitado, API, integración con facturación, soporte dedicado |

---

## Fase 1 — 1 cooperativa piloto

**Objetivo:** Una cooperativa real gestiona créditos con BeEnergy en Testnet.

**Contratos Soroban:**
- `energy_token` — SEP-41 parametrizable (nombre, símbolo, cooperative_id). 1 token = 1 kWh
- `energy_distribution` — Lecturas, validación, mint, burn. Sin módulo privacy

**API:**
- `POST /api/readings` — Carga lectura (manual o CSV)
- `POST /api/validate` — Valida lectura → mintea crédito
- `POST /api/apply-credit` — Aplica a factura → quema token
- `GET /api/balance/:address` — Saldo de créditos

**Frontend:**
- Dashboard cooperativa (admin): lecturas, validación, usuarios, totales
- Dashboard usuario: generación, créditos, historial
- Login con wallet Stellar

**Flujo:**
```
Medidor → Cooperativa carga dato → Valida → Mint token
Usuario ve crédito → Cooperativa aplica a factura → Burn token
```

---

## Fase 2 — Multi-cooperativa

**Objetivo:** Cualquier cooperativa se suma. Cada una tiene su propio token.

**Contratos nuevos:**
- `cooperative_factory` — Despliega token + distribution en 1 tx
- `cooperative_registry` — Directorio de cooperativas y sus contratos

**Cambios:**
- Token recibe nombre/símbolo/cooperative_id en constructor
- Distribution migra a `__constructor`, agrega `update_members`, `transfer_admin`

**Frontend:**
- Onboarding de cooperativa
- Selector de cooperativa
- Panel admin BeEnergy

---

## Fase 3 — Governance + analytics

**Contratos:**
- `community_governance` completo: `vote()`, quorum, finalización

**Frontend:**
- Propuestas y votación
- Analytics: generación por período, ranking, proyecciones
- Reportes exportables, alertas

---

## Fase 4 — Inter-cooperativa

> Requiere evolución regulatoria + consulta legal previa.

**Contrato nuevo:**
- `cooperative_swap` — Burn token A → mint token B, tasa bilateral

**Requisitos:**
- Dictamen legal favorable
- Al menos 2 cooperativas activas
- Acuerdo bilateral firmado

---

## Marco legal

- **Fase 1-3:** Legal bajo Ley 27.424 (intra-cooperativa)
- **Fase 4:** Requiere consulta legal (Decreto 450/25 abre camino)
- **PSAV:** No aplica en Fase 1-3 (crédito operativo interno, no activo especulativo)
