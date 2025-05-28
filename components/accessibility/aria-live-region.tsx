"use client"

import { useEffect, useState } from "react"

interface AriaLiveRegionProps {
  message: string
  priority?: "polite" | "assertive"
}

export function AriaLiveRegion({ message, priority = "polite" }: AriaLiveRegionProps) {
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    if (message) {
      setAnnouncement(message)
      // Clear after announcement
      const timer = setTimeout(() => setAnnouncement(""), 1000)
      return () => clearTimeout(timer)
    }
  }, [message])

  return (
    <div aria-live={priority} aria-atomic="true" className="sr-only" role="status">
      {announcement}
    </div>
  )
}
