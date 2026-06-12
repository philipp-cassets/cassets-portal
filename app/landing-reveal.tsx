"use client";

import { useEffect } from "react";

/**
 * Green reveal from the design prototypes: a radial mask follows the pointer
 * with spring physics ({ stiffness: 200, damping: 25 }).
 *
 * Two attachment modes, matching the two handoff files:
 *  - hover (desktop, "cNEAR Landing - Glass Light.html"): mouseenter grows
 *    the mask to --reveal-radius, mouseleave collapses it. Hero clusters and
 *    the allocation bar.
 *  - press (mobile, "cNEAR Mobile.html"): pointerdown grows it to 130px, the
 *    finger drags it around, release/cancel collapses it. The mobile hero
 *    stage and, for touch pointers only, the allocation bar.
 *
 * Renders nothing.
 */

const STIFFNESS = 200;
const DAMPING = 25;
const PRESS_RADIUS = 130; // from the mobile prototype's useReveal

type Spring = {
  setPoint: (clientX: number, clientY: number) => void;
  setTarget: (t: number) => void;
  kick: () => void;
  destroy: () => void;
};

function createSpring(wrap: HTMLElement, overlay: HTMLElement): Spring {
  let x = 0;
  let y = 0;
  let radius = 0;
  let velocity = 0;
  let target = 0;
  let raf: number | null = null;

  function tick() {
    const dt = 1 / 60;
    const accel = STIFFNESS * (target - radius) - DAMPING * velocity;
    velocity += accel * dt;
    radius += velocity * dt;
    if (radius < 0) {
      radius = 0;
      velocity = 0;
    }
    // Safari: never paint the overlay with a degenerate (near-zero) radial
    // mask - WebKit's handling of zero-size gradients diverges from Chrome
    // and can flash the layer (incl. its drop-shadow) as a bare rectangle.
    // Below threshold the overlay is fully invisible instead.
    if (radius < 0.75) {
      overlay.style.opacity = "0";
    } else {
      overlay.style.opacity = "1";
      const mask =
        "radial-gradient(circle " +
        radius.toFixed(1) +
        "px at " +
        x +
        "px " +
        y +
        "px, black 0%, black 40%, transparent 100%)";
      overlay.style.webkitMaskImage = mask;
      overlay.style.maskImage = mask;
    }
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

  return {
    setPoint(clientX, clientY) {
      const r = wrap.getBoundingClientRect();
      const scale = r.width / wrap.offsetWidth || 1;
      x = Math.round((clientX - r.left) / scale);
      y = Math.round((clientY - r.top) / scale);
    },
    setTarget(t) {
      target = t;
      kick();
    },
    kick,
    destroy() {
      if (raf !== null) cancelAnimationFrame(raf);
    },
  };
}

export function LandingReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // the glow is decorative; skip the motion entirely
    }

    const cleanups: Array<() => void> = [];

    function overlayOf(wrap: HTMLElement) {
      return wrap.querySelector<HTMLElement>(".overlay");
    }

    /** Desktop hover reveal (unchanged behaviour from the Glass Light page). */
    function attachReveal(wrap: HTMLElement | null) {
      if (!wrap) return;
      const overlay = overlayOf(wrap);
      if (!overlay) return;
      const spring = createSpring(wrap, overlay);

      function maxRadius() {
        const v = getComputedStyle(wrap as HTMLElement).getPropertyValue(
          "--reveal-radius"
        );
        return parseFloat(v) || 175;
      }
      const onEnter = () => spring.setTarget(maxRadius());
      const onLeave = () => spring.setTarget(0);
      const onMove = (e: MouseEvent) => {
        spring.setPoint(e.clientX, e.clientY);
        spring.kick();
      };

      wrap.addEventListener("mouseenter", onEnter);
      wrap.addEventListener("mouseleave", onLeave);
      wrap.addEventListener("mousemove", onMove);
      cleanups.push(() => {
        wrap.removeEventListener("mouseenter", onEnter);
        wrap.removeEventListener("mouseleave", onLeave);
        wrap.removeEventListener("mousemove", onMove);
        spring.destroy();
      });
    }

    /**
     * Mobile press reveal from the prototype: open on pointerdown, follow
     * while held, collapse on release. `includeMouse: false` keeps it from
     * fighting the hover handlers where both are attached (allocation bar).
     */
    function attachPressReveal(
      wrap: HTMLElement | null,
      includeMouse: boolean
    ) {
      if (!wrap) return;
      const overlay = overlayOf(wrap);
      if (!overlay) return;
      const spring = createSpring(wrap, overlay);
      let held = false;

      const skip = (e: PointerEvent) =>
        !includeMouse && e.pointerType === "mouse";
      const onDown = (e: PointerEvent) => {
        if (skip(e)) return;
        held = true;
        spring.setPoint(e.clientX, e.clientY);
        spring.setTarget(PRESS_RADIUS);
      };
      const onMove = (e: PointerEvent) => {
        if (skip(e) || !held) return;
        spring.setPoint(e.clientX, e.clientY);
        spring.kick();
      };
      const onUp = (e: PointerEvent) => {
        if (skip(e)) return;
        held = false;
        spring.setTarget(0);
      };

      wrap.addEventListener("pointerdown", onDown);
      wrap.addEventListener("pointermove", onMove);
      wrap.addEventListener("pointerup", onUp);
      wrap.addEventListener("pointercancel", onUp);
      wrap.addEventListener("pointerleave", onUp);
      cleanups.push(() => {
        wrap.removeEventListener("pointerdown", onDown);
        wrap.removeEventListener("pointermove", onMove);
        wrap.removeEventListener("pointerup", onUp);
        wrap.removeEventListener("pointercancel", onUp);
        wrap.removeEventListener("pointerleave", onUp);
        spring.destroy();
      });
    }

    attachReveal(document.getElementById("cluster-left"));
    attachReveal(document.getElementById("cluster-right"));
    attachReveal(document.getElementById("alloc"));
    attachPressReveal(document.getElementById("m-stage"), true);
    attachPressReveal(document.getElementById("alloc"), false);

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
