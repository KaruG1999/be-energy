import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: "apps/web/.env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// --- 10 cooperativas argentinas realistas ---
const COOPERATIVES = [
  { name: "Cooperativa Eléctrica de Justiniano Posse", location: "Justiniano Posse", province: "Córdoba", technology: "solar" as const },
  { name: "Cooperativa Popular de Electricidad de Santa Rosa", location: "Santa Rosa", province: "La Pampa", technology: "solar" as const },
  { name: "Cooperativa de Electricidad de Trenque Lauquen", location: "Trenque Lauquen", province: "Buenos Aires", technology: "solar" as const },
  { name: "Cooperativa Eléctrica de Godoy Cruz", location: "Godoy Cruz", province: "Mendoza", technology: "solar" as const },
  { name: "Cooperativa de Energía de Oberá", location: "Oberá", province: "Misiones", technology: "mixed" as const },
  { name: "Cooperativa Eléctrica de Río Tercero", location: "Río Tercero", province: "Córdoba", technology: "solar" as const },
  { name: "Cooperativa de Electricidad de Pergamino", location: "Pergamino", province: "Buenos Aires", technology: "wind" as const },
  { name: "Cooperativa Eléctrica de Villa María", location: "Villa María", province: "Córdoba", technology: "solar" as const },
  { name: "Cooperativa de Electricidad de San Rafael", location: "San Rafael", province: "Mendoza", technology: "hydro" as const },
  { name: "Cooperativa Popular de Electricidad de Olavarría", location: "Olavarría", province: "Buenos Aires", technology: "mixed" as const },
]

// Stellar addresses de prueba (testnet)
function fakeAddress(seed: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  let addr = "G"
  // Use crypto-style hashing to avoid collisions
  let hash = seed
  for (let i = 0; i < 55; i++) {
    hash = ((hash * 1103515245 + 12345) >>> 0) % 2147483647
    addr += chars[hash % chars.length]
  }
  return addr
}

// Curva solar gaussiana
function solarFactor(hour: number): number {
  const peak = 13
  const sigma = 3
  return Math.exp(-0.5 * ((hour - peak) / sigma) ** 2)
}

function generateReading(capacityKw: number, timestamp: Date) {
  const hour = timestamp.getHours() + timestamp.getMinutes() / 60
  const solar = solarFactor(hour)
  if (solar < 0.01) return null

  const weatherFactor = 0.6 + Math.random() * 0.4
  const powerKw = capacityKw * solar * weatherFactor
  const kwhGenerated = powerKw * (15 / 60)

  return {
    kwh_generated: Math.round(kwhGenerated * 1000) / 1000,
    power_watts: Math.round(powerKw * 1000),
  }
}

const DEVICE_TYPES = ["inverter", "bidirectional_meter", "smart_meter"] as const
const MANUFACTURERS = ["Fronius", "Huawei", "SMA", "DISCAR", "Goodwe", "Growatt"]
const MODELS = ["Primo 5.0", "SUN2000-5KTL", "Sunny Boy 5.0", "Mr.DiMS", "GW5000-MS", "MIN 5000TL-X"]
const TECHNOLOGIES = ["solar", "solar", "solar", "wind", "hydro", "solar"] as const

