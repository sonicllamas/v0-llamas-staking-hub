import { Skeleton } from "@/components/ui/skeleton"

export function WalletInfoSkeleton() {
  return (
    <div className="bg-[#0d2416] rounded-xl p-6 shadow-lg border border-green-400/20">
      <Skeleton className="h-7 w-40 mb-6" />

      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-16" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
