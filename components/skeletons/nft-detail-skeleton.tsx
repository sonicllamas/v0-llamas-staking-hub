import { Skeleton } from "@/components/ui/skeleton"

export function NFTDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2 mb-4" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-5/6 mb-1" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        <div className="bg-[#0d2416] rounded-xl p-4 border border-green-400/10">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
          </div>
        </div>

        <div className="bg-[#0d2416] rounded-xl p-4 border border-green-400/10">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="bg-[#143621] p-3 rounded-lg">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
