import Link from "next/link";
import { Shield } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  const initials = admin?.username
    ? admin.username.slice(0, 2).toUpperCase()
    : "AD";

  const roleBadge =
    admin?.role === "SUPER_ADMIN"
      ? { label: "Super Admin", cls: "border-amber/30 bg-amber/10 text-amber" }
      : { label: "Editor", cls: "border-cyan/20 bg-cyan/5 text-cyan" };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px,1fr] lg:px-8">

        {/* ── Sidebar ── */}
        <aside className="glass-panel h-fit rounded-[2rem] p-5 lg:sticky lg:top-6">

          {/* Brand */}
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan/10">
              <Shield className="h-4 w-4 text-cyan" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan">MicrobeVault</p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">Admin Panel</p>
            </div>
          </Link>

          <div className="mt-5 border-t border-white/10 pt-5">
            {/* Admin user card */}
            {admin ? (
              <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan/20 to-cyan/5 text-sm font-bold text-cyan">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{admin.username}</p>
                  <span className={`mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${roleBadge.cls}`}>
                    {roleBadge.label}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Nav — client component handles active state */}
          <AdminNav />
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
