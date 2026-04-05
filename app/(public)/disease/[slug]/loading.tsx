export default function DiseaseLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="skeleton h-72 rounded-[2rem]" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="skeleton h-96 rounded-[2rem]" />
        <div className="skeleton h-96 rounded-[2rem]" />
      </div>
    </div>
  );
}
