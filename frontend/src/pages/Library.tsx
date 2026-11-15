import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useAsync } from "@/lib/useAsync";
import { api } from "@/lib/api";
import { Loading, ErrorState, Empty } from "@/components/States";
import { SongList } from "@/components/SongRow";
import { Dialog, Confirm } from "@/components/Dialog";
import { Cover } from "@/components/Cover";
import { toast } from "@/stores/toast";
import { useAuth } from "@/stores/auth";
import { plural } from "@/lib/format";
import type { Playlist, Song } from "@/lib/types";

const TABS = [["favorites", "Favorites"], ["playlists", "Playlists"], ["history", "History"], ["uploads", "My uploads"]] as const;

export default function LibraryPage() {
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as (typeof TABS)[number][0]) || "favorites";
  return (
    <>
      <h1 className="h-page mb-4">Your library</h1>
      <div role="tablist" className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setParams({ tab: k })} className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${tab === k ? "border-accent text-ink" : "border-transparent text-mute hover:text-ink"}`}>{l}</button>)}
      </div>
      {tab === "favorites" && <Favorites />}{tab === "playlists" && <Playlists />}{tab === "history" && <History />}{tab === "uploads" && <Uploads />}
    </>
  );
}

function Favorites() {
  const { data, loading, error, reload, setData } = useAsync((s) => api<{ items: Song[] }>("/me/favorites", { signal: s }), []);
  const toggleLike = useAuth((s) => s.toggleLike);
  if (loading) return <Loading />; if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data?.items.length) return <Empty title="No favorites yet" hint="Tap the heart on any track to keep it here." action={<Link to="/search" className="btn-primary mt-2">Find music</Link>} />;
  return <SongList songs={data.items} onChange={reload} onRemoveFromList={async (s) => { await toggleLike(s.id).catch((e) => toast(e.message, "error")); setData({ items: data.items.filter((x) => x.id !== s.id) }); }} />;
}

function History() {
  const { data, loading, error, reload } = useAsync((s) => api<{ items: { playedAt: string; song: Song }[] }>("/me/history", { signal: s }), []);
  const taste = useAsync((s) => api<{ hasData: boolean; totalPlays: number; topGenres: { name: string; count: number }[]; topArtists: { name: string; count: number }[]; thisWeek: number; prevWeek: number; approxMinutes: number }>("/me/taste", { signal: s }), []);
  const [confirm, setConfirm] = useState(false);
  if (loading) return <Loading />; if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data?.items.length) return <Empty title="Nothing played yet" hint="Tracks you listen to while signed in appear here — only you can see your history." />;
  const songs = data.items.map((i) => i.song);
  const t = taste.data;
  return (
    <>
      {t?.hasData && (
        <section className="card mb-6 grid gap-4 p-4 sm:grid-cols-3" aria-label="Your taste">
          <div><p className="label">Top genres</p>{t.topGenres.slice(0, 3).map((g) => <p key={g.name} className="text-sm">{g.name} <span className="text-mute">· {plural(g.count, "play")}</span></p>)}</div>
          <div><p className="label">Top artists</p>{t.topArtists.slice(0, 3).map((g) => <p key={g.name} className="text-sm">{g.name} <span className="text-mute">· {plural(g.count, "play")}</span></p>)}</div>
          <div><p className="label">This week</p><p className="text-sm">{plural(t.thisWeek, "play")}</p><p className="text-xs text-mute">{t.prevWeek ? `${t.thisWeek >= t.prevWeek ? "up" : "down"} from ${t.prevWeek} the week before` : "No earlier week to compare yet"}</p><p className="mt-1 text-xs text-mute">≈ {t.approxMinutes} min listened (last 500 plays)</p></div>
        </section>
      )}
      <div className="mb-3 flex justify-end"><button className="btn-ghost" onClick={() => setConfirm(true)}><Trash2 size={15} />Clear history</button></div>
      <SongList songs={songs} />
      <Confirm open={confirm} title="Clear listening history?" body="This permanently removes your play history and resets your taste summary." confirmLabel="Clear" onClose={() => setConfirm(false)} onConfirm={async () => { try { await api("/me/history", { method: "DELETE" }); toast("History cleared"); reload(); taste.reload(); } catch (e) { toast((e as Error).message, "error"); } }} />
    </>
  );
}

function Uploads() {
  const me = useAuth((s) => s.user)!;
  const { data, loading, error, reload } = useAsync((s) => api<{ items: Song[] }>(`/songs?artist=${me.id}&limit=100`, { signal: s }), [me.id]);
  if (loading) return <Loading />; if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data?.items.length) return <Empty title="You haven't uploaded anything" hint="Share original music, or tracks you have the rights to distribute." action={<Link to="/upload" className="btn-primary mt-2">Upload a track</Link>} />;
  return <SongList songs={data.items} onChange={reload} />;
}

export function Playlists() {
  const { data, loading, error, reload } = useAsync((s) => api<{ items: Playlist[] }>("/playlists/mine", { signal: s }), []);
  const [open, setOpen] = useState(false); const [name, setName] = useState(""); const [pub, setPub] = useState(false);
  const create = async (e: React.FormEvent) => { e.preventDefault(); try { await api("/playlists", { method: "POST", body: { name: name.trim(), isPublic: pub } }); setOpen(false); setName(""); toast("Playlist created"); reload(); } catch (er) { toast((er as Error).message, "error"); } };
  return (
    <>
      <div className="mb-4 flex justify-end"><button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} />New playlist</button></div>
      {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? <Empty title="No playlists yet" hint="Group tracks for a mood, a trip or a workout." /> : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">{data.items.map((p) => <li key={p.id}><Link to={`/playlist/${p.id}`} className="group block"><Cover seed={p.name + p.id} className="w-full" rounded="rounded-xl" /><p className="mt-2 truncate text-sm font-medium group-hover:underline">{p.name}</p><p className="text-xs text-mute">{plural(p.songCount, "track")} · {p.isPublic ? "Public" : "Private"}</p></Link></li>)}</ul>
      )}
      <Dialog open={open} onClose={() => setOpen(false)} title="New playlist">
        <form onSubmit={create} className="space-y-4">
          <div><label className="label" htmlFor="pn">Name</label><input id="pn" className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required autoFocus /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} className="accent-[rgb(var(--accent))]" />Make public (anyone with the link can view)</label>
          <div className="flex justify-end"><button className="btn-primary" disabled={!name.trim()}>Create</button></div>
        </form>
      </Dialog>
    </>
  );
}

