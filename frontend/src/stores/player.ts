import { create } from "zustand";
import type { Song } from "@/lib/types";
import { api } from "@/lib/api";
import { useAuth } from "./auth";

/**
 * One audio engine for the whole app: a single HTMLAudioElement owned by this module
 * (outside React, so route changes / re-renders can never create a second one or stop playback).
 * The zustand store is the only source of truth for UI state.
 */
export type Repeat = "off" | "all" | "one";
interface PlayerState {
  queue: Song[]; index: number; playing: boolean; loading: boolean; error: string | null;
  currentTime: number; duration: number; volume: number; muted: boolean; repeat: Repeat; shuffle: boolean;
  sleepAt: number | null; expanded: boolean;
  current: () => Song | null;
  playQueue: (songs: Song[], start?: number) => void; playSong: (s: Song) => void;
  toggle: () => void; next: (auto?: boolean) => void; prev: () => void; seek: (t: number) => void;
  setVolume: (v: number) => void; toggleMute: () => void; cycleRepeat: () => void; toggleShuffle: () => void;
  addToQueue: (s: Song | Song[]) => void; playNext: (s: Song) => void; removeFromQueue: (i: number) => void;
  moveInQueue: (from: number, to: number) => void; clearQueue: () => void; jumpTo: (i: number) => void;
  setSleepTimer: (minutes: number | null) => void; setExpanded: (b: boolean) => void; retry: () => void;
}

const KEY = "sb.player.v1";
const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } })();

let audio: HTMLAudioElement | null = null;
let loadToken = 0;            // invalidates stale async work when tracks change quickly
let loadedId: string | null = null;
let countedFor: string | null = null;
let failStreak = 0;
let sleepTimeout: ReturnType<typeof setTimeout> | undefined;
let pendingSeek: number | null = typeof saved.currentTime === "number" ? saved.currentTime : null;

export const getAudio = () => audio;

