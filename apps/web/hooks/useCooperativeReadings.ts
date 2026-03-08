"use client"

import { useState, useEffect, useCallback } from "react"

export interface CooperativeReading {
  id: string
  prosumer_id: string | null
  meter_id: string | null
  cooperative_id: string
  kwh_generated: number
  kwh_self_consumed: number | null
  reading_date: string | null
  status: string
  source: string
  created_at: string
  prosumers: { name: string | null; stellar_address: string } | null
}

export function useCooperativeReadings(coopId: string | null) {
  const [readings, setReadings] = useState<CooperativeReading[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    if (!coopId) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/cooperatives/${coopId}/readings`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to fetch readings")
      setReadings(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [coopId])

  useEffect(() => { fetch_() }, [fetch_])

  return { readings, loading, error, refetch: fetch_ }
}
