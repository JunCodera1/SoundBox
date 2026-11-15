export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
type Opts = { method?: string; body?: unknown; form?: FormData; signal?: AbortSignal };

/** Single entry point for server calls: cookies for auth, uniform errors. */
export async function api<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(opts.body); }
  let res: Response;
  try {
    res = await fetch("/api" + path, { method: opts.method || "GET", headers, body, credentials: "include", signal: opts.signal });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError(0, "Can't reach the SoundBox server. Check your connection.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) window.dispatchEvent(new Event("sb:unauthorized"));
    throw new ApiError(res.status, data.error || `Request failed (${res.status})`);
  }
  return data as T;
}
