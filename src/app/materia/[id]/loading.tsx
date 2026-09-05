export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Main Skeleton */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-lg border border-gray-100 shadow-sm space-y-6">
          <div className="w-24 h-5 bg-gray-200 rounded"></div>
          <div className="w-full h-10 bg-gray-200 rounded"></div>
          <div className="w-3/4 h-8 bg-gray-200 rounded"></div>
          <div className="w-full h-16 bg-gray-100 rounded"></div>
          <div className="w-48 h-4 bg-gray-200 rounded"></div>
          <div className="w-full aspect-video bg-gray-200 rounded"></div>
          <div className="space-y-3 pt-4">
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
            <div className="w-4/6 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div className="w-32 h-5 bg-gray-200 rounded"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 items-start pt-3 border-t border-gray-100">
                <div className="w-20 h-16 bg-gray-200 rounded flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-3 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
