"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useWallet } from "@/lib/wallet-context"

interface AuthSession {
  stellar_address: string
  cooperative_ids: string[]
  admin_cooperative_ids: string[]
}

interface AuthContextType {
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, kit, disconnectWallet } = useWallet()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setSession(data)
        } else {
          setSession(null)
        }
      } catch {
        setSession(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  // Auto-logout if wallet disconnects or address changes
  useEffect(() => {
    if (!isLoading && session) {
      if (!isConnected || (address && address !== session.stellar_address)) {
        setSession(null)
        fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
      }
    }
  }, [isConnected, address, session, isLoading])

  const login = useCallback(async () => {
    if (!address || !kit) {
      throw new Error("Wallet not connected")
    }

    // 1. Get challenge
    const challengeRes = await fetch("/api/auth/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stellar_address: address }),
    })

    if (!challengeRes.ok) {
      const err = await challengeRes.json()
      throw new Error(err.error || "Failed to get challenge")
    }

    const { challenge } = await challengeRes.json()

    // 2. Sign with wallet
    const messageBytes = new TextEncoder().encode(challenge)
    const { signedMessage } = await kit.signMessage(messageBytes)
    const signature = Buffer.from(signedMessage).toString("base64")

    // 3. Verify
    const verifyRes = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stellar_address: address,
        challenge,
        signature,
      }),
    })

    if (!verifyRes.ok) {
      const err = await verifyRes.json()
      throw new Error(err.error || "Authentication failed")
    }

    const sessionData = await verifyRes.json()
    setSession(sessionData)
  }, [address, kit])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    setSession(null)
    disconnectWallet()
  }, [disconnectWallet])

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated: session !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
