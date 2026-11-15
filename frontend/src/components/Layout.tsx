import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { Home, Search, Library, Sparkles, Upload, Settings, LogOut, LogIn, Shield, Sun, Moon } from "lucide-react";
import { Logo } from "./Logo";
import { PlayerBar } from "./Player";
import { Toasts } from "./Toasts";
import { useAuth } from "@/stores/auth";
import { usePlayer } from "@/stores/player";

const NAV = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Library", icon: Library },
  { to: "/assistant", label: "Mix Maker", icon: Sparkles },
  { to: "/upload", label: "Upload", icon: Upload },
];

function useShortcuts() {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !(t as HTMLInputElement).type?.match(/range/) || t.isContentEditable) return;
      const p = usePlayer.getState();
      if (e.target instanceof HTMLButtonElement && e.code === "Space") return; // let focused buttons activate normally
      switch (e.key) {
        case " ": e.preventDefault(); p.toggle(); break;
        case "ArrowRight": if (e.shiftKey) p.next(); else if (!(t as HTMLInputElement).type) p.seek(p.currentTime + 5); break;
        case "ArrowLeft": if (e.shiftKey) p.prev(); else if (!(t as HTMLInputElement).type) p.seek(p.currentTime - 5); break;
        case "m": case "M": p.toggleMute(); break;
        case "s": case "S": p.toggleShuffle(); break;
        case "r": case "R": p.cycleRepeat(); break;
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
}

export function Layout() {
  useShortcuts();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("sb.theme") || "dark"; } catch { return "dark"; } });
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem("sb.theme", theme); } catch { /* ignore */ } }, [theme]);
  const items = user?.isAdmin ? [...NAV, { to: "/admin", label: "Admin", icon: Shield }] : NAV;

  return (
    <div className="flex h-full flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[70] focus:rounded focus:bg-accent focus:px-3 focus:py-1 focus:text-accent-ink">Skip to content</a>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface p-4 md:flex" aria-label="Sidebar">
          <Link to="/" className="mb-6 px-2"><Logo /></Link>
          <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
            {items.map(({ to, label, icon: I, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-raised text-accent" : "text-mute hover:bg-raised hover:text-ink"}`}><I size={19} />{label}</NavLink>
            ))}
          </nav>
          <div className="space-y-1 border-t border-line pt-3">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-mute hover:bg-raised hover:text-ink" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}{theme === "dark" ? "Light theme" : "Dark theme"}</button>
            {user ? (<>
              <NavLink to="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-raised"><Settings size={18} className="text-mute" /><span className="truncate">{user.username}</span></NavLink>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-mute hover:bg-raised hover:text-ink" onClick={async () => { await logout(); nav("/"); }}><LogOut size={18} />Log out</button>
            </>) : (
              <Link to="/login" className="btn-primary w-full"><LogIn size={16} />Sign in</Link>
            )}
          </div>
        </aside>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 pb-8 pt-5 md:px-8 md:pt-8"><Outlet /></div>
        </main>
      </div>
      <div className="relative z-20 shrink-0"><PlayerBar /></div>
      <nav aria-label="Mobile" className="z-20 grid shrink-0 grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        {[...NAV.slice(0, 4), user ? { to: "/settings", label: "You", icon: Settings } : { to: "/login", label: "Sign in", icon: LogIn }].map(({ to, label, icon: I }) => (
          <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? "text-accent" : "text-mute"}`}><I size={20} />{label}</NavLink>
        ))}
      </nav>
      <Toasts />
    </div>
  );
}
