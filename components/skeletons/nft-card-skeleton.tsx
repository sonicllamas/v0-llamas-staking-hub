import { Skeleton } from "@/components/ui/skeleton"

export function NFTCardSkeleton() {
  return (
    <div className="bg-[#0d2416] rounded-xl overflow-hidden border border-green-400/10">
      <div className="aspect-square relative">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}
