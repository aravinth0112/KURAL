export default function TeamLoading() {
  return (
    <div className="pt-32 pb-24 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl animate-pulse">
      <div className="mb-16 max-w-3xl space-y-4">
        <div className="h-6 w-44 bg-secondary rounded-full" />
        <div className="h-14 w-80 max-w-full bg-secondary rounded-2xl" />
        <div className="h-6 w-full max-w-lg bg-secondary rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col rounded-3xl overflow-hidden bg-white border border-border shadow-sm">
            <div className="aspect-[4/5] bg-secondary w-full" />
            <div className="p-6 flex flex-col space-y-3">
              <div className="h-4 w-24 bg-secondary rounded-full" />
              <div className="h-6 w-36 bg-secondary rounded-xl" />
              <div className="h-3 w-40 bg-secondary rounded-md" />
              <div className="h-3 w-28 bg-secondary rounded-md" />
              <div className="pt-3 border-t border-border flex justify-between">
                <div className="h-4 w-28 bg-secondary rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
