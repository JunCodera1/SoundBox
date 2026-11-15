import { useState } from "react";
import { Sparkles, Play, Save } from "lucide-react";
import { api } from "@/lib/api";
import { SongList } from "@/components/SongRow";
import { usePlayer } from "@/stores/player";
import { toast } from "@/stores/toast";
import { Link } from "react-router-dom";
import type { Song } from "@/lib/types";

const IDEAS = ["calm focus music", "energetic workout", "rainy night", "party electronic"];

export default function AssistantPage() {
  const [prompt, setPrompt] = useState(""); const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ explanation: string; songs: Song[]; playlistId: string | null } | null>(null);
  const playQueue = usePlayer((s) => s.playQueue);
  const run = async (save = false, text = prompt) => {
    if (text.trim().length < 2) return; setBusy(true);
    try { const r = await api<{ explanation: string; songs: Song[]; playlistId: string | null }>("/discover/assistant", { method: "POST", body: { prompt: text.trim(), save } }); setRes(r); if (r.playlistId) toast("Saved as a playlist"); }
    catch (e) { toast((e as Error).message, "error"); } finally { setBusy(false); }
  };
  return (
    <>
      <h1 className="h-page mb-1">Mix Maker</h1>
      <p className="mb-6 text-mute">Describe a mood, activity or genre and get a mix built from tracks that really exist in the SoundBox catalog.</p>
      <form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); run(); }}>
        <input className="field !py-3" aria-label="Describe your mix" placeholder="e.g. calm focus music" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={300} />
        <button className="btn-primary shrink-0" disabled={busy || prompt.trim().length < 2}><Sparkles size={16} />{busy ? "Mixing…" : "Make mix"}</button>
      </form>
      <div className="mb-8 flex flex-wrap gap-2">{IDEAS.map((i) => <button key={i} className="btn-ghost !py-1 text-xs" onClick={() => { setPrompt(i); run(false, i); }}>{i}</button>)}</div>
      <p className="mb-6 text-xs text-mute">Runs locally with keyword and genre matching — no external AI service is used or required.</p>
      {res && (<section aria-live="polite">
        <p className="mb-3 text-sm">{res.explanation}</p>
        {res.songs.length > 0 && (<>
          <div className="mb-3 flex gap-2"><button className="btn-primary" onClick={() => playQueue(res.songs, 0)}><Play size={16} fill="currentColor" />Play mix</button>
            {res.playlistId ? <Link className="btn-ghost" to={`/playlist/${res.playlistId}`}>Open playlist</Link> : <button className="btn-ghost" onClick={() => run(true)}><Save size={16} />Save as playlist</button>}</div>
          <SongList songs={res.songs} /></>)}
      </section>)}
    </>
  );
}
