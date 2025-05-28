import type React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

// Simple, lightweight container component
export function Container({ children, className }: ContainerProps) {
  return <div className={cn("w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}>{children}</div>
}
