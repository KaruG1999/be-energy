"use client"

import { useState, useEffect, useCallback } from "react"

export interface Meter {
  id: string
  cooperative_id: string
  device_type: string
  technology: string
  capacity_kw: number
  member_stellar_address: string | null
  manufacturer: string | null
  model: string | null
  serial_number: string | null
  status: string
  created_at: string
}

export function useMyMeters() {
  const [meters, setMeters] = useState<Meter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/meters")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to fetch meters")
      setMeters(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  return { meters, loading, error, refetch: fetch_ }
}
