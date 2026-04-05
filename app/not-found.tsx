import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel max-w-2xl rounded-[2rem] p-10 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan">404</p>
        <h1 className="mt-3 font-[var(--font-display)] text-4xl">Specimen not found</h1>
        <p className="mt-4 text-slate-300">
          The requested MicrobeVault record does not exist or has been moved into a different taxonomy branch.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-5 py-3 text-sm font-medium text-cyan hover:bg-cyan/20"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

