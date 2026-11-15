import { useCallback, useEffect, useRef, useState } from "react";

/** Minimal data hook: loading/error/data/reload, ignores stale responses. */
export function useAsync<T>(fn: (signal: AbortSignal) => Promise<T>, deps: unknown[]) {
  const [state, set] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true });
  const run = useRef(0);
  const load = useCallback(() => {
    const id = ++run.current, ac = new AbortController();
    set((s) => ({ ...s, loading: true, error: undefined }));
    fn(ac.signal).then((data) => id === run.current && set({ data, loading: false }), (e) => { if (e?.name !== "AbortError" && id === run.current) set((s) => ({ ...s, error: e.message || "Something went wrong", loading: false })); });
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => load(), [load]);
  return { ...state, reload: load, setData: (d: T) => set((s) => ({ ...s, data: d })) };
}
