# Flujo de Minteo de HDROP

> Guía operativa para entender cómo se crean tokens HDROP y cómo probar el flujo completo.

## Resumen

HDROP se emite ("mintea") cuando se valida una lectura de energía solar inyectada. **1 HDROP = 1 kWh verificado.**

Hay dos caminos para mintear:

| Camino | Cuándo usarlo | Quién lo usa |
|--------|--------------|--------------|
| **API pipeline** (`/api/mint`) | Flujo real de producción | Sistema automático / cooperativa |
| **Admin panel** (`/admin`) | Testing rápido, asignar tokens manualmente | Admin con wallet conectada |

---

## Camino 1: API Pipeline (flujo real)

Este es el flujo que simula el proceso real de una cooperativa registrando lecturas de medidor y emitiendo créditos.

### Paso 1 — Registrar prosumidor

```bash
curl -X POST http://localhost:3000/api/prosumers \
  -H "Content-Type: application/json" \
  -d '{
    "stellar_address": "GDEPRAQKNMTNGZCKL4GU5HGQ4UL6LZ4PS46LZ5HG44CSPBVZXQUL36B4",
    "name": "Romi",
    "panel_capacity_kw": 3.5
  }'
```

Respuesta: `{ "id": "uuid-del-prosumer", ... }`

### Paso 2 — Cargar lectura de energía

```bash
curl -X POST http://localhost:3000/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "stellar_address": "GDEPRAQKNMTNGZCKL4GU5HGQ4UL6LZ4PS46LZ5HG44CSPBVZXQUL36B4",
    "kwh_injected": 15.5,
    "kwh_consumed": 8.2,
    "reading_date": "2026-03-05"
  }'
```

Respuesta: `{ "id": "uuid-del-reading", "status": "pending", ... }`

La lectura queda en estado `pending` hasta que se mintee.

### Paso 3 — Mintear HDROP

```bash
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "reading_id": "uuid-del-reading"
  }'
```

Respuesta exitosa:
```json
{
  "success": true,
  "tx_hash": "5a7ef41bf548...",
  "amount_hdrop": 15.5,
  "prosumer_address": "GDEPR..."
}
```

### Qué pasa internamente

```
POST /api/mint { reading_id }
  │
  ├─ Busca el reading en Supabase (debe ser status: "pending")
  ├─ Obtiene stellar_address del prosumer asociado
  ├─ Calcula: kwh_injected × 10^7 (formato Soroban)
  ├─ Construye tx: mint_energy(to, amount, minter)
  ├─ Firma con MINTER_SECRET_KEY (server-side, nunca se expone)
  ├─ Envía a Soroban RPC → espera confirmación
  ├─ Actualiza reading: status → "minted", guarda tx_hash
  └─ Inserta registro en mint_log
```

### Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Reading not found` | El `reading_id` no existe en Supabase | Verificar que creaste la lectura primero (paso 2) |
| `Reading status is 'minted'` | Ya se minteó | Crear una nueva lectura con otra fecha |
| `MINTER_SECRET_KEY not configured` | Falta la variable de entorno | Agregar `MINTER_SECRET_KEY` en `.env.local` |
| `Transaction failed` | La cuenta minter no tiene rol `minter` en el contrato | El admin debe llamar `grant_minter` desde el contrato |

---

## Camino 2: Admin Panel (testing rápido)

Para probar cosas rápido sin pasar por el pipeline de Supabase.

### Desde la UI

1. Ir a `http://localhost:3000/admin`
2. Conectar wallet del admin (`GCHCYTHV4JSIJNCN56EIEXZNTB6JUHYX25FTSYFOM4DDVGV7UXWOHLCW`)
3. Ingresar dirección destino y cantidad de kWh
4. Firmar la transacción con la wallet

**Nota:** La wallet conectada necesita tener el rol `minter` en el contrato. El admin lo tiene por defecto.

### Desde un script (sin wallet)

Si necesitás mintear desde la terminal usando la secret key del server:

