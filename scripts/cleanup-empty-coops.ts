import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: "apps/web/.env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function clean() {
  // Delete everything in order (respecting foreign keys)
  await supabase.from("retirements").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  console.log("Deleted retirements")
  await supabase.from("mint_log").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  console.log("Deleted mint_log")
  await supabase.from("certificates").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  console.log("Deleted certificates")
  await supabase.from("readings").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  console.log("Deleted readings")
  await supabase.from("meters").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  console.log("Deleted meters")
  await supabase.from("prosumers").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  console.log("Deleted prosumers")
  await supabase.from("cooperatives").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  console.log("Deleted cooperatives")
  console.log("All data cleaned.")
}

clean()
