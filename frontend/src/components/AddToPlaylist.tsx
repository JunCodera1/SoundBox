import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Dialog } from "./Dialog";
import { Loading, ErrorState } from "./States";
import { useAsync } from "@/lib/useAsync";
import { api } from "@/lib/api";
import { toast } from "@/stores/toast";
import type { Playlist, Song } from "@/lib/types";

export function AddToPlaylist({ song, onClose }: { song: Song | null; onClose: () => void }) {
  const { data, loading, error, reload } = useAsync((signal) => (song ? api<{ items: Playlist[] }>("/playlists/mine", { signal }) : Promise.resolve({ items: [] })), [song?.id]);
  const [name, setName] = useState(""); const [busy, setBusy] = useState(false);
  const add = async (pid: string) => {
    try { await api(`/playlists/${pid}/songs`, { method: "POST", body: { songId: song!.id } }); toast("Added to playlist"); onClose(); }
    catch (e) { toast((e as Error).message, "error"); }
  };
  const create = async (ev: React.FormEvent) => {
    ev.preventDefault(); if (!name.trim()) return; setBusy(true);
    try { await api("/playlists", { method: "POST", body: { name: name.trim(), songIds: [song!.id] } }); toast(`Created “${name.trim()}”`); setName(""); onClose(); }
    catch (e) { toast((e as Error).message, "error"); } finally { setBusy(false); }
  };
  return (
    <Dialog open={!!song} onClose={onClose} title="Add to playlist">
      <form onSubmit={create} className="mb-4 flex gap-2">
        <input className="field" placeholder="New playlist name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} aria-label="New playlist name" />
        <button className="btn-primary shrink-0" disabled={busy || !name.trim()}><Plus size={16} />Create</button>
      </form>
      {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <ul className="max-h-64 space-y-1 overflow-auto">
          {data?.items.length === 0 && <li className="py-2 text-sm text-mute">No playlists yet — create one above.</li>}
          {data?.items.map((p) => (
            <li key={p.id}><button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-raised" onClick={() => add(p.id)}><span>{p.name}</span><span className="text-xs text-mute">{p.songCount} tracks</span></button></li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
export { Check };
