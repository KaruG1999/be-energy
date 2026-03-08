"use client"

import { useState, useEffect, useCallback } from "react"

export interface Cooperative {
  id: string
  name: string
  technology: string
  admin_stellar_address: string
  location: string | null
  province: string | null
  status: string
  created_at: string
}

export function useCooperatives() {
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCooperatives = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/cooperatives")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch cooperatives")
      }

      setCooperatives(data)
    } catch (err) {
      console.error("Error fetching cooperatives:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCooperatives()
  }, [fetchCooperatives])

  return { cooperatives, loading, error, refetch: fetchCooperatives }
}
