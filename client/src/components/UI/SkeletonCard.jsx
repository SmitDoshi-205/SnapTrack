function SkeletonCard({ type = 'task' }) {
  if (type === 'board') {
    return (
      <div className="
        bg-white dark:bg-gray-800
        rounded-2xl p-5
        border border-gray-200 dark:border-gray-700
        animate-pulse flex flex-col gap-3
      ">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700/60 rounded w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 bg-gray-100 dark:bg-gray-700/60 rounded-full w-16" />
          <div className="h-5 bg-gray-100 dark:bg-gray-700/60 rounded-full w-20" />
          <div className="h-5 bg-gray-100 dark:bg-gray-700/60 rounded-full w-14" />
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700/60 rounded w-1/3 mt-1" />
      </div>
    )
  }

  return (
    <div className="
      bg-white dark:bg-gray-700
      rounded-xl p-4
      border border-gray-200 dark:border-gray-600
      animate-pulse flex flex-col gap-2
    ">
      <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded-full w-16" />
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/5" />
      <div className="h-3 bg-gray-100 dark:bg-gray-600/60 rounded w-full" />
      <div className="h-3 bg-gray-100 dark:bg-gray-600/60 rounded w-3/5" />
      <div className="flex gap-1 mt-1">
        <div className="h-5 bg-gray-100 dark:bg-gray-600/60 rounded-full w-12" />
        <div className="h-5 bg-gray-100 dark:bg-gray-600/60 rounded-full w-14" />
      </div>
    </div>
  )
}

export default SkeletonCard