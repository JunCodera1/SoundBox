import { useParams } from "react-router-dom";
import { UserPlus, UserCheck, Play } from "lucide-react";
import { useAsync } from "@/lib/useAsync";
import { api } from "@/lib/api";
import { Loading, ErrorState, Empty } from "@/components/States";
import { SongList, Shelf, SongCard } from "@/components/SongRow";
import { PlaylistCard } from "./Home";
import { Cover } from "@/components/Cover";
import { useAuth } from "@/stores/auth";
import { usePlayer } from "@/stores/player";
import { toast } from "@/stores/toast";
import { plural } from "@/lib/format";
import type { Playlist, Song } from "@/lib/types";

interface Prof { user: { id: string; username: string; bio?: string; followers: number; following: number; isFollowing: boolean; favoriteGenres: string[] }; songs: Song[]; playlists: Playlist[]; recentlyPlayed?: Song[] }

export default function ProfilePage() {
  const { id } = useParams(); const me = useAuth((s) => s.user); const playQueue = usePlayer((s) => s.playQueue);
  const { data, loading, error, reload } = useAsync((s) => api<Prof>(`/users/${id}`, { signal: s }), [id, me?.id]);
  if (loading) return <Loading />; if (error) return <ErrorState message={error} onRetry={reload} />;
  const { user, songs, playlists, recentlyPlayed } = data!; const self = me?.id === user.id;
  const follow = async () => {
    if (!me) return toast("Sign in to follow artists", "error");
    try { await api(`/users/${user.id}/follow`, { method: user.isFollowing ? "DELETE" : "POST" }); reload(); } catch (e) { toast((e as Error).message, "error"); }
  };
  return (
    <>
      <div className="mb-8 flex flex-col items-start gap-5 sm:flex-row sm:items-end">
        <Cover seed={user.username} className="h-32 w-32 shrink-0" rounded="rounded-full" />
        <div><p className="label">{songs.length ? "Artist" : "Listener"}</p><h1 className="h-page">{user.username}</h1>
          {user.bio && <p className="mt-1 text-sm text-mute">{user.bio}</p>}
          <p className="mt-1 text-sm text-mute">{plural(user.followers, "follower")} · {user.following} following</p>
          <div className="mt-4 flex gap-2">
            {songs.length > 0 && <button className="btn-primary" onClick={() => playQueue(songs, 0)}><Play size={16} fill="currentColor" />Play</button>}
            {!self && <button className="btn-ghost" onClick={follow} aria-pressed={user.isFollowing}>{user.isFollowing ? <><UserCheck size={16} />Following</> : <><UserPlus size={16} />Follow</>}</button>}
          </div></div>
      </div>
      {songs.length > 0 ? <section className="mb-8"><h2 className="h-section mb-2">Songs</h2><SongList songs={songs} onChange={reload} /></section> : <Empty title="No uploads yet" />}
      {playlists.length > 0 && <Shelf title="Playlists">{playlists.map((p) => <PlaylistCard key={p.id} p={p} />)}</Shelf>}
      {recentlyPlayed && recentlyPlayed.length > 0 && <Shelf title={self ? "Recently played (only visible to others if you allow it)" : "Recently played"}>{recentlyPlayed.map((s, i) => <SongCard key={s.id} song={s} context={recentlyPlayed} index={i} />)}</Shelf>}
    </>
  );
}
