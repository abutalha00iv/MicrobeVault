import Link from "next/link";
import { BRAND_NAME, FOOTER_DISCLAIMER, NAV_ITEMS, TAGLINE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr,1fr] lg:px-8">
        <div>
          <h2 className="font-[var(--font-display)] text-2xl text-white">{BRAND_NAME}</h2>
          <p className="mt-2 text-sm uppercase tracking-[0.28em] text-cyan">{TAGLINE}</p>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">{FOOTER_DISCLAIMER}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-slate-300 transition hover:text-white">
              {item.label}
            </Link>
          ))}
          <Link href="/references" className="text-sm text-slate-300 transition hover:text-white">
            References
          </Link>
          <Link href="/search" className="text-sm text-slate-300 transition hover:text-white">
            Search
          </Link>
        </div>
      </div>
    </footer>
  );
}
