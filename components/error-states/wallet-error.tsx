import { Wallet } from "lucide-react"
import { ErrorMessage } from "./error-message"

interface WalletErrorProps {
  onConnect?: () => void
  className?: string
}

export function WalletError({ onConnect, className }: WalletErrorProps) {
  return (
    <ErrorMessage
      title="Wallet Connection Error"
      message="We couldn't connect to your wallet. Please check that your wallet is unlocked and try again."
      icon={<Wallet className="h-12 w-12 text-amber-500" />}
      actionLabel="Connect Wallet"
      actionFn={onConnect}
      variant="warning"
      className={className}
    />
  )
}
