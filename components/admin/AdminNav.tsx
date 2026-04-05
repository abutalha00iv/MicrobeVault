"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Microscope, ShieldAlert, GitBranch, History, Library, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/microbes",  label: "Microbes",  icon: Microscope },
  { href: "/admin/diseases",  label: "Diseases",  icon: ShieldAlert },
  { href: "/admin/flowcharts",label: "Flowcharts",icon: GitBranch },
  { href: "/admin/timeline",  label: "Timeline",  icon: History },
  { href: "/admin/references",label: "References",icon: Library },
  { href: "/admin/users",     label: "Users",     icon: Users }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 space-y-1">
      {ADMIN_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-150",
              active
                ? "border border-cyan/30 bg-cyan/10 text-cyan shadow-[0_0_12px_rgba(0,245,212,0.08)]"
                : "border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-cyan" : "text-slate-500")} />
            {label}
          </Link>
        );
      })}

      <div className="pt-3 border-t border-white/10 mt-3">
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-slate-400 transition hover:border-pathogen/20 hover:bg-pathogen/5 hover:text-pathogen"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
