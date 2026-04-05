"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Trash2, ShieldCheck, Pencil } from "lucide-react";

type AdminUser = {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "border-amber/30 bg-amber/10 text-amber",
  EDITOR:      "border-cyan/20 bg-cyan/5 text-cyan"
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function AdminUserManager({
  users,
  currentRole
}: {
  users: AdminUser[];
  currentRole: string;
}) {
  const router = useRouter();
  const [form, setForm]       = useState({ username: "", password: "", role: "EDITOR" });
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [saving, setSaving]   = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  if (currentRole !== "SUPER_ADMIN") {
    return (
      <div className="glass-panel flex items-center gap-3 rounded-[2rem] p-6 text-sm text-slate-400">
        <ShieldCheck className="h-5 w-5 shrink-0 text-slate-600" />
        Only super-admins can manage admin accounts.
      </div>
    );
  }

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form)
    });
    const json = await response.json();
    setMessage({
      text: response.ok ? "Admin user created successfully." : json.error || "Unable to create admin user.",
      ok: response.ok
    });
    if (response.ok) {
      setForm({ username: "", password: "", role: "EDITOR" });
      router.refresh();
    }
    setSaving(false);
  };

  const remove = async (id: string, username: string) => {
    if (!confirm(`Remove admin account "${username}"? This cannot be undone.`)) return;
    setRemoving(id);
    const response = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
    const json = await response.json();
    setMessage({
      text: response.ok ? "Admin user removed." : json.error || "Unable to remove admin user.",
      ok: response.ok
    });
    if (response.ok) router.refresh();
    setRemoving(null);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr,1.4fr]">

      {/* Create form */}
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-center gap-2 mb-5">
          <UserPlus className="h-4 w-4 text-cyan" />
          <h2 className="font-[var(--font-display)] text-xl text-white">Create admin user</h2>
        </div>

        {message && (
          <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${message.ok ? "border-benefit/30 bg-benefit/10 text-benefit" : "border-pathogen/30 bg-pathogen/10 text-pathogen"}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Username</span>
            <input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan/30 focus:outline-none"
              placeholder="e.g. editor_john"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan/30 focus:outline-none"
              placeholder="Min. 8 characters"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Role</span>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white focus:border-cyan/30 focus:outline-none"
            >
              <option value="EDITOR">Editor — can create and update content</option>
              <option value="SUPER_ADMIN">Super Admin — full access including user management</option>
            </select>
          </label>
          <button
            type="button"
            onClick={save}
            disabled={saving || !form.username || !form.password}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan transition hover:bg-cyan/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan border-t-transparent" /> Creating…</>
            ) : (
              <><UserPlus className="h-4 w-4" /> Create admin</>
            )}
          </button>
        </div>
      </div>

      {/* Existing admins */}
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Pencil className="h-4 w-4 text-cyan" />
          <h2 className="font-[var(--font-display)] text-xl text-white">
            Admin accounts
            <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-sm text-slate-400">
              {users.length}
            </span>
          </h2>
        </div>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3.5"
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-slate-300">
                {user.username.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{user.username}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${ROLE_BADGE[user.role] ?? "border-white/10 text-slate-400"}`}>
                    {user.role === "SUPER_ADMIN" ? "Super Admin" : "Editor"}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] ${user.isActive ? "border-benefit/20 bg-benefit/5 text-benefit" : "border-white/10 bg-white/5 text-slate-500"}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">Created {timeAgo(user.createdAt)}</p>
              </div>

              <button
                type="button"
                onClick={() => remove(user.id, user.username)}
                disabled={removing === user.id}
                className="shrink-0 rounded-full border border-pathogen/20 bg-pathogen/5 p-2 text-pathogen/70 transition hover:border-pathogen/40 hover:bg-pathogen/10 hover:text-pathogen disabled:cursor-not-allowed disabled:opacity-40"
                title="Remove admin"
              >
                {removing === user.id
                  ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-pathogen border-t-transparent" />
                  : <Trash2 className="h-4 w-4" />
                }
              </button>
            </div>
          ))}
          {users.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No admin accounts found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