async function main() {
  console.log("=== Simulación de 10 cooperativas ===\n")

  let addressSeed = 100
  const BACKFILL_DAYS = 7

  for (let c = 0; c < COOPERATIVES.length; c++) {
    const coopData = COOPERATIVES[c]
    const adminAddress = fakeAddress(addressSeed++)

    // 1. Crear cooperativa
    const { data: coop, error: coopErr } = await supabase
      .from("cooperatives")
      .insert({
        name: coopData.name,
        location: coopData.location,
        province: coopData.province,
        country: "AR",
        technology: coopData.technology,
        admin_stellar_address: adminAddress,
        status: "active",
      })
      .select()
      .single()

    if (coopErr || !coop) {
      console.error(`Error creando ${coopData.name}:`, coopErr?.message)
      continue
    }

    console.log(`✓ Cooperativa ${c + 1}/10: ${coop.name} (${coop.id.slice(0, 8)}…)`)

    // 2. Crear miembros (3 a 6 por cooperativa)
    const numMembers = 3 + Math.floor(Math.random() * 4)
    const members = []

    for (let m = 0; m < numMembers; m++) {
      const memberAddress = fakeAddress(addressSeed++)
      const { data: member, error: memberErr } = await supabase
        .from("prosumers")
        .insert({
          name: `Miembro ${m + 1} - ${coopData.location}`,
          stellar_address: memberAddress,
          cooperative_id: coop.id,
          role: m === 0 ? "prosumer" : m % 3 === 0 ? "copropietario" : "prosumer",
        })
        .select()
        .single()

      if (memberErr) {
        console.error(`  Error miembro: ${memberErr.message}`)
        continue
      }
      members.push(member)
    }

    console.log(`  └─ ${members.length} miembros`)

    // 3. Crear medidores (1 por miembro)
    const meters = []
    for (let m = 0; m < members.length; m++) {
      const member = members[m]
      const devIdx = m % DEVICE_TYPES.length
      const techIdx = m % TECHNOLOGIES.length
      const capacityKw = 3 + Math.random() * 12

      const { data: meter, error: meterErr } = await supabase
        .from("meters")
        .insert({
          cooperative_id: coop.id,
          member_stellar_address: member.stellar_address,
          device_type: DEVICE_TYPES[devIdx],
          manufacturer: MANUFACTURERS[m % MANUFACTURERS.length],
          model: MODELS[m % MODELS.length],
          serial_number: `SN-${coop.id.slice(0, 4)}-${m + 1}`,
          technology: TECHNOLOGIES[techIdx],
          capacity_kw: Math.round(capacityKw * 10) / 10,
          status: "active",
        })
        .select()
        .single()

      if (meterErr) {
        console.error(`  Error medidor: ${meterErr.message}`)
        continue
      }
      meters.push(meter)
    }

    console.log(`  └─ ${meters.length} medidores`)

    // 4. Generar lecturas (7 días de backfill)
    let totalReadings = 0
    let totalKwh = 0

    const now = new Date()
    for (let d = BACKFILL_DAYS; d >= 1; d--) {
      const date = new Date(now)
      date.setDate(date.getDate() - d)

      for (const meter of meters) {
        const readings = []
        for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
          const ts = new Date(date)
          ts.setHours(0, 0, 0, 0)
          ts.setMinutes(minutes)

          const reading = generateReading(meter.capacity_kw, ts)
          if (!reading) continue

          readings.push({
            meter_id: meter.id,
            cooperative_id: coop.id,
            kwh_generated: reading.kwh_generated,
            kwh_injected: reading.kwh_generated,
            reading_date: ts.toISOString().split("T")[0],
            power_watts: reading.power_watts,
            reading_timestamp: ts.toISOString(),
            interval_minutes: 15,
          })
        }

        if (readings.length > 0) {
          const { error: readErr } = await supabase.from("readings").insert(readings)
          if (readErr) {
            console.error(`  Error lecturas: ${readErr.message}`)
          } else {
            totalReadings += readings.length
            totalKwh += readings.reduce((s, r) => s + r.kwh_generated, 0)
          }
        }
      }
    }

    console.log(`  └─ ${totalReadings} lecturas (${totalKwh.toFixed(1)} kWh en ${BACKFILL_DAYS} días)`)

    // 5. Crear certificado del período
    const periodEnd = new Date(now)
    periodEnd.setDate(periodEnd.getDate() - 1)
    const periodStart = new Date(periodEnd)
    periodStart.setDate(periodStart.getDate() - BACKFILL_DAYS + 1)

    const { data: cert, error: certErr } = await supabase
      .from("certificates")
      .insert({
        cooperative_id: coop.id,
        generation_period_start: periodStart.toISOString().split("T")[0],
        generation_period_end: periodEnd.toISOString().split("T")[0],
        total_kwh: Math.round(totalKwh * 100) / 100,
        technology: coopData.technology,
        location: `${coopData.location}, ${coopData.province}`,
        status: "pending",
      })
      .select()
      .single()

    if (certErr) {
      console.error(`  Error certificado: ${certErr.message}`)
    } else {
      console.log(`  └─ Certificado: ${cert.total_kwh} kWh (${cert.status})`)
    }

    console.log()
  }

  // --- Resumen ---
  const { count: coopCount } = await supabase.from("cooperatives").select("*", { count: "exact", head: true })
  const { count: memberCount } = await supabase.from("prosumers").select("*", { count: "exact", head: true })
  const { count: meterCount } = await supabase.from("meters").select("*", { count: "exact", head: true })
  const { count: readingCount } = await supabase.from("readings").select("*", { count: "exact", head: true })
  const { count: certCount } = await supabase.from("certificates").select("*", { count: "exact", head: true })

  console.log("=== RESUMEN ===")
  console.log(`Cooperativas:  ${coopCount}`)
  console.log(`Miembros:      ${memberCount}`)
  console.log(`Medidores:     ${meterCount}`)
  console.log(`Lecturas:      ${readingCount}`)
  console.log(`Certificados:  ${certCount}`)
  console.log("\nSimulación completa.")
}

main().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
