"use client"

import type React from "react"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { type ReactNode, useEffect, useState } from "react"

type AnimationType = "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "zoomIn" | "slideInUp"

interface ScrollAnimationProps {
  children: ReactNode
  animation: AnimationType
  delay?: number
  duration?: number
  threshold?: number
  rootMargin?: string
  className?: string
}

export function ScrollAnimation({
  children,
  animation,
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  rootMargin = "0px",
  className = "",
}: ScrollAnimationProps) {
  const { isVisible, elementRef } = useScrollAnimation({ threshold, rootMargin })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if the user prefers reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Animation styles based on type
  const getAnimationStyles = () => {
    if (prefersReducedMotion) {
      return {}
    }

    const baseStyles = {
      opacity: isVisible ? 1 : 0,
      transition: `all ${duration}s ease-out ${delay}s`,
    }

    const animationStyles: Record<AnimationType, React.CSSProperties> = {
      fadeInUp: {
        ...baseStyles,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
      },
      fadeInDown: {
        ...baseStyles,
        transform: isVisible ? "translateY(0)" : "translateY(-30px)",
      },
      fadeInLeft: {
        ...baseStyles,
        transform: isVisible ? "translateX(0)" : "translateX(-30px)",
      },
      fadeInRight: {
        ...baseStyles,
        transform: isVisible ? "translateX(0)" : "translateX(30px)",
      },
      zoomIn: {
        ...baseStyles,
        transform: isVisible ? "scale(1)" : "scale(0.95)",
      },
      slideInUp: {
        ...baseStyles,
        transform: isVisible ? "translateY(0)" : "translateY(50px)",
      },
    }

    return animationStyles[animation]
  }

  return (
    <div ref={elementRef} style={getAnimationStyles()} className={className}>
      {children}
    </div>
  )
}