export const usePlayer = create<PlayerState>((set, get) => {
  const A = () => {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = "metadata";
    audio.volume = get().volume; audio.muted = get().muted;
    bind(audio);
    return audio;
  };

  function bind(a: HTMLAudioElement) {
    a.addEventListener("loadedmetadata", () => {
      set({ duration: isFinite(a.duration) ? a.duration : get().current()?.duration ?? 0, loading: false });
      if (pendingSeek) { try { a.currentTime = pendingSeek; } catch { /* ignore */ } pendingSeek = null; }
    });
    a.addEventListener("timeupdate", () => {
      set({ currentTime: a.currentTime });
      const s = get().current();
      // Count a listen once the track has really been played for a while (and the user is signed in).
      if (s && countedFor !== s.id && a.currentTime > Math.min(10, (a.duration || 20) / 2)) {
        countedFor = s.id;
        if (useAuth.getState().user) api(`/songs/${s.id}/play`, { method: "POST" }).catch(() => {});
      }
    });
    a.addEventListener("playing", () => { failStreak = 0; set({ playing: true, loading: false, error: null }); });
    a.addEventListener("pause", () => set({ playing: false }));
    a.addEventListener("waiting", () => set({ loading: true }));
    a.addEventListener("canplay", () => set({ loading: false }));
    a.addEventListener("ended", () => get().next(true));
    a.addEventListener("error", () => {
      const s = get().current();
      if (!s || !a.src) return;
      set({ playing: false, loading: false, error: `Can't play “${s.name}” — the audio file is missing or unsupported.` });
      failStreak++;
      // Recover: skip forward, but never loop forever through a fully broken queue.
      if (get().queue.length > 1 && failStreak < get().queue.length) setTimeout(() => get().next(true), 600);
    });
    if ("mediaSession" in navigator) {
      const ms = navigator.mediaSession;
      ms.setActionHandler("play", () => get().toggle()); ms.setActionHandler("pause", () => get().toggle());
      ms.setActionHandler("nexttrack", () => get().next()); ms.setActionHandler("previoustrack", () => get().prev());
      ms.setActionHandler("seekto", (d) => d.seekTime != null && get().seek(d.seekTime));
    }
  }

  const persist = () => {
    const s = get();
    try { localStorage.setItem(KEY, JSON.stringify({ queue: s.queue, index: s.index, volume: s.volume, muted: s.muted, repeat: s.repeat, shuffle: s.shuffle, currentTime: s.currentTime })); } catch { /* storage unavailable */ }
  };
  let lastPersist = 0;
  const unsub = () => {
    usePlayer.subscribe((s, prev) => {
      const now = Date.now();
      if (s.queue !== prev.queue || s.index !== prev.index || s.volume !== prev.volume || s.repeat !== prev.repeat || s.shuffle !== prev.shuffle || s.muted !== prev.muted || now - lastPersist > 3000) { lastPersist = now; persist(); }
    });
  };
  queueMicrotask(unsub);

  /** Load (if needed) and start the song at the current index. Idempotent for repeated requests. */
  const start = async (resume = false) => {
    const s = get().current(); if (!s) return;
    const a = A(); const token = ++loadToken;
    if (loadedId !== s.id) {
      loadedId = s.id; countedFor = null;
      set({ loading: true, error: null, currentTime: 0, duration: s.duration || 0 });
      a.src = s.track; a.load();
      if ("mediaSession" in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: s.name, artist: s.artist?.username || "", album: s.genre, artwork: s.thumbnail ? [{ src: s.thumbnail }] : [] });
    } else if (!resume) { a.currentTime = 0; }
    try { await a.play(); }
    catch (e) {
      if (token !== loadToken) return; // superseded by a newer request; not an error
      const name = (e as Error).name;
      if (name === "AbortError") return;
      set({ playing: false, loading: false, error: name === "NotAllowedError" ? "Your browser blocked autoplay. Press play to start." : get().error || "Playback failed." });
    }
  };

  const pickNext = (dir: 1 | -1, auto: boolean): number | null => {
    const { queue, index, repeat, shuffle } = get();
    if (!queue.length) return null;
    if (auto && repeat === "one") return index;
    if (shuffle && queue.length > 1 && dir === 1) { let i; do { i = Math.floor(Math.random() * queue.length); } while (i === index); return i; }
    const n = index + dir;
    if (n >= 0 && n < queue.length) return n;
    return repeat === "all" || !auto ? (n + queue.length) % queue.length : null;
  };

  return {
    queue: Array.isArray(saved.queue) ? saved.queue : [], index: typeof saved.index === "number" ? saved.index : 0,
    playing: false, loading: false, error: null, currentTime: saved.currentTime || 0, duration: 0,
    volume: typeof saved.volume === "number" ? saved.volume : 0.8, muted: !!saved.muted,
    repeat: saved.repeat || "off", shuffle: !!saved.shuffle, sleepAt: null, expanded: false,
    current: () => get().queue[get().index] ?? null,

    playQueue: (songs, startAt = 0) => { if (!songs.length) return; failStreak = 0; set({ queue: songs, index: Math.min(startAt, songs.length - 1) }); pendingSeek = null; void start(); },
    playSong: (song) => get().playQueue([song], 0),
    toggle: () => {
      const a = A(), s = get().current(); if (!s) return;
      if (loadedId !== s.id || !a.src) { void start(true); return; }
      if (a.paused) { void a.play().catch((e) => set({ error: e.name === "NotAllowedError" ? "Your browser blocked autoplay. Press play to start." : "Playback failed." })); }
      else a.pause();
    },
    next: (auto = false) => {
      const i = pickNext(1, auto);
      if (i === null) { if (audio) { audio.pause(); audio.currentTime = 0; } set({ playing: false }); return; }
      set({ index: i }); void start();
    },
    prev: () => {
      const a = A();
      if (a.currentTime > 3) { a.currentTime = 0; return; }
      const i = pickNext(-1, false); if (i === null) return; set({ index: i }); void start();
    },
    seek: (t) => { const a = A(); if (isFinite(t)) { a.currentTime = Math.max(0, Math.min(t, a.duration || t)); set({ currentTime: a.currentTime }); } },
    setVolume: (v) => { const vol = Math.max(0, Math.min(1, v)); A().volume = vol; set({ volume: vol, muted: false }); A().muted = false; },
    toggleMute: () => { const m = !get().muted; A().muted = m; set({ muted: m }); },
    cycleRepeat: () => set({ repeat: ({ off: "all", all: "one", one: "off" } as const)[get().repeat] }),
    toggleShuffle: () => set({ shuffle: !get().shuffle }),

    addToQueue: (s) => { const add = Array.isArray(s) ? s : [s]; const empty = !get().queue.length; set({ queue: [...get().queue, ...add] }); if (empty) { set({ index: 0 }); } },
    playNext: (s) => { const q = [...get().queue]; if (!q.length) { set({ queue: [s], index: 0 }); return; } q.splice(get().index + 1, 0, s); set({ queue: q }); },
    removeFromQueue: (i) => {
      const { queue, index } = get(); if (i < 0 || i >= queue.length) return;
      const q = queue.filter((_, k) => k !== i);
      if (i === index) {
        if (!q.length) { audio?.pause(); loadedId = null; if (audio) audio.removeAttribute("src"); set({ queue: q, index: 0, playing: false, currentTime: 0, duration: 0 }); return; }
        const wasPlaying = get().playing; set({ queue: q, index: Math.min(index, q.length - 1) }); if (wasPlaying) void start();
      } else set({ queue: q, index: i < index ? index - 1 : index });
    },
    moveInQueue: (from, to) => {
      const { queue, index } = get(); if (from === to || to < 0 || to >= queue.length) return;
      const q = [...queue]; const [m] = q.splice(from, 1); q.splice(to, 0, m);
      let idx = index; if (from === index) idx = to; else if (from < index && to >= index) idx--; else if (from > index && to <= index) idx++;
      set({ queue: q, index: idx });
    },
    clearQueue: () => { const cur = get().current(); if (get().playing && cur) set({ queue: [cur], index: 0 }); else { audio?.pause(); loadedId = null; if (audio) audio.removeAttribute("src"); set({ queue: [], index: 0, playing: false, currentTime: 0, duration: 0 }); } },
    jumpTo: (i) => { set({ index: i }); void start(); },
    retry: () => { failStreak = 0; loadedId = null; void start(); },
    setSleepTimer: (min) => {
      clearTimeout(sleepTimeout);
      if (!min) { set({ sleepAt: null }); return; }
      set({ sleepAt: Date.now() + min * 60_000 });
      sleepTimeout = setTimeout(() => { audio?.pause(); set({ sleepAt: null }); }, min * 60_000);
    },
    setExpanded: (expanded) => set({ expanded }),
  };
});

/** Test hook: lets unit tests substitute an audio double. */
export const __setAudioForTests = (a: HTMLAudioElement | null) => { audio = a; loadedId = null; };
