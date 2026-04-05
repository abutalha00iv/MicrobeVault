"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password")
        })
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Login failed.");
      }
      const next = searchParams.get("next") || "";
      const safePath = next.startsWith("/admin/") && !next.startsWith("//") ? next : "/admin/dashboard";
      router.push(safePath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel w-full max-w-md rounded-[2rem] p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan">Admin Login</p>
      <h1 className="mt-3 font-[var(--font-display)] text-3xl text-white">MicrobeVault control panel</h1>
      <div className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Username</span>
          <input
            name="username"
            autoComplete="username"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm text-slate-200">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          />
        </label>
        {error ? <p className="text-sm text-pathogen">{error}</p> : null}
        <button type="submit" disabled={loading} className="w-full rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}

