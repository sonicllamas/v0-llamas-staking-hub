import { Wifi } from "lucide-react"
import { ErrorMessage } from "./error-message"

interface NetworkErrorProps {
  onRetry?: () => void
  className?: string
}

export function NetworkError({ onRetry, className }: NetworkErrorProps) {
  return (
    <ErrorMessage
      title="Network Error"
      message="We couldn't connect to the server. Please check your internet connection and try again."
      icon={<Wifi className="h-12 w-12 text-amber-500" />}
      actionLabel="Retry Connection"
      actionFn={onRetry || (() => window.location.reload())}
      variant="warning"
      className={className}
    />
  )
}
