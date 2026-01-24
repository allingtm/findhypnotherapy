export default function Loading() {
  return (
    <div className="w-full">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-neutral-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/4 mb-8"></div>

        <div className="border-t dark:border-neutral-700 pt-6">
          <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div>
              <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-1/2"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-2/3"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
