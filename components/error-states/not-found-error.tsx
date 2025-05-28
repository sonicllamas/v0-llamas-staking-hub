import { Search } from "lucide-react"
import { ErrorMessage } from "./error-message"

interface NotFoundErrorProps {
  resourceType?: string
  className?: string
}

export function NotFoundError({ resourceType = "resource", className }: NotFoundErrorProps) {
  return (
    <ErrorMessage
      title={`${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Not Found`}
      message={`We couldn't find the ${resourceType} you're looking for. It may have been removed or doesn't exist.`}
      icon={<Search className="h-12 w-12 text-blue-500" />}
      homeLink={true}
      variant="info"
      className={className}
    />
  )
}
