import { Skeleton } from "@/components/ui/skeleton"

export function CollectionCardSkeleton() {
  return (
    <div className="bg-[#0d2416] rounded-lg overflow-hidden shadow-md border border-green-400/10">
      <div className="h-48 overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <Skeleton className="w-10 h-10 rounded-full mr-3" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-[#143621] p-2 rounded">
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="bg-[#143621] p-2 rounded">
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}
