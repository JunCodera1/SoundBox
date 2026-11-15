import { Link } from "react-router-dom";
import { useAsync } from "@/lib/useAsync";
import { api } from "@/lib/api";
import { Loading, ErrorState, Empty } from "@/components/States";
import { Shelf, SongCard } from "@/components/SongRow";
import { Cover } from "@/components/Cover";
import { useAuth } from "@/stores/auth";
import type { Playlist, Song } from "@/lib/types";

interface Home { recent: Song[]; trending: Song[]; genres: { name: string; count: number }[]; playlists: Playlist[]; recentlyPlayed?: Song[]; recommended?: Song[] }

export default function HomePage() {
  const user = useAuth((s) => s.user);
  const { data, loading, error, reload } = useAsync((signal) => api<Home>("/discover/home", { signal }), [user?.id]);
  const hour = new Date().getHours();
  const greet = hour < 5 ? "Late night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <>
      <h1 className="h-page mb-1">{user ? `${greet}, ${user.username}` : "Your personal music universe"}</h1>
      <p className="mb-8 text-mute">{user ? "Pick up where you left off, or find something new." : "Listen, collect and share music. Sign in to save favorites, build playlists and get picks tuned to your taste."}</p>
      {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={reload} /> : data && (
        <>
          {data.recentlyPlayed?.length ? <Shelf title="Recently played">{data.recentlyPlayed.map((s, i) => <SongCard key={s.id} song={s} context={data.recentlyPlayed!} index={i} />)}</Shelf> : null}
          {data.recommended?.length ? <Shelf title="Picked for you">{data.recommended.map((s, i) => <SongCard key={s.id} song={s} context={data.recommended!} index={i} />)}</Shelf> : null}
          {data.trending.length === 0 && data.recent.length === 0 ? (
            <Empty title="The catalog is empty" hint="Upload the first track (only music you have the rights to share) or run `npm run seed` for demo tracks." action={<Link to="/upload" className="btn-primary mt-2">Upload a track</Link>} />
          ) : (<>
            {data.genres.length > 0 && <section className="mb-8"><h2 className="h-section mb-3">Browse by genre</h2><div className="flex flex-wrap gap-2">{data.genres.map((g) => <Link key={g.name} to={`/search?genre=${encodeURIComponent(g.name)}`} className="btn-ghost">{g.name}<span className="text-xs text-mute">{g.count}</span></Link>)}</div></section>}
            <Shelf title={data.trending.some((s) => s.plays > 0) ? "Most played" : "From the catalog"} action={data.trending.some((s) => s.plays > 0) ? <span className="text-xs text-mute">by listens on SoundBox</span> : undefined}>{data.trending.map((s, i) => <SongCard key={s.id} song={s} context={data.trending} index={i} />)}</Shelf>
            <Shelf title="Recently added">{data.recent.map((s, i) => <SongCard key={s.id} song={s} context={data.recent} index={i} />)}</Shelf>
            {data.playlists.length > 0 && <Shelf title="Public playlists">{data.playlists.map((p) => <PlaylistCard key={p.id} p={p} />)}</Shelf>}
          </>)}
        </>
      )}
    </>
  );
}
export function PlaylistCard({ p }: { p: Playlist }) {
  return <Link to={`/playlist/${p.id}`} className="group w-40 shrink-0 sm:w-44"><Cover seed={p.name + p.id} className="w-full" rounded="rounded-xl" /><p className="mt-2 truncate text-sm font-medium group-hover:underline">{p.name}</p><p className="truncate text-xs text-mute">{p.songCount} tracks · {p.owner.username}</p></Link>;
}
