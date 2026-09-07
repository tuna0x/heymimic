import { LoaderCircle } from 'lucide-react'

export function RouteLoadingSpinner() {
  return (
    <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center p-8 select-none">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-study-primary/20 border-t-study-primary animate-spin" />
        <LoaderCircle size={22} className="text-study-primary animate-pulse absolute" />
      </div>
      <p className="mt-4 text-xs font-medium text-study-text-muted tracking-wide animate-pulse">
        Đang tải phòng học...
      </p>
    </div>
  )
}
