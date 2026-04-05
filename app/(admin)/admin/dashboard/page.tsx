import Link from "next/link";
import {
  Microscope, ShieldAlert, GitBranch, History,
  Plus, ArrowRight, Activity, Clock
} from "lucide-react";
import { getAdminDashboardData } from "@/lib/repository";

const STAT_CARDS = [
  {
    key: "microbes",
    label: "Microbes",
    href: "/admin/microbes",
    icon: Microscope,
    accent: "text-cyan",
    border: "border-cyan/20",
    bg: "bg-cyan/5"
  },
  {
    key: "diseases",
    label: "Diseases",
    href: "/admin/diseases",
    icon: ShieldAlert,
    accent: "text-pathogen",
    border: "border-pathogen/20",
    bg: "bg-pathogen/5"
  },
  {
    key: "flowcharts",
    label: "Flowcharts",
    href: "/admin/flowcharts",
    icon: GitBranch,
    accent: "text-amber",
    border: "border-amber/20",
    bg: "bg-amber/5"
  },
  {
    key: "timeline",
    label: "Timeline events",
    href: "/admin/timeline",
    icon: History,
    accent: "text-benefit",
    border: "border-benefit/20",
    bg: "bg-benefit/5"
  }
] as const;

const QUICK_ACTIONS = [
  { href: "/admin/microbes/new",  label: "Add microbe",       desc: "Create a new microbe profile",       color: "border-cyan/30 bg-cyan/10 text-cyan hover:bg-cyan/15" },
  { href: "/admin/diseases",      label: "Add disease",        desc: "Link diseases and pathogens",        color: "border-pathogen/30 bg-pathogen/10 text-pathogen hover:bg-pathogen/15" },
  { href: "/admin/flowcharts",    label: "Add flowchart",      desc: "Build an identification flowchart",  color: "border-amber/30 bg-amber/10 text-amber hover:bg-amber/15" },
  { href: "/admin/timeline",      label: "Add timeline event", desc: "Record a historical milestone",      color: "border-benefit/30 bg-benefit/10 text-benefit hover:bg-benefit/15" }
];

const ACTION_BADGE: Record<string, string> = {
  CREATE: "border-benefit/30 bg-benefit/10 text-benefit",
  UPDATE: "border-amber/30 bg-amber/10 text-amber",
  DELETE: "border-pathogen/30 bg-pathogen/10 text-pathogen"
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboardData();
  const stats = dashboard.stats as Record<string, number>;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">Dashboard</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Operations overview</h1>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map(({ key, label, href, icon: Icon, accent, border, bg }) => (
          <Link
            key={key}
            href={href}
            className={`glass-panel group flex items-center gap-4 rounded-[1.75rem] p-5 transition hover:scale-[1.02] ${border}`}
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg}`}>
              <Icon className={`h-5 w-5 ${accent}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
              <p className={`mt-1 font-[var(--font-display)] text-3xl ${accent}`}>
                {(stats[key] ?? 0).toLocaleString()}
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-600 transition group-hover:text-slate-300" />
          </Link>
        ))}
      </div>

      {/* Quick actions + recent additions */}
      <div className="grid gap-6 xl:grid-cols-[1fr,1.4fr]">

        {/* Quick actions */}
        <div className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-cyan" />
            <h2 className="font-[var(--font-display)] text-xl text-white">Quick actions</h2>
          </div>
          <div className="mt-5 space-y-3">
            {QUICK_ACTIONS.map(({ href, label, desc, color }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm transition ${color}`}
              >
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="mt-0.5 text-xs opacity-70">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 opacity-60" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent microbes */}
        <div className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan" />
              <h2 className="font-[var(--font-display)] text-xl text-white">Recent additions</h2>
            </div>
            <Link href="/admin/microbes" className="text-xs text-cyan hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {dashboard.recentMicrobes.map((microbe) => (
              <Link
                key={microbe.id}
                href={`/admin/microbes/${microbe.id}/edit`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:border-cyan/20 hover:bg-white/[0.04] transition"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{microbe.scientificName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {timeAgo(new Date(microbe.createdAt))}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activity log */}
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan" />
          <h2 className="font-[var(--font-display)] text-xl text-white">Activity log</h2>
        </div>
        <div className="mt-5 space-y-2">
          {dashboard.activityLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <span className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] ${ACTION_BADGE[log.action] ?? "border-white/10 text-slate-400"}`}>
                {log.action}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200">{log.description}</p>
                <p className="mt-1 text-xs text-slate-500">
                  <span className="text-slate-400">{log.admin.username}</span>
                  {" · "}
                  <span className="capitalize">{log.entityType.replace(/_/g, " ")}</span>
                  {" · "}
                  {timeAgo(new Date(log.createdAt))}
                </p>
              </div>
            </div>
          ))}
          {dashboard.activityLogs.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}
