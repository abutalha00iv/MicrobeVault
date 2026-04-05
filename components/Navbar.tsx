"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Microscope, Shield, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_NAME, NAV_ITEMS, TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 text-cyan shadow-glow">
            <Microscope className="h-5 w-5" />
          </div>
          <div>
            <p className="font-[var(--font-display)] text-lg font-semibold leading-none text-white">{BRAND_NAME}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-cyan">{TAGLINE}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 xl:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition hover:scale-[1.02] hover:border-cyan hover:text-white hover:shadow-glow",
                    active
                      ? "border-cyan/50 bg-cyan/12 text-white"
                      : "border-transparent bg-white/0 text-slate-300"
                  )}
                >
                  {item.label}
                </Link>
                {"children" in item && item.children ? (
                  <div className="invisible absolute left-0 top-full mt-3 w-56 rounded-2xl border border-cyan/20 bg-slate-950/95 p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-cyan/10 hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            aria-label="Admin Login"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan/30 bg-white/5 text-cyan hover:bg-cyan/10 hover:shadow-glow"
          >
            <Shield className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white xl:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 xl:hidden"
          >
            <div className="space-y-2 px-4 py-4 sm:px-6">
              {NAV_ITEMS.map((item) => (
                <div key={item.href} className="rounded-2xl border border-white/10 bg-white/[0.03]">
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-sm text-slate-100"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {"children" in item && item.children ? (
                    <div className="border-t border-white/10 px-2 py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-cyan/10 hover:text-white"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
