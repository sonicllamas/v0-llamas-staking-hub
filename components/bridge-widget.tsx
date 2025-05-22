"use client"

import { useEffect, useRef } from "react"
import Script from "next/script"

interface BridgeWidgetProps {
  isOpen: boolean
  onClose: () => void
}

export function BridgeWidget({ isOpen, onClose }: BridgeWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Clean up function to remove the widget when component unmounts
    return () => {
      if (window.deBridge && widgetRef.current) {
        // Clean up if needed
      }
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-[#0d2416] rounded-xl p-4 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-xl font-bold">Llamas Bridge Powered By deBridge</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close bridge widget"
          >
            ✕
          </button>
        </div>

        <div ref={widgetRef} id="debridgeWidget" className="w-full h-[600px]"></div>

        <Script
          src="https://app.debridge.finance/assets/scripts/widget.js"
          strategy="lazyOnload"
          onLoad={() => {
            if (window.deBridge) {
              window.deBridge.widget({
                v: "1",
                element: "debridgeWidget",
                title: "Llamas Bridge",
                description: "Llamas Bridge is powered by deBridge",
                width: "100%",
                height: "600",
                r: "2025",
                affiliateFeePercent: "1",
                affiliateFeeRecipient: "0x1e9f317cb3a0c3b23c9d82daec5a18d7895639f0",
                supportedChains: JSON.stringify({
                  inputChains: {
                    "1": "all",
                    "10": "all",
                    "56": "all",
                    "100": "all",
                    "137": "all",
                    "146": "all",
                    "250": "all",
                    "388": "all",
                    "747": "all",
                    "998": "all",
                    "1088": "all",
                    "1514": "all",
                    "2741": "all",
                    "4158": "all",
                    "5000": "all",
                    "7171": "all",
                    "8453": "all",
                    "32769": "all",
                    "42161": "all",
                    "43114": "all",
                    "48900": "all",
                    "59144": "all",
                    "60808": "all",
                    "80094": "all",
                    "98866": "all",
                    "7565164": "all",
                    "245022934": "all",
                  },
                  outputChains: {
                    "1": "all",
                    "10": "all",
                    "56": "all",
                    "100": "all",
                    "137": "all",
                    "146": "all",
                    "250": "all",
                    "388": "all",
                    "747": "all",
                    "998": "all",
                    "999": "all",
                    "1088": "all",
                    "1514": "all",
                    "2741": "all",
                    "4158": "all",
                    "5000": "all",
                    "7171": "all",
                    "8453": "all",
                    "32769": "all",
                    "42161": "all",
                    "43114": "all",
                    "48900": "all",
                    "59144": "all",
                    "60808": "all",
                    "80094": "all",
                    "98866": "all",
                    "7565164": "all",
                    "245022934": "all",
                  },
                }),
                inputChain: 146, // Default to Sonic Mainnet
                outputChain: 1,
                inputCurrency: "",
                outputCurrency: "",
                address: "",
                showSwapTransfer: true,
                amount: "",
                outputAmount: "",
                isAmountFromNotModifiable: false,
                isAmountToNotModifiable: false,
                lang: "en",
                mode: "deswap",
                isEnableCalldata: false,
                styles: "e30=",
                theme: "dark",
                isHideLogo: true,
                logo: "",
                disabledWallets: [],
                disabledElements: [],
              })
            }
          }}
        />
      </div>
    </div>
  )
}