```bash
node -e "
const StellarSdk = require('@stellar/stellar-sdk');

const RPC = 'https://soroban-testnet.stellar.org';
const NETWORK = 'Test SDF Network ; September 2015';
const TOKEN = 'CAUH3NUZGCNRHHVJK5S3FLXIS244GCNPC2LDZDU2SVOK66G3IGAGBBL2';
const MINTER_SECRET = process.env.MINTER_SECRET_KEY;
const RECIPIENT = 'GXXXXX...';  // ← dirección destino
const AMOUNT = 100;              // ← cantidad en kWh/HDROP

async function mint() {
  const server = new StellarSdk.rpc.Server(RPC);
  const keypair = StellarSdk.Keypair.fromSecret(MINTER_SECRET);
  const account = await server.getAccount(keypair.publicKey());
  const contract = new StellarSdk.Contract(TOKEN);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: NETWORK,
  })
    .addOperation(
      contract.call(
        'mint_energy',
        StellarSdk.nativeToScVal(RECIPIENT, { type: 'address' }),
        StellarSdk.nativeToScVal(BigInt(Math.round(AMOUNT * 1e7)), { type: 'i128' }),
        StellarSdk.nativeToScVal(keypair.publicKey(), { type: 'address' })
      )
    )
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(keypair);
  const result = await server.sendTransaction(prepared);
  console.log('Hash:', result.hash);

  let response = await server.getTransaction(result.hash);
  while (response.status === 'NOT_FOUND') {
    await new Promise(r => setTimeout(r, 1000));
    response = await server.getTransaction(result.hash);
  }
  console.log('Status:', response.status);
}

mint();
"
```

---

## Verificar que funcionó

### Ver balance del destinatario

```bash
# Desde la terminal (simula el hook useEnergyToken.getBalance)
node -e "
const S = require('@stellar/stellar-sdk');
const server = new S.rpc.Server('https://soroban-testnet.stellar.org');
const contract = new S.Contract('CAUH3NUZGCNRHHVJK5S3FLXIS244GCNPC2LDZDU2SVOK66G3IGAGBBL2');

(async () => {
  const addr = 'GXXXXX...'; // ← dirección a consultar
  const account = await server.getAccount(addr);
  const tx = new S.TransactionBuilder(account, {
    fee: S.BASE_FEE,
    networkPassphrase: 'Test SDF Network ; September 2015',
  })
    .addOperation(contract.call('balance', S.nativeToScVal(addr, { type: 'address' })))
    .setTimeout(30)
    .build();
  const sim = await server.simulateTransaction(tx);
  if (S.rpc.Api.isSimulationSuccess(sim)) {
    const raw = S.scValToNative(sim.result.retval);
    console.log('Balance:', (Number(raw) / 1e7).toFixed(2), 'HDROP');
  }
})();
"
```

### Ver transacción en Horizon

```
https://horizon-testnet.stellar.org/transactions/<TX_HASH>
```

### Desde el dashboard

Conectar la wallet del destinatario en `/dashboard` — el balance HDROP y las últimas transacciones aparecen automáticamente.

---

## Diagrama del flujo completo

```
                    CAMINO 1: API PIPELINE
                    (flujo real / cooperativa)

  Cooperativa               Supabase                Soroban (Testnet)
      │                        │                         │
      ├─ POST /api/prosumers ─→│ prosumers table         │
      │                        │                         │
      ├─ POST /api/readings ──→│ readings (pending)      │
      │                        │                         │
      ├─ POST /api/mint ──────→│ reading_id lookup       │
      │                        │     │                   │
      │                        │     ├─ mint_energy() ──→│ HDROP emitido
      │                        │     │                   │
      │                        │     ├─ status → minted  │
      │                        │     └─ mint_log insert  │
      │                        │                         │


                    CAMINO 2: ADMIN PANEL
                    (testing rápido)

  Admin (wallet)                                  Soroban (Testnet)
      │                                                │
      ├─ /admin → mint form ─────────────────────────→│
      │   (firma con wallet)     mint_energy()         │ HDROP emitido
      │                                                │


                    VERIFICACIÓN

  Usuario                  Dashboard               Soroban / Horizon
      │                       │                         │
      ├─ Conecta wallet ─────→│                         │
      │                       ├─ useEnergyToken() ─────→│ balance()
      │                       ├─ useHorizonPayments() ─→│ /payments
      │                       │                         │
      │  ← Ve balance + txs ──┤                         │
```
