"use client"

import type React from "react"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  children: React.ReactNode
}

export function MobileMenu({ children }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-[#0d2416] p-2 rounded-full text-white"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={cn(
          "fixed inset-0 bg-[#1a472a] z-40 transform transition-transform duration-300 ease-in-out flex flex-col items-center justify-center",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col items-center space-y-6 w-full px-6">
          <div className="text-white text-2xl font-bold mb-6">LLAMAS HUB</div>
          {children}
        </div>
      </div>
    </div>
  )
}
