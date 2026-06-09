"use client";

import { useEffect, useState } from "react";
import EyeFollower, { type EyeShape, type FloatAnimation } from "./EyeFollower";

// ── Shape configuration ───────────────────────────────────────────────
//
// Four friendly characters arranged like the original CareerCompass art:
// two tall rounded bars in the back, two dome-shaped blobs in front.
//
// Brand palette used:
//   blue   #0ea5e9
//   purple #6366f1
//   orange #f97316
//   cyan   #22d3ee

interface ShapeConfig {
  id: string;
  color: string;
  width: number;
  height: number;
  position: { x: number; y: number };
  shape: EyeShape;
  eyeSpacing: number;
  eyeTop: number;
  eyeSize: number;
  pupilSize: number;
  floatAnimation: FloatAnimation;
  floatDelay: number;
  zIndex: number;
}

const SHAPES: ShapeConfig[] = [
  // Tall purple bar (back-left)
  {
    id: "purple-bar",
    color: "#6366f1",
    width: 96,
    height: 220,
    position: { x: 36, y: 38 },
    shape: "rounded",
    eyeSpacing: 30,
    eyeTop: 28,
    eyeSize: 16,
    pupilSize: 7,
    floatAnimation: "slow",
    floatDelay: 0,
    zIndex: 1,
  },
  // Tall cyan bar (slightly in front of the purple)
  {
    id: "cyan-bar",
    color: "#0ea5e9",
    width: 70,
    height: 160,
    position: { x: 50, y: 50 },
    shape: "rounded",
    eyeSpacing: 22,
    eyeTop: 24,
    eyeSize: 13,
    pupilSize: 6,
    floatAnimation: "medium",
    floatDelay: 0.6,
    zIndex: 2,
  },
  // Orange dome (front-bottom)
  {
    id: "orange-dome",
    color: "#f97316",
    width: 150,
    height: 110,
    position: { x: 22, y: 76 },
    shape: "ellipse",
    eyeSpacing: 28,
    eyeTop: 30,
    eyeSize: 14,
    pupilSize: 6,
    floatAnimation: "medium",
    floatDelay: 1.2,
    zIndex: 3,
  },
  // Cyan dome (front-bottom-right)
  {
    id: "cyan-dome",
    color: "#22d3ee",
    width: 130,
    height: 95,
    position: { x: 58, y: 80 },
    shape: "ellipse",
    eyeSpacing: 26,
    eyeTop: 26,
    eyeSize: 13,
    pupilSize: 6,
    floatAnimation: "fast",
    floatDelay: 1.8,
    zIndex: 3,
  },
];

// ── Component ─────────────────────────────────────────────────────────

export default function AuthArt() {
  // Track the mouse position in viewport coordinates. `null` means the
  // cursor hasn't entered the page yet, so pupils rest at centre.
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null,
  );

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 25%, #1e293b 0%, #0f172a 65%, #0b1120 100%)",
      }}
      aria-hidden="true"
    >
      {/* ── Decorative stars / particles ─────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.6) 0%, transparent 50%)," +
            "radial-gradient(1px 1px at 82% 12%, rgba(255,255,255,0.4) 0%, transparent 50%)," +
            "radial-gradient(1px 1px at 65% 78%, rgba(255,255,255,0.4) 0%, transparent 50%)," +
            "radial-gradient(1px 1px at 25% 92%, rgba(255,255,255,0.5) 0%, transparent 50%)," +
            "radial-gradient(1px 1px at 92% 60%, rgba(255,255,255,0.3) 0%, transparent 50%)," +
            "radial-gradient(1px 1px at 8% 55%, rgba(255,255,255,0.3) 0%, transparent 50%)",
        }}
      />

      {/* ── Soft ambient glows ───────────────────────────────── */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "rgba(99, 102, 241, 0.18)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-10 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "rgba(14, 165, 233, 0.16)" }}
      />
      <div
        className="pointer-events-none absolute left-1/3 top-1/2 h-60 w-60 rounded-full blur-3xl"
        style={{ background: "rgba(249, 115, 22, 0.10)" }}
      />

      {/* ── Character shapes ─────────────────────────────────── */}
      {SHAPES.map((s) => (
        <EyeFollower
          key={s.id}
          color={s.color}
          width={s.width}
          height={s.height}
          position={s.position}
          shape={s.shape}
          mousePos={mousePos}
          eyeSpacing={s.eyeSpacing}
          eyeTop={s.eyeTop}
          eyeSize={s.eyeSize}
          pupilSize={s.pupilSize}
          floatAnimation={s.floatAnimation}
          floatDelay={s.floatDelay}
          zIndex={s.zIndex}
        />
      ))}

      {/* ── Caption (lower-left corner) ───────────────────────── */}
      <div className="absolute bottom-6 left-6 right-6 z-10 text-white/70">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
          tripla
        </p>
        <p className="mt-1 text-sm leading-snug text-white/60 sm:text-base">
          Plan smarter.
          <br />
          Travel better.
        </p>
      </div>
    </div>
  );
}
