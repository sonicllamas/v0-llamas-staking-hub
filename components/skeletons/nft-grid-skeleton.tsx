import { NFTCardSkeleton } from "./nft-card-skeleton"

interface NFTGridSkeletonProps {
  count?: number
}

export function NFTGridSkeleton({ count = 8 }: NFTGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <NFTCardSkeleton key={index} />
        ))}
    </div>
  )
}
