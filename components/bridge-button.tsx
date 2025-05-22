"use client"

import { useState } from "react"
import { ArrowRightLeft } from "lucide-react"
import { BridgeWidget } from "./bridge-widget"

export function BridgeButton() {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)

  const openWidget = () => setIsWidgetOpen(true)
  const closeWidget = () => setIsWidgetOpen(false)

  return (
    <>
      <button
        onClick={openWidget}
        className="flex items-center gap-2 bg-[#0d2416] px-3 py-2 rounded-lg hover:bg-[#143621] transition-colors"
      >
        <ArrowRightLeft size={16} className="text-white" />
        <span className="text-white text-sm font-medium hidden md:inline">Llamas Bridge</span>
      </button>

      <BridgeWidget isOpen={isWidgetOpen} onClose={closeWidget} />
    </>
  )
}
