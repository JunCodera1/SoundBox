import { beforeEach, describe, expect, it, vi } from "vitest";

// A controllable audio double: one instance only (the engine must never create a second one).
const instances: FakeAudio[] = [];
class FakeAudio extends EventTarget {
  src = ""; currentTime = 0; duration = 100; volume = 1; muted = false; paused = true; preload = "";
  constructor() { super(); instances.push(this); }
  load() {} removeAttribute() { this.src = ""; }
  play() { this.paused = false; queueMicrotask(() => this.dispatchEvent(new Event("playing"))); return Promise.resolve(); }
  pause() { this.paused = true; this.dispatchEvent(new Event("pause")); }
}
vi.stubGlobal("Audio", FakeAudio);
vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response("{}"))));

const song = (id: string) => ({ id, name: id, thumbnail: "", track: `/media/${id}.wav`, genre: "Ambient", likes: 0, plays: 0, artist: null });
const flush = () => new Promise((r) => setTimeout(r, 0));
let usePlayer: typeof import("@/stores/player").usePlayer;

beforeEach(async () => {
  localStorage.clear(); vi.resetModules(); instances.length = 0;
  usePlayer = (await import("@/stores/player")).usePlayer;
});

describe("player store", () => {
  it("plays a queue, advances, and never creates more than one audio element", async () => {
    const p = usePlayer.getState();
    p.playQueue([song("a"), song("b"), song("c")], 0); await flush();
    expect(usePlayer.getState().playing).toBe(true);
    usePlayer.getState().next(); usePlayer.getState().next(); await flush();
    expect(usePlayer.getState().current()?.id).toBe("c");
    expect(instances).toHaveLength(1);
    expect(instances[0].src).toContain("c.wav");
  });
  it("pause/resume toggles the same element", async () => {
    usePlayer.getState().playQueue([song("a")]); await flush();
    usePlayer.getState().toggle(); expect(usePlayer.getState().playing).toBe(false);
    usePlayer.getState().toggle(); await flush(); expect(usePlayer.getState().playing).toBe(true);
  });
  it("repeat modes: end of queue stops with 'off', wraps with 'all', repeats with 'one'", async () => {
    usePlayer.getState().playQueue([song("a"), song("b")], 1); await flush();
    instances[0].dispatchEvent(new Event("ended")); await flush();
    expect(usePlayer.getState().playing).toBe(false); expect(usePlayer.getState().current()?.id).toBe("b");
    usePlayer.setState({ repeat: "all" }); instances[0].dispatchEvent(new Event("ended")); await flush();
    expect(usePlayer.getState().current()?.id).toBe("a");
    usePlayer.setState({ repeat: "one" }); instances[0].dispatchEvent(new Event("ended")); await flush();
    expect(usePlayer.getState().current()?.id).toBe("a");
  });
  it("queue ops: play next, add, move, remove keep the current index correct", async () => {
    const p = () => usePlayer.getState();
    p().playQueue([song("a"), song("b"), song("c")], 1); await flush();
    p().playNext(song("x")); expect(p().queue.map((s) => s.id)).toEqual(["a", "b", "x", "c"]);
    p().addToQueue(song("y")); expect(p().queue).toHaveLength(5);
    p().moveInQueue(0, 3); expect(p().queue.map((s) => s.id)).toEqual(["b", "x", "c", "a", "y"]); expect(p().current()?.id).toBe("b");
    p().removeFromQueue(0); await flush(); expect(p().queue).toHaveLength(4);
    p().clearQueue(); expect(p().queue).toHaveLength(1); // keeps what's playing
  });
  it("a failing source surfaces an error and skips ahead (but not forever)", async () => {
    vi.useFakeTimers();
    usePlayer.getState().playQueue([song("a"), song("b")], 0); await vi.advanceTimersByTimeAsync(0);
    instances[0].dispatchEvent(new Event("error"));
    expect(usePlayer.getState().error).toMatch(/Can't play/);
    await vi.advanceTimersByTimeAsync(700);
    expect(usePlayer.getState().current()?.id).toBe("b");
    vi.useRealTimers();
  });
  it("blocked autoplay is reported as a friendly message, not a crash", async () => {
    usePlayer.getState().playQueue([song("a")]); await flush();
    instances[0].play = () => Promise.reject(Object.assign(new Error("x"), { name: "NotAllowedError" }));
    instances[0].pause(); usePlayer.getState().toggle(); await flush();
    expect(usePlayer.getState().error).toMatch(/autoplay/i);
  });
  it("persists queue and volume, restoring paused", async () => {
    usePlayer.getState().playQueue([song("a"), song("b")], 1); usePlayer.getState().setVolume(0.3); await flush();
    await new Promise((r) => setTimeout(r, 10));
    vi.resetModules(); const again = (await import("@/stores/player")).usePlayer.getState();
    expect(again.queue).toHaveLength(2); expect(again.index).toBe(1); expect(again.volume).toBeCloseTo(0.3); expect(again.playing).toBe(false);
  });
  it("sleep timer pauses playback", async () => {
    vi.useFakeTimers();
    usePlayer.getState().playQueue([song("a")]); await vi.advanceTimersByTimeAsync(0);
    usePlayer.getState().setSleepTimer(15); await vi.advanceTimersByTimeAsync(15 * 60_000 + 10);
    expect(usePlayer.getState().playing).toBe(false); expect(usePlayer.getState().sleepAt).toBeNull();
    vi.useRealTimers();
  });
});
