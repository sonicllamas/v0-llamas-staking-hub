import { ServerCrash } from "lucide-react"
import { ErrorMessage } from "./error-message"

interface ApiErrorProps {
  onRetry?: () => void
  message?: string
  className?: string
}

export function ApiError({ onRetry, message, className }: ApiErrorProps) {
  return (
    <ErrorMessage
      title="API Error"
      message={message || "We couldn't load the data from our servers. Our team has been notified of this issue."}
      icon={<ServerCrash className="h-12 w-12 text-red-500" />}
      actionLabel="Try Again"
      actionFn={onRetry || (() => window.location.reload())}
      variant="critical"
      className={className}
    />
  )
}
