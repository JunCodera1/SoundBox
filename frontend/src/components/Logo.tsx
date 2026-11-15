export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" className="fill-accent" /><g className="fill-[rgb(var(--accent-ink))]"><rect x="6" y="13" width="3.5" height="6" rx="1.7" /><rect x="11.5" y="8" width="3.5" height="16" rx="1.7" /><rect x="17" y="11" width="3.5" height="10" rx="1.7" /><rect x="22.5" y="5" width="3.5" height="22" rx="1.7" /></g></svg>
      SoundBox
    </span>
  );
}
