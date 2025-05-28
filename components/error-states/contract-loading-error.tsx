import { FileCodeIcon as FileContract } from "lucide-react"
import { ErrorMessage } from "./error-message"

interface ContractLoadingErrorProps {
  onRetry?: () => void
  contractAddress?: string
  className?: string
}

export function ContractLoadingError({ onRetry, contractAddress, className }: ContractLoadingErrorProps) {
  return (
    <ErrorMessage
      title="Contract Loading Error"
      message={
        contractAddress
          ? `We couldn't load the contract at ${contractAddress.substring(0, 6)}...${contractAddress.substring(
              contractAddress.length - 4,
            )}. The contract may not exist or there could be network issues.`
          : "We couldn't load the contract details. The contract may not exist or there could be network issues."
      }
      icon={<FileContract className="h-12 w-12 text-amber-500" />}
      actionLabel="Try Again"
      actionFn={onRetry || (() => window.location.reload())}
      variant="warning"
      className={className}
    />
  )
}
