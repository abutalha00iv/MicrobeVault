export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <div className="flex flex-col items-center gap-4">
        <div className="microscope-loader">
          <div className="loading-line" />
        </div>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan">Loading MicrobeVault</p>
      </div>
    </div>
  );
}

