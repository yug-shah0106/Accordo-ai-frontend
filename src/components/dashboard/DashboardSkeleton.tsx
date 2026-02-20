const Pulse = ({ className }: { className: string }) => (
  <div className={`bg-gray-200 dark:bg-dark-border rounded animate-pulse ${className}`} />
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* KPI Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-gray-100 dark:border-dark-border rounded-xl p-5 bg-white dark:bg-dark-surface">
          <Pulse className="h-3 w-28 mb-3" />
          <Pulse className="h-8 w-20 mb-3" />
          <Pulse className="h-3 w-24" />
        </div>
      ))}
    </div>

    {/* Charts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border border-gray-100 dark:border-dark-border rounded-xl p-5 bg-white dark:bg-dark-surface">
          <Pulse className="h-4 w-32 mb-4" />
          <Pulse className="h-48 w-full" />
        </div>
      ))}
    </div>

    {/* Needs Attention */}
    <div>
      <Pulse className="h-5 w-40 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-gray-100 dark:border-dark-border rounded-xl p-4 bg-white dark:bg-dark-surface">
            <Pulse className="h-4 w-36 mb-3" />
            <Pulse className="h-3 w-full mb-2" />
            <Pulse className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
