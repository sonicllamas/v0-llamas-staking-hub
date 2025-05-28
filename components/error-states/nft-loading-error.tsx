import { ImageIcon } from "lucide-react"
import { ErrorMessage } from "./error-message"

interface NFTLoadingErrorProps {
  onRetry?: () => void
  collectionName?: string
  className?: string
}

export function NFTLoadingError({ onRetry, collectionName, className }: NFTLoadingErrorProps) {
  const collectionText = collectionName ? ` from ${collectionName}` : ""

  return (
    <ErrorMessage
      title="Failed to Load NFTs"
      message={`We couldn't load your NFTs${collectionText}. This could be due to network issues or the collection may be unavailable.`}
      icon={<ImageIcon className="h-12 w-12 text-green-500" />}
      actionLabel="Try Again"
      actionFn={onRetry || (() => window.location.reload())}
      className={className}
    />
  )
}
