"use client"

import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CollectionErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  showHomeLink?: boolean
}

export function CollectionError({
  title = "Collection Not Found",
  message = "The requested collection could not be found or loaded.",
  onRetry,
  showHomeLink = true,
}: CollectionErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-red-700 bg-red-950/40">
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-300 mb-6 max-w-md">{message}</p>
      <div className="flex flex-wrap gap-4 justify-center">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
        )}
        {showHomeLink && (
          <Link
            href="/collections"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Home size={16} />
            Back to Collections
          </Link>
        )}
      </div>
    </div>
  )
}
