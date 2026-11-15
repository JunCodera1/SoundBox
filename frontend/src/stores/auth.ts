import { create } from "zustand";
import { api } from "@/lib/api";
import type { Me } from "@/lib/types";

interface AuthState {
  user: Me | null; checking: boolean;
  init: () => Promise<void>; login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>; logout: () => Promise<void>;
  setUser: (u: Me) => void; toggleLike: (songId: string) => Promise<boolean>;
}

/** Client auth state is a UX hint only; every request is re-authorised by the server (httpOnly cookie). */
export const useAuth = create<AuthState>((set, get) => ({
  user: null, checking: true,
  init: async () => {
    try { set({ user: (await api<{ user: Me }>("/auth/me")).user }); } catch { set({ user: null }); } finally { set({ checking: false }); }
  },
  login: async (email, password) => set({ user: (await api<{ user: Me }>("/auth/login", { method: "POST", body: { email, password } })).user }),
  signup: async (email, username, password) => set({ user: (await api<{ user: Me }>("/auth/signup", { method: "POST", body: { email, username, password } })).user }),
  logout: async () => { await api("/auth/logout", { method: "POST" }).catch(() => {}); set({ user: null }); },
  setUser: (user) => set({ user }),
  toggleLike: async (songId) => {
    const u = get().user; if (!u) return false;
    const liked = u.likedSongIds.includes(songId);
    // optimistic, rolled back on failure
    set({ user: { ...u, likedSongIds: liked ? u.likedSongIds.filter((i) => i !== songId) : [...u.likedSongIds, songId] } });
    try { await api(`/me/favorites/${songId}`, { method: liked ? "DELETE" : "PUT" }); return !liked; }
    catch (e) { set({ user: u }); throw e; }
  },
}));
if (typeof window !== "undefined") window.addEventListener("sb:unauthorized", () => { if (useAuth.getState().user) useAuth.setState({ user: null }); });
