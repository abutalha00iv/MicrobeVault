"use client";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-ink px-6 text-white">
        <div className="glass-panel max-w-xl rounded-3xl p-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-pathogen">System Fault</p>
          <h1 className="mt-4 font-[var(--font-display)] text-3xl">MicrobeVault encountered an error</h1>
          <p className="mt-4 text-slate-300">{error.message || "An unexpected issue interrupted the current view."}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full border border-cyan/40 bg-cyan/10 px-5 py-3 text-sm font-medium text-cyan hover:bg-cyan/20"
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}

