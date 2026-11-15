import { create } from "zustand";
interface Toast { id: number; text: string; kind: "ok" | "error" }
export const useToast = create<{ items: Toast[]; push: (t: string, k?: Toast["kind"]) => void; dismiss: (id: number) => void }>((set) => ({
  items: [],
  push: (text, kind = "ok") => {
    const id = Date.now() + Math.random();
    set((s) => ({ items: [...s.items.slice(-3), { id, text, kind }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 4000);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));
export const toast = (t: string, k?: "ok" | "error") => useToast.getState().push(t, k);
