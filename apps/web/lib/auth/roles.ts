import { supabase } from "@/lib/supabase"

interface ResolvedRoles {
  cooperative_ids: string[]
  admin_cooperative_ids: string[]
}

export async function resolveRoles(stellarAddress: string): Promise<ResolvedRoles> {
  // Check if admin of any cooperatives
  const { data: adminCoops } = await supabase
    .from("cooperatives")
    .select("id")
    .eq("admin_stellar_address", stellarAddress)

  const admin_cooperative_ids = (adminCoops ?? []).map((c) => c.id)

  // Check if member (prosumer) of any cooperatives
  const { data: memberships } = await supabase
    .from("prosumers")
    .select("cooperative_id")
    .eq("stellar_address", stellarAddress)
    .not("cooperative_id", "is", null)

  const member_coop_ids = (memberships ?? [])
    .map((m) => m.cooperative_id)
    .filter((id): id is string => id !== null)

  // Combine unique IDs
  const cooperative_ids = [...new Set([...admin_cooperative_ids, ...member_coop_ids])]

  return { cooperative_ids, admin_cooperative_ids }
}
