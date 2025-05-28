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
        className="flex items-center justify-center gap-2 bg-[#143621] hover:bg-[#1a4528] px-4 py-3 rounded-md transition-colors w-full"
      >
        <ArrowRightLeft size={18} className="text-[#00ffaa]" />
        <span className="text-white font-medium">Bridge Now</span>
      </button>

      <BridgeWidget isOpen={isWidgetOpen} onClose={closeWidget} />
    </>
  )
}
