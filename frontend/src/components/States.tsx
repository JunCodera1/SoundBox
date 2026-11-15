import type { ReactNode } from "react";
import { AlertTriangle, Music2 } from "lucide-react";

export const Loading = ({ label = "Loading" }: { label?: string }) => (
  <div role="status" aria-live="polite" className="flex items-center gap-3 py-10 text-mute"><span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />{label}…</div>
);
export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div role="alert" className="card flex items-start gap-3 p-5"><AlertTriangle className="mt-0.5 text-danger" size={18} /><div className="flex-1"><p className="text-sm">{message}</p>{onRetry && <button className="btn-ghost mt-3" onClick={onRetry}>Try again</button>}</div></div>
);
export const Empty = ({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line px-6 py-12 text-center"><Music2 className="text-mute" size={28} /><p className="font-medium">{title}</p>{hint && <p className="max-w-sm text-sm text-mute">{hint}</p>}{action}</div>
);
