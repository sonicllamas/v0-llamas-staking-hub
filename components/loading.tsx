export function Loading() {
  return (
    <div className="flex items-center justify-center h-24 w-full">
      <div className="relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-white opacity-30 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-t-4 border-green-400 rounded-full animate-spin"></div>
      </div>
    </div>
  )
}
