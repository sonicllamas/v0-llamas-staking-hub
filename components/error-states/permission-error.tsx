import { ShieldAlert } from "lucide-react"
import { ErrorMessage } from "./error-message"

interface PermissionErrorProps {
  className?: string
}

export function PermissionError({ className }: PermissionErrorProps) {
  return (
    <ErrorMessage
      title="Permission Denied"
      message="You don't have permission to access this content. Please connect with the correct wallet or contact support."
      icon={<ShieldAlert className="h-12 w-12 text-red-500" />}
      homeLink={true}
      variant="critical"
      className={className}
    />
  )
}
