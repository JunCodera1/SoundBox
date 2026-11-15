import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MoreHorizontal, Play, Pause, ListPlus, ListEnd, ListMusic, Trash2, User as UserIcon } from "lucide-react";
import { Cover } from "./Cover";
import { AddToPlaylist } from "./AddToPlaylist";
import { Confirm } from "./Dialog";
import { fmtTime } from "@/lib/format";
import { usePlayer } from "@/stores/player";
import { useAuth } from "@/stores/auth";
import { toast } from "@/stores/toast";
import { api } from "@/lib/api";
import type { Song } from "@/lib/types";

export function LikeButton({ songId }: { songId: string }) {
  const { user, toggleLike } = useAuth();
  const liked = !!user?.likedSongIds.includes(songId);
  return (
    <button className={`icon-btn ${liked ? "!text-accent" : ""}`} aria-pressed={liked} aria-label={liked ? "Remove from favorites" : "Add to favorites"}
      onClick={async () => { if (!user) return toast("Sign in to save favorites", "error"); try { await toggleLike(songId); } catch (e) { toast((e as Error).message, "error"); } }}>
      <Heart size={18} fill={liked ? "currentColor" : "none"} />
    </button>
  );
}

/** One row used everywhere a track is listed. `context` is the list it belongs to (so Play starts a proper queue). */
export function SongRow({ song, context, index, onRemoved, onRemoveFromList }: { song: Song; context: Song[]; index: number; onRemoved?: () => void; onRemoveFromList?: () => void }) {
  const { current, playing, playQueue, toggle, addToQueue, playNext } = usePlayer();
  const user = useAuth((s) => s.user);
  const [menu, setMenu] = useState(false), [pl, setPl] = useState(false), [del, setDel] = useState(false);
  const isCurrent = current()?.id === song.id;
  const mine = !!user && (user.isAdmin || user.id === song.artist?.id);
  const act = () => (isCurrent ? toggle() : playQueue(context, index));
  return (
    <li className={`group relative flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-raised ${isCurrent ? "bg-raised" : ""}`}>
      <button onClick={act} className="relative shrink-0" aria-label={`${isCurrent && playing ? "Pause" : "Play"} ${song.name}`}>
        <Cover src={song.thumbnail} seed={song.name} className="h-11 w-11" />
        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:hidden">{isCurrent && playing ? <Pause size={18} fill="#fff" color="#fff" /> : <Play size={18} fill="#fff" color="#fff" />}</span>
      </button>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${isCurrent ? "text-accent" : ""}`}>{song.name}</p>
        <p className="truncate text-xs text-mute">{song.artist?.username ? <Link to={`/u/${song.artist.id}`} className="hover:underline">{song.artist.username}</Link> : "Unknown artist"} · {song.genre}</p>
      </div>
      <span className="hidden text-xs tabular-nums text-mute sm:block">{fmtTime(song.duration)}</span>
      <LikeButton songId={song.id} />
      <div className="relative">
        <button className="icon-btn" aria-label={`More actions for ${song.name}`} aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><MoreHorizontal size={18} /></button>
        {menu && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenu(false)} />
            <ul role="menu" className="card absolute right-0 top-10 z-40 w-52 overflow-hidden py-1 text-sm shadow-xl" onClick={() => setMenu(false)}>
              <MenuItem icon={<ListPlus size={16} />} onClick={() => playNext(song)}>Play next</MenuItem>
              <MenuItem icon={<ListEnd size={16} />} onClick={() => { addToQueue(song); toast("Added to queue"); }}>Add to queue</MenuItem>
              <MenuItem icon={<ListMusic size={16} />} onClick={() => (user ? setPl(true) : toast("Sign in to use playlists", "error"))}>Add to playlist…</MenuItem>
              {song.artist && <li role="none"><Link role="menuitem" to={`/u/${song.artist.id}`} className="flex items-center gap-2 px-3 py-2 hover:bg-raised"><UserIcon size={16} />Go to artist</Link></li>}
              {onRemoveFromList && <MenuItem icon={<Trash2 size={16} />} onClick={onRemoveFromList}>Remove from this list</MenuItem>}
              {mine && <MenuItem danger icon={<Trash2 size={16} />} onClick={() => setDel(true)}>Delete song…</MenuItem>}
            </ul>
          </>
        )}
      </div>
      <AddToPlaylist song={pl ? song : null} onClose={() => setPl(false)} />
      <Confirm open={del} title="Delete this song?" body={`“${song.name}” will be removed from SoundBox, including playlists and favorites. This can't be undone.`}
        onClose={() => setDel(false)} onConfirm={async () => { try { await api(`/songs/${song.id}`, { method: "DELETE" }); toast("Song deleted"); onRemoved?.(); } catch (e) { toast((e as Error).message, "error"); } }} />
    </li>
  );
}
const MenuItem = ({ icon, children, onClick, danger }: { icon: React.ReactNode; children: React.ReactNode; onClick: () => void; danger?: boolean }) => (
  <li role="none"><button role="menuitem" onClick={onClick} className={`flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-raised ${danger ? "text-danger" : ""}`}>{icon}{children}</button></li>
);

export function SongList({ songs, onChange, onRemoveFromList }: { songs: Song[]; onChange?: () => void; onRemoveFromList?: (s: Song) => void }) {
  return <ul className="space-y-0.5">{songs.map((s, i) => <SongRow key={s.id + i} song={s} index={i} context={songs} onRemoved={onChange} onRemoveFromList={onRemoveFromList ? () => onRemoveFromList(s) : undefined} />)}</ul>;
}

/** Square card for horizontal shelves. */
export function SongCard({ song, context, index }: { song: Song; context: Song[]; index: number }) {
  const { current, playing, playQueue, toggle } = usePlayer();
  const isCurrent = current()?.id === song.id;
  return (
    <div className="group w-40 shrink-0 sm:w-44">
      <button className="relative block w-full" onClick={() => (isCurrent ? toggle() : playQueue(context, index))} aria-label={`${isCurrent && playing ? "Pause" : "Play"} ${song.name}`}>
        <Cover src={song.thumbnail} seed={song.name} className="w-full" rounded="rounded-xl" />
        <span className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-ink opacity-0 shadow-lg transition-opacity group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100">{isCurrent && playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</span>
      </button>
      <p className="mt-2 truncate text-sm font-medium">{song.name}</p>
      <p className="truncate text-xs text-mute">{song.artist?.username || "Unknown"} · {song.genre}</p>
    </div>
  );
}
export const Shelf = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <section className="mb-8"><div className="mb-3 flex items-end justify-between"><h2 className="h-section">{title}</h2>{action}</div><div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">{children}</div></section>
);
