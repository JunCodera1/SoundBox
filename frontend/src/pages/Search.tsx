import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, X } from "lucide-react";
import { useAsync } from "@/lib/useAsync";
import { api } from "@/lib/api";
import { Loading, ErrorState, Empty } from "@/components/States";
import { SongList } from "@/components/SongRow";
import { PlaylistCard } from "./Home";
import { Cover } from "@/components/Cover";
import type { Song, Playlist } from "@/lib/types";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "", genre = params.get("genre") || "";
  const [text, setText] = useState(q);
  const [sugg, setSugg] = useState<{ type: string; label: string }[]>([]);
  useEffect(() => setText(q), [q]);
  // debounce typing -> URL (the URL is the source of truth, so results are linkable/back-button friendly)
  useEffect(() => { if (text.trim() === q) return; const t = setTimeout(() => setParams(text.trim() ? { q: text.trim() } : {}, { replace: true }), 300); return () => clearTimeout(t); }, [text]);
  useEffect(() => {
    if (text.trim().length < 2 || text.trim() === q) { setSugg([]); return; }
    const ac = new AbortController();
    api<{ items: typeof sugg }>(`/search/suggest?q=${encodeURIComponent(text.trim())}`, { signal: ac.signal }).then((r) => setSugg(r.items), () => {});
    return () => ac.abort();
  }, [text, q]);

  const res = useAsync((signal) => q
    ? api<{ songs: Song[]; artists: { id: string; username: string; followers: number }[]; playlists: Playlist[] }>(`/search?q=${encodeURIComponent(q)}`, { signal })
    : genre ? api<{ items: Song[] }>(`/songs?genre=${encodeURIComponent(genre)}&limit=100`, { signal }).then((r) => ({ songs: r.items, artists: [], playlists: [] }))
    : Promise.resolve(null), [q, genre]);
  const genres = useAsync((signal) => api<{ items: { name: string; count: number }[] }>("/songs/genres", { signal }), []);

  return (
    <>
      <h1 className="h-page mb-4">Search</h1>
      <div className="relative mb-4">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" size={18} />
        <input className="field !py-3 !pl-10" type="search" role="searchbox" aria-label="Search songs, artists, genres" placeholder="Songs, artists, genres, playlists" value={text} onChange={(e) => setText(e.target.value)} autoFocus />
        {text && <button className="icon-btn absolute right-1 top-1/2 -translate-y-1/2" aria-label="Clear search" onClick={() => { setText(""); setParams({}); }}><X size={16} /></button>}
        {sugg.length > 0 && <ul className="card absolute z-20 mt-1 w-full overflow-hidden py-1 text-sm shadow-xl" role="listbox" aria-label="Suggestions">{sugg.map((s, i) => <li key={i} role="option" aria-selected="false"><button className="flex w-full justify-between px-3 py-2 hover:bg-raised" onClick={() => { setSugg([]); s.type === "genre" ? setParams({ genre: s.label }) : setParams({ q: s.label }); }}><span>{s.label}</span><span className="text-xs text-mute">{s.type}</span></button></li>)}</ul>}
      </div>
      {!q && !genre ? (
        <section><h2 className="h-section mb-3">Browse genres</h2>
          {genres.loading ? <Loading /> : genres.error ? <ErrorState message={genres.error} onRetry={genres.reload} /> : genres.data?.items.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{genres.data.items.map((g) => <Link key={g.name} to={`/search?genre=${encodeURIComponent(g.name)}`} className="card flex h-24 flex-col justify-end p-3 hover:border-accent"><span className="font-display text-lg font-semibold">{g.name}</span><span className="text-xs text-mute">{g.count} tracks</span></Link>)}</div> : <Empty title="Nothing to browse yet" hint="Genres appear as soon as the catalog has songs." />}
        </section>
      ) : res.loading ? <Loading label="Searching" /> : res.error ? <ErrorState message={res.error} onRetry={res.reload} /> : res.data && (
        <>
          {genre && !q && <h2 className="h-section mb-3">{genre}</h2>}
          {!res.data.songs.length && !res.data.artists.length && !res.data.playlists.length ? <Empty title={`No results for “${q || genre}”`} hint="Check the spelling, or try a genre or an artist name." /> : (<>
            {res.data.artists.length > 0 && <section className="mb-6"><h2 className="h-section mb-3">Artists</h2><div className="flex flex-wrap gap-3">{res.data.artists.map((a) => <Link key={a.id} to={`/u/${a.id}`} className="card flex items-center gap-3 px-3 py-2 hover:border-accent"><Cover seed={a.username} className="h-10 w-10" rounded="rounded-full" /><span className="text-sm font-medium">{a.username}</span></Link>)}</div></section>}
            {res.data.songs.length > 0 && <section className="mb-6"><h2 className="h-section mb-2">Songs</h2><SongList songs={res.data.songs} onChange={res.reload} /></section>}
            {res.data.playlists.length > 0 && <section><h2 className="h-section mb-3">Playlists</h2><div className="flex flex-wrap gap-4">{res.data.playlists.map((p) => <PlaylistCard key={p.id} p={p} />)}</div></section>}
          </>)}
        </>
      )}
    </>
  );
}
