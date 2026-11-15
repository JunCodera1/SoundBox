import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useAsync } from "@/lib/useAsync";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import { toast } from "@/stores/toast";
import { Loading, ErrorState } from "./States";

interface C { id: string; text: string; createdAt: string; user: { id: string; username: string } }

export function Comments({ songId }: { songId: string }) {
  const me = useAuth((s) => s.user);
  const { data, loading, error, reload } = useAsync((s) => api<{ items: C[] }>(`/songs/${songId}/comments`, { signal: s }), [songId]);
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false);
  const post = async (e: React.FormEvent) => {
    e.preventDefault(); if (!text.trim()) return; setBusy(true);
    try { await api(`/songs/${songId}/comments`, { method: "POST", body: { text: text.trim() } }); setText(""); reload(); }
    catch (er) { toast((er as Error).message, "error"); } finally { setBusy(false); }
  };
  return (
    <section aria-label="Comments" className="card p-3">
      <h3 className="mb-2 text-sm font-semibold">Comments{data ? ` (${data.items.length})` : ""}</h3>
      {me ? (
        <form onSubmit={post} className="mb-3 flex gap-2"><input className="field" placeholder="Add a comment" aria-label="Add a comment" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} /><button className="btn-primary shrink-0" disabled={busy || !text.trim()}>Post</button></form>
      ) : <p className="mb-3 text-sm text-mute"><Link className="underline" to="/login">Sign in</Link> to comment.</p>}
      {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? <p className="text-sm text-mute">No comments yet.</p> : (
        <ul className="space-y-2">{data.items.map((c) => (
          <li key={c.id} className="flex items-start gap-2 text-sm"><div className="min-w-0 flex-1"><Link to={`/u/${c.user.id}`} className="font-medium hover:underline">{c.user.username}</Link> <span className="text-xs text-mute">{new Date(c.createdAt).toLocaleDateString()}</span><p className="break-words">{c.text}</p></div>
            {(me?.isAdmin || me?.id === c.user.id) && <button className="icon-btn !h-7 !w-7" aria-label="Delete comment" onClick={async () => { try { await api(`/songs/${songId}/comments/${c.id}`, { method: "DELETE" }); reload(); } catch (e) { toast((e as Error).message, "error"); } }}><Trash2 size={14} /></button>}</li>
        ))}</ul>
      )}
    </section>
  );
}
