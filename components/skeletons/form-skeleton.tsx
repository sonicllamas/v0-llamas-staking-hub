import { Skeleton } from "@/components/ui/skeleton"

interface FormSkeletonProps {
  rows?: number
  withButton?: boolean
}

export function FormSkeleton({ rows = 4, withButton = true }: FormSkeletonProps) {
  return (
    <div className="bg-[#0d2416] rounded-xl p-6 space-y-6 border border-green-400/10">
      <Skeleton className="h-8 w-48 mb-6" />

      {Array(rows)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}

      {withButton && (
        <div className="pt-4 flex justify-end">
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      )}
    </div>
  )
}
