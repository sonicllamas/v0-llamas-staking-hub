"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"

export function ThemeSwitcher() {
  const { chainId } = useWallet()
  const [mounted, setMounted] = useState(false)

  // Apply Sonic theme when on Sonic network
  useEffect(() => {
    setMounted(true)

    if (chainId === 146) {
      document.documentElement.classList.add("sonic-theme")
    } else {
      document.documentElement.classList.remove("sonic-theme")
    }

    return () => {
      document.documentElement.classList.remove("sonic-theme")
    }
  }, [chainId])

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) return null

  return null
}
