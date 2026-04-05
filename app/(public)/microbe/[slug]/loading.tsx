export default function MicrobeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="skeleton h-80 rounded-[2rem]" />
      <div className="mt-8 skeleton h-96 rounded-[2rem]" />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-72 rounded-[2rem]" />
        ))}
      </div>
    </div>
  );
}

