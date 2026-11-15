import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX, Volume1, ChevronDown, ChevronUp, ListMusic, Moon, X, ArrowUp, ArrowDown, Loader2, AlertCircle } from "lucide-react";
import { usePlayer } from "@/stores/player";
import { Cover } from "./Cover";
import { LikeButton } from "./SongRow";
import { Comments } from "./Comments";
import { fmtTime } from "@/lib/format";

function Seek({ className = "" }: { className?: string }) {
  const { currentTime, duration, seek, current } = usePlayer();
  const max = duration || current()?.duration || 0;
  return (
    <div className={`flex items-center gap-2 text-[11px] tabular-nums text-mute ${className}`}>
      <span className="w-9 text-right">{fmtTime(currentTime)}</span>
      <input type="range" aria-label="Seek" min={0} max={max || 1} step={0.1} value={Math.min(currentTime, max || 1)} disabled={!max} onChange={(e) => seek(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer accent-[rgb(var(--accent))]" style={{ background: "none" }} aria-valuetext={`${fmtTime(currentTime)} of ${fmtTime(max)}`} />
      <span className="w-9">{fmtTime(max)}</span>
    </div>
  );
}

function Transport({ big = false }: { big?: boolean }) {
  const { playing, loading, shuffle, repeat, toggle, next, prev, toggleShuffle, cycleRepeat } = usePlayer();
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      <button className={`icon-btn hidden sm:inline-flex ${shuffle ? "!text-accent" : ""}`} aria-label="Shuffle" aria-pressed={shuffle} onClick={toggleShuffle}><Shuffle size={18} /></button>
      <button className="icon-btn" aria-label="Previous track" onClick={prev}><SkipBack size={20} fill="currentColor" /></button>
      <button className={`flex items-center justify-center rounded-full bg-accent text-accent-ink hover:brightness-110 ${big ? "h-14 w-14" : "h-10 w-10"}`} aria-label={playing ? "Pause" : "Play"} onClick={toggle}>
        {loading ? <Loader2 className="animate-spin" size={big ? 26 : 20} /> : playing ? <Pause size={big ? 26 : 20} fill="currentColor" /> : <Play size={big ? 26 : 20} fill="currentColor" />}
      </button>
      <button className="icon-btn" aria-label="Next track" onClick={() => next()}><SkipForward size={20} fill="currentColor" /></button>
      <button className={`icon-btn hidden sm:inline-flex ${repeat !== "off" ? "!text-accent" : ""}`} aria-label={`Repeat: ${repeat}`} onClick={cycleRepeat}><RepeatIcon size={18} /></button>
    </div>
  );
}

function Volume() {
  const { volume, muted, setVolume, toggleMute } = usePlayer();
  const Icon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  return (
    <div className="flex items-center gap-1">
      <button className="icon-btn" aria-label={muted ? "Unmute" : "Mute"} aria-pressed={muted} onClick={toggleMute}><Icon size={18} /></button>
      <input type="range" aria-label="Volume" min={0} max={1} step={0.01} value={muted ? 0 : volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-24 accent-[rgb(var(--accent))]" />
    </div>
  );
}

const SLEEP = [15, 30, 45, 60];
function SleepTimer() {
  const { sleepAt, setSleepTimer } = usePlayer();
  const [open, setOpen] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => { if (!sleepAt) return; const i = setInterval(() => tick((n) => n + 1), 15000); return () => clearInterval(i); }, [sleepAt]);
  const left = sleepAt ? Math.max(1, Math.ceil((sleepAt - Date.now()) / 60000)) : 0;
  return (
    <div className="relative">
      <button className={`icon-btn ${sleepAt ? "!text-accent" : ""}`} aria-label={sleepAt ? `Sleep timer: ${left} min left` : "Sleep timer"} aria-expanded={open} onClick={() => setOpen((o) => !o)}><Moon size={18} /></button>
      {open && (<>
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
        <div className="card absolute bottom-11 right-0 z-40 w-44 py-1 text-sm shadow-xl" role="menu" onClick={() => setOpen(false)}>
          {SLEEP.map((m) => <button key={m} role="menuitem" className="block w-full px-3 py-2 text-left hover:bg-raised" onClick={() => setSleepTimer(m)}>Stop in {m} min</button>)}
          {sleepAt && <button role="menuitem" className="block w-full px-3 py-2 text-left text-danger hover:bg-raised" onClick={() => setSleepTimer(null)}>Cancel ({left} min left)</button>}
        </div>
      </>)}
    </div>
  );
}

function Queue() {
  const { queue, index, jumpTo, removeFromQueue, moveInQueue, clearQueue } = usePlayer();
  if (!queue.length) return <p className="py-6 text-center text-sm text-mute">The queue is empty.</p>;
  const upcoming = queue.length - index - 1;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between"><p className="text-sm text-mute">{upcoming > 0 ? `${upcoming} up next` : "Nothing after this track"}</p><button className="btn-ghost !py-1 text-xs" onClick={clearQueue}>Clear queue</button></div>
      <ol className="space-y-0.5" aria-label="Playback queue">
        {queue.map((s, i) => (
          <li key={s.id + i} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${i === index ? "bg-raised" : "hover:bg-raised/60"}`}>
            <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => jumpTo(i)} aria-label={`Play ${s.name}`}>
              <Cover src={s.thumbnail} seed={s.name} className="h-9 w-9 shrink-0" />
              <span className="min-w-0"><span className={`block truncate text-sm ${i === index ? "text-accent" : ""}`}>{s.name}</span><span className="block truncate text-xs text-mute">{s.artist?.username}</span></span>
            </button>
            <button className="icon-btn !h-7 !w-7" aria-label={`Move ${s.name} up`} disabled={i === 0} onClick={() => moveInQueue(i, i - 1)}><ArrowUp size={14} /></button>
            <button className="icon-btn !h-7 !w-7" aria-label={`Move ${s.name} down`} disabled={i === queue.length - 1} onClick={() => moveInQueue(i, i + 1)}><ArrowDown size={14} /></button>
            <button className="icon-btn !h-7 !w-7" aria-label={`Remove ${s.name} from queue`} onClick={() => removeFromQueue(i)}><X size={14} /></button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ErrorBanner() {
  const { error, retry, next, queue } = usePlayer();
  if (!error) return null;
  return (
    <div role="alert" className="flex items-center gap-2 bg-danger/15 px-4 py-1.5 text-xs text-danger"><AlertCircle size={14} /><span className="flex-1 truncate">{error}</span><button className="underline" onClick={retry}>Retry</button>{queue.length > 1 && <button className="underline" onClick={() => next()}>Skip</button>}</div>
  );
}

export function PlayerBar() {
  const { current, expanded, setExpanded, queue } = usePlayer();
  const song = current();
  const [showQueue, setShowQueue] = useState(false);
  useEffect(() => { document.title = song ? `${song.name} · SoundBox` : "SoundBox — your personal music universe"; }, [song]);
  if (!song) return null;
  return (
    <>
      {expanded && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-auto bg-bg" role="dialog" aria-label="Now playing">
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 p-5 pb-8">
            <div className="flex items-center justify-between"><button className="icon-btn" aria-label="Close player" onClick={() => setExpanded(false)}><ChevronDown /></button><p className="text-xs uppercase tracking-widest text-mute">Now playing</p><SleepTimer /></div>
            <Cover src={song.thumbnail} seed={song.name} className="mx-auto w-full max-w-xs" rounded="rounded-2xl" />
            <div className="flex items-center gap-2"><div className="min-w-0 flex-1"><h2 className="truncate font-display text-2xl font-bold">{song.name}</h2><p className="truncate text-mute">{song.artist ? <Link onClick={() => setExpanded(false)} to={`/u/${song.artist.id}`} className="hover:underline">{song.artist.username}</Link> : "Unknown"} · {song.genre}</p></div><LikeButton songId={song.id} /></div>
            <ErrorBanner />
            <Seek />
            <Transport big />
            <div className="flex justify-center"><Volume /></div>
            <p className="text-center text-xs text-mute">Lyrics aren't available for this catalog.</p>
            <div className="card p-3"><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><ListMusic size={16} />Queue</h3><Queue /></div>
            <Comments songId={song.id} />
          </div>
        </div>
      )}
      <div className="border-t border-line bg-surface/95 backdrop-blur" role="region" aria-label="Player">
        <ErrorBanner />
        <div className="mx-auto flex max-w-screen-2xl items-center gap-3 px-3 py-2 md:px-4">
          <button className="flex min-w-0 flex-1 items-center gap-3 text-left md:w-1/4 md:flex-none" onClick={() => setExpanded(true)} aria-label="Open full player">
            <Cover src={song.thumbnail} seed={song.name} className="h-12 w-12 shrink-0" />
            <span className="min-w-0"><span className="block truncate text-sm font-medium">{song.name}</span><span className="block truncate text-xs text-mute">{song.artist?.username || "Unknown artist"}</span></span>
          </button>
          <div className="hidden flex-1 flex-col gap-1 md:flex"><Transport /><Seek /></div>
          <div className="md:hidden"><Transport /></div>
          <div className="hidden items-center md:flex md:w-1/4 md:justify-end">
            <SleepTimer />
            <button className={`icon-btn ${showQueue ? "!text-accent" : ""}`} aria-label="Queue" aria-expanded={showQueue} onClick={() => setShowQueue((q) => !q)}><ListMusic size={18} />{queue.length > 1 && <span className="sr-only">{queue.length} tracks</span>}</button>
            <Volume />
            <button className="icon-btn" aria-label="Expand player" onClick={() => setExpanded(true)}><ChevronUp size={18} /></button>
          </div>
        </div>
        <div className="px-3 pb-1 md:hidden"><Seek /></div>
      </div>
      {showQueue && !expanded && (
        <div className="card fixed bottom-24 right-4 z-40 hidden max-h-[60vh] w-96 overflow-auto p-3 shadow-2xl md:block"><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold">Queue</h3><button className="icon-btn" aria-label="Close queue" onClick={() => setShowQueue(false)}><X size={16} /></button></div><Queue /></div>
      )}
    </>
  );
}
