import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play, Shuffle, Trash2, Globe, Lock, ListEnd, Pencil } from "lucide-react";
import { useAsync } from "@/lib/useAsync";
import { api } from "@/lib/api";
import { Loading, ErrorState, Empty } from "@/components/States";
import { SongList } from "@/components/SongRow";
import { Cover } from "@/components/Cover";
import { Confirm, Dialog } from "@/components/Dialog";
import { usePlayer } from "@/stores/player";
import { toast } from "@/stores/toast";
import { plural } from "@/lib/format";
import type { Playlist } from "@/lib/types";

export default function PlaylistPage() {
  const { id } = useParams(); const nav = useNavigate();
  const { data, loading, error, reload } = useAsync((s) => api<{ playlist: Playlist; canEdit: boolean }>(`/playlists/${id}`, { signal: s }), [id]);
  const { playQueue, addToQueue } = usePlayer();
  const [del, setDel] = useState(false), [edit, setEdit] = useState(false), [name, setName] = useState(""), [desc, setDesc] = useState("");
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error === "Playlist not found" ? "This playlist doesn't exist or is private." : error} onRetry={reload} />;
  const p = data!.playlist, songs = p.songs || [], canEdit = data!.canEdit;
  const patch = async (b: object) => { try { await api(`/playlists/${p.id}`, { method: "PATCH", body: b }); reload(); } catch (e) { toast((e as Error).message, "error"); } };
  return (
    <>
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end">
        <Cover seed={p.name + p.id} className="w-40 shrink-0 sm:w-48" rounded="rounded-2xl" />
        <div className="min-w-0">
          <p className="label">Playlist · {p.isPublic ? "Public" : "Private"}</p>
          <h1 className="h-page break-words">{p.name}</h1>
          <p className="mt-1 text-sm text-mute">{p.owner.username} · {plural(songs.length, "track")}</p>
          {p.desc && <p className="mt-1 text-sm">{p.desc}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" disabled={!songs.length} onClick={() => playQueue(songs, 0)}><Play size={16} fill="currentColor" />Play</button>
            <button className="btn-ghost" disabled={!songs.length} onClick={() => { const sh = [...songs].sort(() => Math.random() - 0.5); playQueue(sh, 0); }}><Shuffle size={16} />Shuffle</button>
            <button className="btn-ghost" disabled={!songs.length} onClick={() => { addToQueue(songs); toast("Added to queue"); }}><ListEnd size={16} />Queue</button>
            {canEdit && <button className="btn-ghost" onClick={() => { setName(p.name); setDesc(p.desc); setEdit(true); }}><Pencil size={15} />Edit</button>}
            {canEdit && <button className="btn-ghost" onClick={() => patch({ isPublic: !p.isPublic })}>{p.isPublic ? <><Lock size={15} />Make private</> : <><Globe size={15} />Make public</>}</button>}
            {canEdit && <button className="btn-danger" onClick={() => setDel(true)}><Trash2 size={15} />Delete</button>}
          </div>
        </div>
      </div>
      {songs.length ? <SongList songs={songs} onChange={reload} onRemoveFromList={canEdit ? async (s) => { try { await api(`/playlists/${p.id}/songs/${s.id}`, { method: "DELETE" }); reload(); } catch (e) { toast((e as Error).message, "error"); } } : undefined} /> : <Empty title="This playlist is empty" hint="Use “Add to playlist” in any track's menu." />}
      <Dialog open={edit} onClose={() => setEdit(false)} title="Edit playlist">
        <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); await patch({ name: name.trim(), desc }); setEdit(false); toast("Playlist updated"); }}>
          <div><label className="label" htmlFor="en">Name</label><input id="en" className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required /></div>
          <div><label className="label" htmlFor="ed">Description</label><textarea id="ed" className="field" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={500} /></div>
          <div className="flex justify-end"><button className="btn-primary" disabled={!name.trim()}>Save</button></div>
        </form>
      </Dialog>
      <Confirm open={del} title="Delete playlist?" body={`“${p.name}” will be deleted. The songs themselves stay in SoundBox.`} onClose={() => setDel(false)} onConfirm={async () => { try { await api(`/playlists/${p.id}`, { method: "DELETE" }); toast("Playlist deleted"); nav("/library?tab=playlists"); } catch (e) { toast((e as Error).message, "error"); } }} />
    </>
  );
}
