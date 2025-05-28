import { Skeleton } from "@/components/ui/skeleton"

export function ContractDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-32 h-6" />
      </div>

      <div className="bg-[#0d2416] rounded-xl p-6 border border-green-400/10">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="bg-[#143621] rounded-lg p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
        </div>
      </div>

      <div className="bg-[#0d2416] border-b border-gray-700 w-full rounded-t-xl">
        <div className="flex gap-4 p-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="bg-[#0d2416] rounded-xl p-6 border border-green-400/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-lg" />
            ))}
        </div>
      </div>
    </div>
  )
}
