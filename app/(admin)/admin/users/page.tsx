import { AdminUserManager } from "@/components/admin/AdminUserManager";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminUsersPage() {
  const [users, currentAdmin] = await Promise.all([
    db.admin.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    }),
    getCurrentAdmin()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan">Users</p>
        <h1 className="mt-2 font-[var(--font-display)] text-4xl text-white">Admin user management</h1>
      </div>
      <AdminUserManager users={users} currentRole={currentAdmin?.role || ""} />
    </div>
  );
}
