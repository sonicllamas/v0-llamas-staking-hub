"use client"

import type React from "react"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface ErrorMessageProps {
  title?: string
  message?: string
  icon?: React.ReactNode
  actionLabel?: string
  actionFn?: () => void
  homeLink?: boolean
  className?: string
  variant?: "default" | "warning" | "critical" | "info"
}

export function ErrorMessage({
  title = "Something went wrong",
  message = "We encountered an error while loading this content. Please try again later.",
  icon,
  actionLabel = "Try Again",
  actionFn,
  homeLink = false,
  className,
  variant = "default",
}: ErrorMessageProps) {
  // Determine the color scheme based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          bg: "bg-amber-950/40",
          border: "border-amber-700",
          iconColor: "text-amber-500",
          actionBg: "bg-amber-700 hover:bg-amber-600",
        }
      case "critical":
        return {
          bg: "bg-red-950/40",
          border: "border-red-700",
          iconColor: "text-red-500",
          actionBg: "bg-red-700 hover:bg-red-600",
        }
      case "info":
        return {
          bg: "bg-blue-950/40",
          border: "border-blue-700",
          iconColor: "text-blue-500",
          actionBg: "bg-blue-700 hover:bg-blue-600",
        }
      default:
        return {
          bg: "bg-[#0d2416]",
          border: "border-[#143621]",
          iconColor: "text-green-500",
          actionBg: "bg-green-600 hover:bg-green-700",
        }
    }
  }

  const styles = getVariantStyles()

  // Default icon based on variant if none provided
  const defaultIcon = () => {
    switch (variant) {
      case "warning":
        return <AlertCircle className={cn("h-12 w-12", styles.iconColor)} />
      case "critical":
        return <AlertCircle className={cn("h-12 w-12", styles.iconColor)} />
      case "info":
        return <AlertCircle className={cn("h-12 w-12", styles.iconColor)} />
      default:
        return <AlertCircle className={cn("h-12 w-12", styles.iconColor)} />
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border",
        styles.bg,
        styles.border,
        className,
      )}
    >
      <div className="mb-4">{icon || defaultIcon()}</div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-300 mb-6 max-w-md">{message}</p>
      <div className="flex flex-wrap gap-4 justify-center">
        {actionFn && (
          <button
            onClick={actionFn}
            className={cn("px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors", styles.actionBg)}
          >
            <RefreshCw size={16} />
            {actionLabel}
          </button>
        )}
        {homeLink && (
          <Link
            href="/"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Home size={16} />
            Back to Home
          </Link>
        )}
      </div>
    </div>
  )
}
