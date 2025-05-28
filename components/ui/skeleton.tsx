import type React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "image" | "card"
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const baseClasses =
    "animate-pulse bg-gradient-to-r from-green-900/20 via-green-800/30 to-green-900/20 bg-[length:200%_100%] rounded-md"

  const variantClasses = {
    default: "h-4",
    text: "h-4",
    image: "bg-green-900/30",
    card: "bg-green-900/20",
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={{
        animation: "shimmer 2s ease-in-out infinite",
      }}
      {...props}
    />
  )
}

export { Skeleton }
