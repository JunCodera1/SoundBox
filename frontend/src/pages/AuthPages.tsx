import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/stores/auth";

function Shell({ title, children, foot }: { title: string; children: React.ReactNode; foot: React.ReactNode }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-4">
      <div className="w-full max-w-sm"><Link to="/" className="mb-8 flex justify-center"><Logo size={34} /></Link>
        <div className="card p-6"><h1 className="h-section mb-4 text-2xl">{title}</h1>{children}</div><p className="mt-4 text-center text-sm text-mute">{foot}</p></div>
    </div>
  );
}

export function LoginPage() {
  const { user, login } = useAuth(); const nav = useNavigate(); const loc = useLocation() as any;
  const [email, setEmail] = useState(""), [pw, setPw] = useState(""), [err, setErr] = useState<string | null>(null), [busy, setBusy] = useState(false);
  if (user) return <Navigate to={loc.state?.from || "/"} replace />;
  return (
    <Shell title="Sign in" foot={<>New here? <Link className="text-accent underline" to="/signup">Create an account</Link></>}>
      <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setErr(null); try { await login(email, pw); nav(loc.state?.from || "/", { replace: true }); } catch (er) { setErr((er as Error).message); } finally { setBusy(false); } }}>
        <div><label className="label" htmlFor="email">Email</label><input id="email" className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div><label className="label" htmlFor="pw">Password</label><input id="pw" className="field" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
        {err && <p role="alert" className="text-sm text-danger">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </Shell>
  );
}

export function SignupPage() {
  const { user, signup } = useAuth(); const nav = useNavigate();
  const [email, setEmail] = useState(""), [username, setU] = useState(""), [pw, setPw] = useState(""), [err, setErr] = useState<string | null>(null), [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  return (
    <Shell title="Create your account" foot={<>Already have one? <Link className="text-accent underline" to="/login">Sign in</Link></>}>
      <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setErr(null); try { await signup(email, username, pw); nav("/", { replace: true }); } catch (er) { setErr((er as Error).message); } finally { setBusy(false); } }}>
        <div><label className="label" htmlFor="email">Email</label><input id="email" className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div><label className="label" htmlFor="un">Username</label><input id="un" className="field" autoComplete="username" value={username} onChange={(e) => setU(e.target.value)} minLength={3} maxLength={30} pattern="[\w.\-]+" title="Letters, numbers, dot, underscore, hyphen" required /></div>
        <div><label className="label" htmlFor="pw">Password</label><input id="pw" className="field" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} required /><p className="mt-1 text-xs text-mute">At least 8 characters with a letter and a digit.</p></div>
        {err && <p role="alert" className="text-sm text-danger">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
      </form>
    </Shell>
  );
}
