export const fmtTime = (s?: number) => {
  if (s === undefined || !isFinite(s) || s < 0) return "–:––";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};
export const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
export const hash = (str: string) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
