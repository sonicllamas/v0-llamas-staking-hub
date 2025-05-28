interface SimpleLoadingProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function SimpleLoading({ message = "Loading...", size = "md" }: SimpleLoadingProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-green-500 mx-auto mb-4 ${sizeClasses[size]}`}
        ></div>
        <p className="text-white">{message}</p>
      </div>
    </div>
  )
}
