import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "@/stores/toast";

const AUDIO_OK = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/ogg", "audio/flac", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/webm"];

export default function UploadPage() {
  const nav = useNavigate();
  const [audio, setAudio] = useState<File | null>(null), [cover, setCover] = useState<File | null>(null);
  const [name, setName] = useState(""), [genre, setGenre] = useState(""), [desc, setDesc] = useState("");
  const [rights, setRights] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState<string | null>(null);
  const duration = useRef<number | undefined>(undefined);

  const pickAudio = (f: File | null) => {
    setErr(null); setAudio(null);
    if (!f) return;
    if (!AUDIO_OK.includes(f.type)) return setErr("Unsupported audio type. Use MP3, WAV, OGG, FLAC, M4A or AAC.");
    if (f.size > 30 * 1024 * 1024) return setErr("Audio is larger than 30 MB.");
    setAudio(f); if (!name) setName(f.name.replace(/\.[^.]+$/, ""));
    const a = new Audio(); const url = URL.createObjectURL(f);
    a.preload = "metadata"; a.src = url;
    a.onloadedmetadata = () => { duration.current = isFinite(a.duration) ? Math.round(a.duration) : undefined; URL.revokeObjectURL(url); };
    a.onerror = () => { URL.revokeObjectURL(url); setAudio(null); setErr("This file can't be decoded as audio by your browser."); };
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!audio) return setErr("Choose an audio file."); setBusy(true); setErr(null);
    const fd = new FormData();
    fd.set("name", name.trim()); fd.set("genre", genre.trim()); fd.set("description", desc); fd.set("rightsConfirmed", "true");
    if (duration.current) fd.set("duration", String(duration.current));
    fd.set("audio", audio); if (cover) fd.set("cover", cover);
    try { await api("/songs", { method: "POST", form: fd }); toast("Track uploaded"); nav("/library?tab=uploads"); }
    catch (er) { setErr((er as Error).message); } finally { setBusy(false); }
  };
  return (
    <>
      <h1 className="h-page mb-1">Upload</h1>
      <p className="mb-6 text-mute">Share original music, or music you have the rights to distribute (your own work, licensed, or public domain).</p>
      <form onSubmit={submit} className="card max-w-xl space-y-4 p-5">
        <div><label className="label" htmlFor="audio">Audio file *</label>
          <label htmlFor="audio" className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line p-4 hover:border-accent"><UploadCloud className="text-mute" /><span className="text-sm">{audio ? audio.name : "Choose MP3, WAV, OGG, FLAC, M4A (max 30 MB)"}</span></label>
          <input id="audio" className="sr-only" type="file" accept="audio/*" onChange={(e) => pickAudio(e.target.files?.[0] || null)} /></div>
        <div><label className="label" htmlFor="name">Title *</label><input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={140} required /></div>
        <div><label className="label" htmlFor="genre">Genre *</label><input id="genre" className="field" value={genre} onChange={(e) => setGenre(e.target.value)} maxLength={40} required placeholder="Ambient, Electronic, Rock…" /></div>
        <div><label className="label" htmlFor="desc">Description</label><textarea id="desc" className="field" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={1000} /></div>
        <div><label className="label" htmlFor="cover">Cover image (optional, JPG/PNG/WebP, 5 MB)</label><input id="cover" className="text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0] || null; if (f && f.size > 5 * 1024 * 1024) { setErr("Cover is larger than 5 MB."); e.target.value = ""; } else setCover(f); }} /></div>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 accent-[rgb(var(--accent))]" checked={rights} onChange={(e) => setRights(e.target.checked)} />I own this recording or have the rights to distribute it on SoundBox.</label>
        {err && <p role="alert" className="text-sm text-danger">{err}</p>}
        <button className="btn-primary" disabled={busy || !audio || !name.trim() || !genre.trim() || !rights}>{busy ? "Uploading…" : "Upload track"}</button>
      </form>
    </>
  );
}
