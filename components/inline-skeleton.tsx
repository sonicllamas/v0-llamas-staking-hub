interface InlineSkeletonProps {
  className?: string
  width?: string
  height?: string
}

export function InlineSkeleton({ className = "", width = "w-full", height = "h-4" }: InlineSkeletonProps) {
  return (
    <div
      className={`bg-gradient-to-r from-green-900/20 via-green-800/30 to-green-900/20 rounded animate-pulse ${width} ${height} ${className}`}
    />
  )
}
