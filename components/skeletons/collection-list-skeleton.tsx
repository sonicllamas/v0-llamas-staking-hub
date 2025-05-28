import { Skeleton } from "@/components/ui/skeleton"
import { CollectionCardSkeleton } from "./collection-card-skeleton"

interface CollectionListSkeletonProps {
  count?: number
}

export function CollectionListSkeleton({ count = 9 }: CollectionListSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="bg-[#0d2416] rounded-xl p-4 mb-6">
        <div className="relative">
          <Skeleton className="w-full h-12 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(count)
          .fill(0)
          .map((_, index) => (
            <CollectionCardSkeleton key={index} />
          ))}
      </div>
    </div>
  )
}
