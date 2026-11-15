import { useAsync } from "@/lib/useAsync";
import { api } from "@/lib/api";
import { Loading, ErrorState } from "@/components/States";

export default function AdminPage() {
  const stats = useAsync((s) => api<Record<string, number>>("/admin/stats", { signal: s }), []);
  const users = useAsync((s) => api<{ items: { id: string; username: string; email: string; isAdmin: boolean; createdAt: string }[] }>("/admin/users", { signal: s }), []);
  return (
    <>
      <h1 className="h-page mb-6">Administration</h1>
      {stats.loading ? <Loading /> : stats.error ? <ErrorState message={stats.error} onRetry={stats.reload} /> : (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">{Object.entries(stats.data!).map(([k, v]) => <div key={k} className="card p-4"><p className="label capitalize">{k}</p><p className="font-display text-2xl font-bold">{v}</p></div>)}</div>
      )}
      <h2 className="h-section mb-2">Users</h2>
      {users.loading ? <Loading /> : users.error ? <ErrorState message={users.error} onRetry={users.reload} /> : (
        <div className="card overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-mute"><tr><th className="p-3">Username</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Joined</th></tr></thead>
          <tbody>{users.data!.items.map((u) => <tr key={u.id} className="border-t border-line"><td className="p-3">{u.username}</td><td className="p-3">{u.email}</td><td className="p-3">{u.isAdmin ? "Admin" : "User"}</td><td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>
      )}
      <p className="mt-4 text-xs text-mute">Admins can also delete any song or comment from the song menu. Admin rights are granted in the database only.</p>
    </>
  );
}
