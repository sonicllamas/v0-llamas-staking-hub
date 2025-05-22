"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface StakingButtonProps {
  href: string
  className?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function StakingButton({ href, className, children, onClick, disabled = false }: StakingButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const buttonClasses = cn(
    "bg-white text-black text-lg md:text-xl font-bold py-3 md:py-4 px-4 md:px-6 rounded-full text-center transition-all duration-200 flex items-center justify-center shadow-md",
    isHovered && !disabled ? "bg-green-100 transform scale-[1.02]" : "",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={buttonClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={disabled}
      >
        {children}
      </button>
    )
  }

  return (
    <Link
      href={href}
      className={buttonClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-disabled={disabled}
      onClick={(e) => disabled && e.preventDefault()}
    >
      {children}
    </Link>
  )
}
