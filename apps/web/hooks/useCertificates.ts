"use client"

import { useState, useEffect, useCallback } from "react"

export interface Certificate {
  id: string
  cooperative_id: string
  generation_period_start: string
  generation_period_end: string
  total_kwh: number
  technology: string
  location: string | null
  status: "pending" | "available" | "retired"
  mint_tx_hash: string | null
  created_at: string
  cooperatives: {
    name: string
    technology: string
    location: string | null
  } | null
}

interface UseCertificatesOptions {
  technology?: string
  status?: string
}

export function useCertificates(options?: UseCertificatesOptions) {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options?.technology) params.set("technology", options.technology)
      if (options?.status) params.set("status", options.status)

      const url = `/api/certificates${params.toString() ? `?${params}` : ""}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch certificates")
      }

      setCertificates(data)
    } catch (err) {
      console.error("Error fetching certificates:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [options?.technology, options?.status])

  useEffect(() => {
    fetchCertificates()
  }, [fetchCertificates])

  return { certificates, loading, error, refetch: fetchCertificates }
}
