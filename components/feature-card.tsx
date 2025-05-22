"use client"

import { useState } from "react"
import { BridgeWidget } from "./bridge-widget"

interface FeatureCardProps {
  title: string
  description: string
  icon: string
  isBridge?: boolean
}

export function FeatureCard({ title, description, icon, isBridge = false }: FeatureCardProps) {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)

  const openWidget = () => {
    if (isBridge) {
      setIsWidgetOpen(true)
    }
  }

  const closeWidget = () => setIsWidgetOpen(false)

  return (
    <>
      <div
        className={`bg-[#0d2416] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow ${
          isBridge ? "cursor-pointer" : ""
        }`}
        onClick={openWidget}
      >
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
        <p className="text-green-100">{description}</p>
        {isBridge && (
          <div className="mt-4">
            <span className="text-green-400 text-sm">Powered by deBridge</span>
          </div>
        )}
      </div>

      {isBridge && <BridgeWidget isOpen={isWidgetOpen} onClose={closeWidget} />}
    </>
  )
}
