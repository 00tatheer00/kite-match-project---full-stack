export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse" aria-busy="true" aria-label="Loading product">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl bg-gray-200" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
          <div className="h-10 w-1/3 rounded bg-gray-200 mt-6" />
        </div>
      </div>
    </div>
  );
}
