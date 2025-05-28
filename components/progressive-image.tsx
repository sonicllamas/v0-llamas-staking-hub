"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProgressiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
  sizes?: string
  quality?: number
}

export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  placeholder,
  onLoad,
  onError,
  sizes,
  quality = 75,
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)

  // Generate a low-quality placeholder
  const generatePlaceholder = (originalSrc: string) => {
    if (placeholder) return placeholder

    // For external URLs, use a blur placeholder
    if (originalSrc.startsWith("http")) {
      return `/placeholder.svg?height=${height || 400}&width=${width || 400}&query=nft+loading`
    }

    return originalSrc
  }

  const placeholderSrc = generatePlaceholder(src)

  useEffect(() => {
    setImageSrc(src)
    setIsLoading(true)
    setHasError(false)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    setImageSrc(`/placeholder.svg?height=${height || 400}&width=${width || 400}&query=nft+error`)
    onError?.()
  }

  const imageProps = {
    alt,
    className: cn(
      "transition-all duration-700 ease-out",
      isLoading && !hasError ? "blur-sm scale-105 opacity-70" : "blur-0 scale-100 opacity-100",
      className,
    ),
    onLoad: handleLoad,
    onError: handleError,
    priority,
    quality,
    sizes,
    unoptimized: imageSrc.startsWith("http") || hasError,
  }

  if (fill) {
    return (
      <div className="relative overflow-hidden">
        {/* Placeholder/blur layer */}
        {isLoading && !hasError && (
          <Image
            src={placeholderSrc || "/placeholder.svg"}
            alt=""
            fill
            className="absolute inset-0 blur-md scale-110 opacity-50"
            priority={priority}
            unoptimized
          />
        )}

        {/* Main image */}
        <Image {...imageProps} src={imageSrc || "/placeholder.svg"} fill />

        {/* Loading overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d2416]/20 to-[#143621]/20 animate-pulse" />
        )}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      {/* Placeholder/blur layer */}
      {isLoading && !hasError && width && height && (
        <Image
          src={placeholderSrc || "/placeholder.svg"}
          alt=""
          width={width}
          height={height}
          className="absolute inset-0 blur-md scale-110 opacity-50"
          priority={priority}
          unoptimized
        />
      )}

      {/* Main image */}
      <Image {...imageProps} src={imageSrc || "/placeholder.svg"} width={width} height={height} />

      {/* Loading overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d2416]/20 to-[#143621]/20 animate-pulse" />
      )}
    </div>
  )
}
