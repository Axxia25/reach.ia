import { LoadingCard, LoadingTable } from '@/components/Loading'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="flex items-center space-x-4">
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
              <div className="animate-pulse">
                <div className="h-9 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
              <div className="animate-pulse">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-80 bg-gray-100 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Vendors Panel Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="w-8 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <LoadingTable rows={8} />
      </main>
    </div>
  )
}
