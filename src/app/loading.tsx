export default function RootLoading() {
  return (
    <div className="pt-32 pb-24 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl animate-pulse">
      {/* Header skeleton */}
      <div className="max-w-2xl mb-12 space-y-4">
        <div className="h-6 w-32 bg-secondary rounded-full" />
        <div className="h-14 w-3/4 bg-secondary rounded-2xl" />
        <div className="h-5 w-full bg-secondary rounded-xl" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col space-y-4">
            <div className="aspect-[16/9] w-full bg-secondary rounded-3xl" />
            <div className="h-5 w-24 bg-secondary rounded-full" />
            <div className="h-7 w-3/4 bg-secondary rounded-xl" />
            <div className="h-4 w-full bg-secondary rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
