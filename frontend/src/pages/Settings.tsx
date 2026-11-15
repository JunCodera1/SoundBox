import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/auth";
import { toast } from "@/stores/toast";
import { Link } from "react-router-dom";
import type { Me } from "@/lib/types";

export default function SettingsPage() {
  const { user, setUser } = useAuth(); const u = user!;
  const [bio, setBio] = useState(u.bio || ""), [genres, setGenres] = useState(u.favoriteGenres.join(", "));
  const [cur, setCur] = useState(""), [next, setNext] = useState("");
  const save = async (body: object) => { try { setUser((await api<{ user: Me }>("/auth/me", { method: "PATCH", body })).user); toast("Saved"); } catch (e) { toast((e as Error).message, "error"); } };
  return (
    <>
      <h1 className="h-page mb-1">Settings</h1>
      <p className="mb-6 text-mute">{u.username} · {u.email} · <Link className="underline" to={`/u/${u.id}`}>view public profile</Link></p>
      <div className="max-w-xl space-y-6">
        <section className="card space-y-4 p-5"><h2 className="h-section">Profile</h2>
          <div><label className="label" htmlFor="bio">Bio</label><textarea id="bio" className="field" rows={3} maxLength={280} value={bio} onChange={(e) => setBio(e.target.value)} /></div>
          <div><label className="label" htmlFor="g">Favorite genres (comma separated)</label><input id="g" className="field" value={genres} onChange={(e) => setGenres(e.target.value)} /></div>
          <button className="btn-primary" onClick={() => save({ bio, favoriteGenres: genres.split(",").map((g) => g.trim()).filter(Boolean).slice(0, 10) })}>Save profile</button></section>
        <section className="card space-y-3 p-5"><h2 className="h-section">Privacy</h2>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 accent-[rgb(var(--accent))]" checked={u.privacy.showActivity} onChange={(e) => save({ privacy: { showActivity: e.target.checked } })} />Show my recently played tracks on my public profile (off by default)</label>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 accent-[rgb(var(--accent))]" checked={u.privacy.showPlaylists} onChange={(e) => save({ privacy: { showPlaylists: e.target.checked } })} />Show my public playlists on my profile</label></section>
        <section className="card space-y-3 p-5"><h2 className="h-section">Change password</h2>
          <form className="space-y-3" onSubmit={async (e) => { e.preventDefault(); try { await api("/auth/password", { method: "POST", body: { current: cur, next } }); toast("Password changed"); setCur(""); setNext(""); } catch (er) { toast((er as Error).message, "error"); } }}>
            <input className="field" type="password" autoComplete="current-password" placeholder="Current password" aria-label="Current password" value={cur} onChange={(e) => setCur(e.target.value)} required />
            <input className="field" type="password" autoComplete="new-password" placeholder="New password (8+ chars, letter and digit)" aria-label="New password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
            <button className="btn-ghost">Update password</button></form></section>
      </div>
    </>
  );
}
