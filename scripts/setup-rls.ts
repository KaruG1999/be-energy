import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: "apps/web/.env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const SQL = `
-- ============================================
-- BeEnergy RLS Policies (defense in depth)
-- Service role key bypasses all RLS — this is expected for API routes
-- ============================================

-- Enable RLS on all tables
ALTER TABLE cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE prosumers ENABLE ROW LEVEL SECURITY;
ALTER TABLE meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE retirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE mint_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- cooperatives: public read, no anon write
DROP POLICY IF EXISTS cooperatives_select ON cooperatives;
CREATE POLICY cooperatives_select ON cooperatives FOR SELECT USING (true);

DROP POLICY IF EXISTS cooperatives_deny_anon ON cooperatives;
CREATE POLICY cooperatives_deny_anon ON cooperatives FOR INSERT WITH CHECK (false);

-- prosumers: no anon access
DROP POLICY IF EXISTS prosumers_deny_anon ON prosumers;
CREATE POLICY prosumers_deny_anon ON prosumers FOR ALL USING (false);

-- meters: no anon access
DROP POLICY IF EXISTS meters_deny_anon ON meters;
CREATE POLICY meters_deny_anon ON meters FOR ALL USING (false);

-- readings: no anon access
DROP POLICY IF EXISTS readings_deny_anon ON readings;
CREATE POLICY readings_deny_anon ON readings FOR ALL USING (false);

-- certificates: public read (transparency), no anon write
DROP POLICY IF EXISTS certificates_select ON certificates;
CREATE POLICY certificates_select ON certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS certificates_deny_write ON certificates;
CREATE POLICY certificates_deny_write ON certificates FOR INSERT WITH CHECK (false);

-- retirements: public read
DROP POLICY IF EXISTS retirements_select ON retirements;
CREATE POLICY retirements_select ON retirements FOR SELECT USING (true);

DROP POLICY IF EXISTS retirements_deny_write ON retirements;
CREATE POLICY retirements_deny_write ON retirements FOR INSERT WITH CHECK (false);

-- mint_log: no anon access
DROP POLICY IF EXISTS mint_log_deny_anon ON mint_log;
CREATE POLICY mint_log_deny_anon ON mint_log FOR ALL USING (false);

-- auth_challenges: no anon access
DROP POLICY IF EXISTS auth_challenges_deny_anon ON auth_challenges;
CREATE POLICY auth_challenges_deny_anon ON auth_challenges FOR ALL USING (false);

-- rate_limits: no anon access
DROP POLICY IF EXISTS rate_limits_deny_anon ON rate_limits;
CREATE POLICY rate_limits_deny_anon ON rate_limits FOR ALL USING (false);

-- audit_log: no anon access
DROP POLICY IF EXISTS audit_log_deny_anon ON audit_log;
CREATE POLICY audit_log_deny_anon ON audit_log FOR ALL USING (false);
`

async function main() {
  console.log("Setting up Row Level Security policies...")
  const { error } = await supabase.rpc("exec_sql", { query: SQL })

  if (error) {
    console.error("Could not execute SQL via RPC:", error.message)
    console.log("\nRun the following SQL directly in the Supabase SQL Editor:\n")
    console.log(SQL)
    process.exit(1)
  }

  console.log("RLS policies created successfully!")
}

main()
