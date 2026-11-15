import { hash } from "@/lib/format";
import { useState } from "react";

const PALETTES = [["#ffb454", "#5b2a86"], ["#5eead4", "#1e3a5f"], ["#f472b6", "#3b1d4a"], ["#a3e635", "#14532d"], ["#fb923c", "#7c2d12"], ["#60a5fa", "#312e81"], ["#fcd34d", "#4a1d1d"], ["#c4b5fd", "#1f2937"]];

/** Artwork: uses the uploaded cover, otherwise a deterministic generated cover (never a broken image). */
export function Cover({ src, seed, className = "", rounded = "rounded-lg" }: { src?: string; seed: string; className?: string; rounded?: string }) {
  const [broken, setBroken] = useState(false);
  if (src && !broken) return <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} className={`aspect-square object-cover ${rounded} ${className}`} />;
  const h = hash(seed), [a, b] = PALETTES[h % PALETTES.length];
  const bars = Array.from({ length: 5 }, (_, i) => 20 + ((h >>> (i * 3)) % 60));
  return (
    <svg viewBox="0 0 100 100" role="img" aria-hidden="true" className={`aspect-square ${rounded} ${className}`} preserveAspectRatio="xMidYMid slice">
      <rect width="100" height="100" fill={b} />
      <circle cx={20 + (h % 60)} cy={20 + ((h >>> 4) % 40)} r="38" fill={a} opacity=".22" />
      {bars.map((v, i) => <rect key={i} x={14 + i * 16} y={50 - v / 2} width="9" height={v} rx="4.5" fill={a} />)}
    </svg>
  );
}
