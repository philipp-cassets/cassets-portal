"use client";
import { useEffect, useRef } from "react";

// Live demo embedded in the hero card. The portal lays out at desktop width
// (1900 logical px) inside an iframe scaled to the card via a measured
// transform. CSS `zoom` proved unreliable inside the iframe, so the parent
// owns the scaling.
const LOGICAL_W = 1900;
const LOGICAL_H = Math.round(LOGICAL_W / 1.63);

export function DashEmbed() {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const f = frame.current;
    if (!el || !f) return;
    const apply = () => {
      const s = el.clientWidth / LOGICAL_W;
      f.style.transform = `scale(${s})`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrap} className="dash-embed">
      <iframe
        ref={frame}
        src="/demo?embed=1"
        title="cNEAR investor portal demonstration (fictitious data)"
        loading="lazy"
        width={LOGICAL_W}
        height={LOGICAL_H}
      />
    </div>
  );
}
