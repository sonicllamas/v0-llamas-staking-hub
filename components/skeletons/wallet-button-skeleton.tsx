import { Skeleton } from "@/components/ui/skeleton"

export function WalletButtonSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-10 w-32 rounded-lg" />
      <Skeleton className="h-10 w-40 rounded-lg" />
    </div>
  )
}
