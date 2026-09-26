export default function GalleryLoading() {
  return (
    <div className="pt-32 pb-24 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl animate-pulse">
      <div className="mb-16 space-y-4">
        <div className="h-14 w-64 bg-secondary rounded-2xl" />
        <div className="h-6 w-96 max-w-full bg-secondary rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col">
            <div className="aspect-[16/9] rounded-3xl bg-secondary mb-6" />
            <div className="flex items-center gap-3 mb-3">
              <div className="h-5 w-20 bg-secondary rounded-full" />
              <div className="h-5 w-28 bg-secondary rounded-full" />
            </div>
            <div className="h-8 w-4/5 bg-secondary rounded-xl mb-3" />
            <div className="h-4 w-full bg-secondary rounded-lg mb-2" />
            <div className="h-4 w-2/3 bg-secondary rounded-lg mb-4" />
            <div className="h-5 w-28 bg-secondary rounded-full mt-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
