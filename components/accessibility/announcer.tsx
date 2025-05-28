"use client"

import { useEffect, useRef } from "react"

interface AnnouncerProps {
  message: string
  priority?: "polite" | "assertive"
  clearAfter?: number
}

export function Announcer({ message, priority = "polite", clearAfter = 5000 }: AnnouncerProps) {
  const announcerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (message && announcerRef.current) {
      announcerRef.current.textContent = message

      if (clearAfter > 0) {
        const timer = setTimeout(() => {
          if (announcerRef.current) {
            announcerRef.current.textContent = ""
          }
        }, clearAfter)

        return () => clearTimeout(timer)
      }
    }
  }, [message, clearAfter])

  return <div ref={announcerRef} aria-live={priority} aria-atomic="true" className="sr-only" role="status" />
}

// Hook for easy announcements
export function useAnnouncer() {
  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    const announcer = document.getElementById("announcements")
    if (announcer) {
      announcer.textContent = message
      setTimeout(() => {
        announcer.textContent = ""
      }, 5000)
    }
  }

  return { announce }
}
