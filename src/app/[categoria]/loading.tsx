export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 min-h-screen animate-pulse">
      <div className="mb-8 border-b-4 border-gray-200 inline-block w-48 h-10 bg-gray-200 rounded"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col space-y-3">
            <div className="aspect-[16/10] bg-gray-200 rounded"></div>
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
            <div className="w-full h-6 bg-gray-200 rounded"></div>
            <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
            <div className="w-full h-12 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    </main>
  )
}
