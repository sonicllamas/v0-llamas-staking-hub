"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

export function BridgeWidget() {
  const widgetRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="w-full h-[500px] bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div ref={widgetRef} id="debridgeWidget" className="w-full h-[500px] rounded-lg overflow-hidden" />

      <Script
        src="https://app.debridge.finance/assets/scripts/widget.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (window.deBridge) {
            window.deBridge.widget({
              v: "1",
              element: "debridgeWidget",
              title: "Llamas Bridge",
              description: "Bridge assets across chains",
              width: "100%",
              height: "500",
              r: "2025",
              affiliateFeePercent: "1",
              affiliateFeeRecipient: "0x1e9f317cb3a0c3b23c9d82daec5a18d7895639f0",
              supportedChains: JSON.stringify({
                inputChains: {
                  "1": "all",
                  "10": "all",
                  "56": "all",
                  "137": "all",
                  "146": "all",
                  "250": "all",
                  "42161": "all",
                  "43114": "all",
                },
                outputChains: {
                  "1": "all",
                  "10": "all",
                  "56": "all",
                  "137": "all",
                  "146": "all",
                  "250": "all",
                  "42161": "all",
                  "43114": "all",
                },
              }),
              inputChain: 146,
              outputChain: 1,
              lang: "en",
              mode: "deswap",
              theme: "dark",
              isHideLogo: true,
              disabledWallets: [],
              disabledElements: [],
            })
          }
        }}
      />
    </div>
  )
}
