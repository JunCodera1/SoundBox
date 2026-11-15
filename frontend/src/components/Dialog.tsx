import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/** Native <dialog>: focus trap, Esc to close, and backdrop come from the platform. */
export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-label={title}>
      {open && (
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="h-section">{title}</h2><button className="icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button></div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function Confirm({ open, title, body, confirmLabel = "Delete", onConfirm, onClose }: { open: boolean; title: string; body: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="mb-5 text-sm text-mute">{body}</p>
      <div className="flex justify-end gap-2"><button className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button></div>
    </Dialog>
  );
}
