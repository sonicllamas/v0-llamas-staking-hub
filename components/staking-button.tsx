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
  variant?: "default" | "sonic" | "success" | "danger"
}

export function StakingButton({
  href,
  className,
  children,
  onClick,
  disabled = false,
  variant = "default",
}: StakingButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // Define variant-specific styles
  const variantStyles = {
    default: "bg-white text-black hover:bg-green-100",
    sonic: "bg-sonic text-white hover:bg-sonic-dark",
    success: "bg-green-500 text-white hover:bg-green-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
  }

  const buttonClasses = cn(
    "text-lg md:text-xl font-bold py-3 md:py-4 px-4 md:px-6 rounded-full text-center transition-all duration-200 flex items-center justify-center shadow-md",
    variantStyles[variant],
    isHovered && !disabled ? "transform scale-[1.02]" : "",
    isPressed && !disabled ? "transform scale-[0.98] shadow-inner" : "",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  )

  // Add ripple effect
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
  let rippleCount = 0

  const addRipple = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled) return

    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newRipple = { x, y, id: rippleCount++ }
    setRipples([...ripples, newRipple])

    setTimeout(() => {
      setRipples((ripples) => ripples.filter((ripple) => ripple.id !== newRipple.id))
    }, 800)
  }

  if (onClick) {
    return (
      <button
        onClick={(e) => {
          addRipple(e)
          onClick()
        }}
        className={buttonClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setIsPressed(false)
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        disabled={disabled}
        style={{ position: "relative", overflow: "hidden" }}
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            style={{
              position: "absolute",
              top: ripple.y - 50,
              left: ripple.x - 50,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.4)",
              transform: "scale(0)",
              animation: "ripple 0.8s linear",
            }}
          />
        ))}
        {children}
      </button>
    )
  }

  return (
    <Link
      href={href}
      className={buttonClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault()
        } else {
          addRipple(e)
        }
      }}
      aria-disabled={disabled}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            position: "absolute",
            top: ripple.y - 50,
            left: ripple.x - 50,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.4)",
            transform: "scale(0)",
            animation: "ripple 0.8s linear",
          }}
        />
      ))}
      {children}
    </Link>
  )
}
