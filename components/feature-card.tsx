"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"
import { BridgeWidget } from "./bridge-widget"

interface FeatureCardProps {
  title: string
  description: string
  icon: string
  href?: string
  isBridge?: boolean
}

export function FeatureCard({ title, description, icon, href, isBridge = false }: FeatureCardProps) {
  const [isBridgeOpen, setIsBridgeOpen] = useState(false)

  const handleBridgeClick = () => {
    setIsBridgeOpen(true)
  }

  const handleBridgeClose = () => {
    setIsBridgeOpen(false)
  }

  const renderIcon = () => {
    if (icon === "Search") {
      return <Search className="w-6 h-6 text-green-400" />
    }
    return <span className="text-2xl">{icon}</span>
  }

  if (isBridge) {
    return (
      <>
        <div
          className="bg-[#0d2416] border border-[#1a3726] rounded-lg p-6 hover:border-[#00ffaa]/30 transition-all duration-300 cursor-pointer"
          onClick={handleBridgeClick}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#143621] p-3 rounded-lg">{renderIcon()}</div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
            </div>
            <ArrowRight className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-gray-300">{description}</p>
        </div>

        {isBridgeOpen && <BridgeWidget isOpen={isBridgeOpen} onClose={handleBridgeClose} />}
      </>
    )
  }

  return (
    <Link
      href={href || "#"}
      className="bg-[#0d2416] border border-[#1a3726] rounded-lg p-6 hover:border-[#00ffaa]/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#143621] p-3 rounded-lg">{renderIcon()}</div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        <ArrowRight className="w-5 h-5 text-green-400" />
      </div>
      <p className="text-gray-300">{description}</p>
    </Link>
  )
}
