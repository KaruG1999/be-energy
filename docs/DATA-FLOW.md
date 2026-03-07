# BeEnergy — Data Flow

> Cuando te pierdas con el producto, volvé acá.

---

## El producto en una oración

**BeEnergy le da a una cooperativa eléctrica la herramienta para tokenizar créditos de generación distribuida y gestionarlos sin planillas.**

---

## El flujo completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ☀️  PANEL SOLAR genera electricidad                               │
│                                                                     │
│   El excedente se inyecta a la red de la cooperativa                │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   📊  MEDIDOR registra kWh inyectados                               │
│                                                                     │
│   Fase 1: la cooperativa carga el dato manual o por CSV             │
│   Fase 2: el medidor inteligente lo envía automáticamente           │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ✅  COOPERATIVA VALIDA la lectura                                 │
│                                                                     │
│   El admin de la cooperativa revisa el dato en el dashboard         │
│   y confirma que es correcto.                                       │
│                                                                     │
│   Sin validación, no hay crédito. La cooperativa es la autoridad.   │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   🪙  SE MINTEA EL CRÉDITO on-chain                                 │
│                                                                     │
│   1 token = 1 kWh validado                                         │
│   El token es SEP-41 (estándar Stellar)                             │
│   Cada cooperativa tiene su propio token con nombre propio          │
│                                                                     │
│   Contrato: energy_token.mint_energy(usuario, cantidad)             │
│   Blockchain: Stellar / Soroban                                     │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   👤  USUARIO VE SUS CRÉDITOS en el dashboard                       │
│                                                                     │
│   "Generaste 47.3 kWh este mes"                                    │
│   "Tenés 127.8 créditos disponibles"                                │
│   "Historial: marzo 47.3 · febrero 42.1 · enero 38.4"              │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   🔥  SE APLICA A FACTURA → se quema el token                      │
│                                                                     │
│   La cooperativa descuenta créditos del consumo facturado.          │
│   Los tokens aplicados se queman (burn). No se reusan.              │
│                                                                     │
│   Contrato: energy_token.burn_energy(usuario, cantidad)             │
│                                                                     │
│   Todo queda registrado en blockchain = auditable por terceros.     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quién es quién

```
┌──────────────────────┐     ┌──────────────────────┐
│                      │     │                      │
│   COOPERATIVA        │     │   USUARIO-GENERADOR  │
│   (nuestro cliente)  │     │   (usuario de la     │
│                      │     │    cooperativa)       │
│   • Carga lecturas   │     │                      │
│   • Valida datos     │     │   • Ve su dashboard  │
│   • Mintea créditos  │     │   • Ve sus créditos  │
│   • Aplica a factura │     │   • Ve su historial  │
│   • Ve analytics     │     │                      │
│   • Gestiona usuarios│     │   No necesita saber  │
│                      │     │   qué es blockchain.  │
│   Paga suscripción   │     │   Solo ve números    │
│   SaaS a BeEnergy.   │     │   en su dashboard.   │
│                      │     │                      │
└──────────┬───────────┘     └──────────────────────┘
           │
           │  usa
           ▼
┌──────────────────────────────────────────────────────┐
│                                                      │
│   BEENERGY (nosotros)                                │
│                                                      │
│   Plataforma SaaS                                    │
│                                                      │
│   ┌────────────┐  ┌────────────┐  ┌───────────────┐ │
│   │  Dashboard  │  │  API       │  │  Contratos    │ │
│   │  Next.js    │  │  Routes    │  │  Soroban      │ │
│   └──────┬─────┘  └──────┬─────┘  └───────┬───────┘ │
│          │               │                 │         │
│          └───────────────┼─────────────────┘         │
│                          │                           │
└──────────────────────────┼───────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│                                                      │
│   STELLAR NETWORK                                    │
│                                                      │
│   • Token SEP-41 por cooperativa                     │
│   • Smart contracts Soroban                          │
│   • Registro inmutable y auditable                   │
│   • Fees: ~0.00001 XLM por transacción               │
│                                                      │
│   La blockchain es infraestructura invisible.         │
│   El usuario nunca la ve. La cooperativa tampoco.    │
│   Solo está ahí para que todo sea verificable.       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Try Testnet / Waitlist

Dos puertas de entrada al producto:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    beenergy.app                                 │
│                                                                 │
│    "Gestión de créditos energéticos para cooperativas"          │
│                                                                 │
│    ┌─────────────────────┐    ┌─────────────────────────────┐  │
│    │                     │    │                             │  │
│    │   [ Try Testnet ]   │    │   [ Waitlist ]              │  │
│    │                     │    │                             │  │
│    │   "Probá el         │    │   "Avisame cuando           │  │
│    │    producto ahora   │    │    esté listo para          │  │
│    │    con datos de     │    │    mi cooperativa"          │  │
│    │    prueba. Sin      │    │                             │  │
│    │    compromiso,      │    │   → Nombre cooperativa      │  │
│    │    sin costo."      │    │   → Provincia               │  │
│    │                     │    │   → Cantidad de usuarios    │  │
│    │   → Crea wallet     │    │   → Email contacto          │  │
│    │     de prueba       │    │                             │  │
│    │   → Fondea con      │    │   "Te contactamos cuando    │  │
│    │     Friendbot       │    │    tengamos fecha de        │  │
│    │   → Ve el dashboard │    │    piloto en tu zona."      │  │
│    │     con datos       │    │                             │  │
│    │     simulados       │    │                             │  │
│    │                     │    │                             │  │
│    └─────────────────────┘    └─────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Try Testnet — qué ve la cooperativa

1. **Se crea una wallet de prueba** (Friendbot fondea con XLM de testnet)
2. **Ve el dashboard admin** con datos simulados:
   - 7 usuarios-generadores con lecturas de los últimos 5 días
   - Créditos minteados, historial, totales
3. **Puede interactuar**: validar una lectura pendiente, ver cómo se mintea el crédito, ver cómo se quema al aplicar a factura
4. **Todo en testnet** — no cuesta nada, no es real, pero funciona exactamente igual

### Waitlist — qué recopilamos

| Campo | Para qué |
|-------|----------|
| Nombre de la cooperativa | Saber quiénes son |
| Provincia | Saber qué regulación aplica |
| Cantidad de usuarios-generadores | Dimensionar el plan |
| Email de contacto | Avisar cuando haya piloto |

---

## Cuando me pierda, recuerdo esto

1. **El cliente es la cooperativa**, no el usuario final.
2. **El token es un crédito operativo**, no un activo especulativo.
3. **1 token = 1 kWh validado**. Siempre. Sin excepción.
4. **Sin validación de la cooperativa, no hay crédito.** La cooperativa es la autoridad.
5. **Blockchain es invisible.** Está para trazabilidad y auditoría, no para que el usuario la vea.
6. **BeEnergy gana plata con suscripción SaaS**, no con fees de transacción ni con tokens.
7. **Fase 1 es intra-cooperativa.** 100% legal bajo Ley 27.424, Art. 12f.
8. **No somos Xcapit.** Ellos hicieron un proyecto a medida para EPEC. Nosotros hacemos un producto replicable para cualquier cooperativa.
