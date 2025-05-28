"use client"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function LoadingSpinner({ size = "md", text, className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} role="status" aria-live="polite">
      <div
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}
        aria-hidden="true"
      />
      {text && <span className="text-sm text-gray-600">{text}</span>}
      <span className="sr-only">Loading...</span>
    </div>
  )
}
