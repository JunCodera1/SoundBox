import { useToast } from "@/stores/toast";
export function Toasts() {
  const { items, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {items.map((t) => (
        <button key={t.id} onClick={() => dismiss(t.id)} role={t.kind === "error" ? "alert" : "status"} className={`pointer-events-auto rounded-full border px-4 py-2 text-sm shadow-lg ${t.kind === "error" ? "border-danger/40 bg-surface text-danger" : "border-line bg-raised text-ink"}`}>{t.text}</button>
      ))}
    </div>
  );
}
