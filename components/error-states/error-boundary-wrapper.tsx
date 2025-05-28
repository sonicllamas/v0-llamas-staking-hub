"use client"

import type { ReactNode } from "react"
import { ErrorBoundary } from "./error-boundary"

interface ErrorBoundaryWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  id?: string
}

export function ErrorBoundaryWrapper({ children, fallback, id }: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary fallback={fallback} key={id}>
      {children}
    </ErrorBoundary>
  )
}
