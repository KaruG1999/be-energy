import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const SQL = `
-- Tabla prosumers
CREATE TABLE IF NOT EXISTS prosumers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stellar_address TEXT UNIQUE NOT NULL,
  name TEXT,
  hive_id TEXT DEFAULT 'hive-piloto',
  panel_capacity_kw REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla readings
CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prosumer_id UUID NOT NULL REFERENCES prosumers(id),
  kwh_injected REAL NOT NULL,
  kwh_consumed REAL,
  reading_date DATE NOT NULL,
  source TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'pending',
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prosumer_id, reading_date)
);

-- Tabla mint_log
CREATE TABLE IF NOT EXISTS mint_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID REFERENCES readings(id),
  prosumer_address TEXT NOT NULL,
  amount_hdrop REAL NOT NULL,
  tx_hash TEXT NOT NULL,
  minted_at TIMESTAMPTZ DEFAULT now()
);
`

async function main() {
  console.log("Creating tables...")
  const { error } = await supabase.rpc("exec_sql", { query: SQL })

  if (error) {
    // If RPC not available, try via REST — user should run SQL directly in Supabase dashboard
    console.error("Could not execute SQL via RPC:", error.message)
    console.log("\nRun the following SQL directly in the Supabase SQL Editor:\n")
    console.log(SQL)
    process.exit(1)
  }

  console.log("Tables created successfully!")
}

main()
