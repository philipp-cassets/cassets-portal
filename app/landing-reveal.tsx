"use client";

import { useEffect } from "react";

/**
 * Cursor-spring reveal from the design prototype: a radial mask follows the
 * cursor with spring physics ({ stiffness: 200, damping: 25 }), growing to
 * --reveal-radius on enter and collapsing on leave. Attached to the two hero
 * glyph clusters and the strategy allocation bar. Renders nothing.
 */
export function LandingReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // hover glow is decorative; skip the motion entirely
    }

    const cleanups: Array<() => void> = [];

    function attachReveal(wrap: HTMLElement | null) {
      if (!wrap) return;
      const overlay = wrap.querySelector<HTMLElement>(".overlay");
      if (!overlay) return;
      let x = 0;
      let y = 0;
      let radius = 0;
      let velocity = 0;
      let target = 0;
      let raf: number | null = null;

      function maxRadius() {
        const v = getComputedStyle(wrap as HTMLElement).getPropertyValue(
          "--reveal-radius"
        );
        return parseFloat(v) || 175;
      }
      function tick() {
        const dt = 1 / 60;
        const stiffness = 200;
        const damping = 25;
        const accel = stiffness * (target - radius) - damping * velocity;
        velocity += accel * dt;
        radius += velocity * dt;
        if (radius < 0) {
          radius = 0;
          velocity = 0;
        }
        const mask =
          "radial-gradient(circle " +
          radius.toFixed(1) +
          "px at " +
          x +
          "px " +
          y +
          "px, black 0%, black 40%, transparent 100%)";
        overlay!.style.webkitMaskImage = mask;
        overlay!.style.maskImage = mask;
        if (Math.abs(target - radius) > 0.1 || Math.abs(velocity) > 0.1) {
          raf = requestAnimationFrame(tick);
        } else {
          radius = target;
          velocity = 0;
          raf = null;
        }
      }
      function kick() {
        if (raf === null) raf = requestAnimationFrame(tick);
      }

      const onEnter = () => {
        target = maxRadius();
        kick();
      };
      const onLeave = () => {
        target = 0;
        kick();
      };
      const onMove = (e: MouseEvent) => {
        const r = wrap!.getBoundingClientRect();
        const scale = r.width / (wrap as HTMLElement).offsetWidth || 1;
        x = Math.round((e.clientX - r.left) / scale);
        y = Math.round((e.clientY - r.top) / scale);
        kick();
      };

      wrap.addEventListener("mouseenter", onEnter);
      wrap.addEventListener("mouseleave", onLeave);
      wrap.addEventListener("mousemove", onMove);
      cleanups.push(() => {
        wrap.removeEventListener("mouseenter", onEnter);
        wrap.removeEventListener("mouseleave", onLeave);
        wrap.removeEventListener("mousemove", onMove);
        if (raf !== null) cancelAnimationFrame(raf);
      });
    }

    attachReveal(document.getElementById("cluster-left"));
    attachReveal(document.getElementById("cluster-right"));
    attachReveal(document.getElementById("alloc"));

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
