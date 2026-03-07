import { supabase } from "@/lib/supabase"

export type AuditAction =
  | "login"
  | "login_failed"
  | "mint"
  | "retire"
  | "create_cooperative"
  | "add_member"

interface AuditEntry {
  action: AuditAction
  actor: string
  resource_type?: string
  resource_id?: string
  details?: Record<string, unknown>
  ip_address?: string
}

/** Fire-and-forget audit log — never blocks the response */
export function auditLog(entry: AuditEntry): void {
  supabase
    .from("audit_log")
    .insert({
      action: entry.action,
      actor: entry.actor,
      resource_type: entry.resource_type ?? null,
      resource_id: entry.resource_id ?? null,
      details: entry.details ?? {},
      ip_address: entry.ip_address ?? null,
    })
    .then(({ error }) => {
      if (error) console.error("[Audit] Failed to log:", error.message)
    })
}
