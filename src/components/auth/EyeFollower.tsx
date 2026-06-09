"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// ── Types ─────────────────────────────────────────────────────────────

export type EyeShape = "rounded" | "pill" | "ellipse";
export type FloatAnimation = "slow" | "medium" | "fast";

interface EyeFollowerProps {
  /** Shape fill color (any CSS color). */
  color: string;
  /** Shape width in pixels. */
  width: number;
  /** Shape height in pixels. */
  height: number;
  /** Initial position as a percentage of the parent's content box (0-100). */
  position: { x: number; y: number };
  /** Shape variant. */
  shape?: EyeShape;
  /** Live mouse position in viewport coordinates; `null` parks pupils in the centre. */
  mousePos: { x: number; y: number } | null;
  /** Horizontal gap between the two eyes (px). */
  eyeSpacing?: number;
  /** Vertical offset of the eyes from the top of the shape (px). */
  eyeTop?: number;
  /** Diameter of the white sclera (px). */
  eyeSize?: number;
  /** Diameter of the black pupil (px). */
  pupilSize?: number;
  /** Maximum pupil translation (px). */
  pupilMaxOffset?: number;
  /** Float animation tempo. */
  floatAnimation?: FloatAnimation;
  /** Float animation delay (seconds) so siblings don't bob in sync. */
  floatDelay?: number;
  /** Z-index for stacking when shapes overlap. */
  zIndex?: number;
}

// ── Constants ─────────────────────────────────────────────────────────

const FLOAT_CLASS: Record<FloatAnimation, string> = {
  slow: "animate-float-slow",
  medium: "animate-float-medium",
  fast: "animate-float-fast",
};

/** Convert the shape kind to a CSS border-radius. */
function getBorderRadius(shape: EyeShape, width: number, height: number): string {
  if (shape === "ellipse") return "50%";
  if (shape === "pill") return `${Math.min(width, height) / 2}px`;
  // 'rounded' — gently rounded rectangle (~22% of the smaller side)
  return `${Math.min(width, height) * 0.22}px`;
}

// ── Component ─────────────────────────────────────────────────────────

export default function EyeFollower({
  color,
  width,
  height,
  position,
  shape = "rounded",
  mousePos,
  eyeSpacing = 22,
  eyeTop = 28,
  eyeSize = 14,
  pupilSize = 6,
  pupilMaxOffset = 6,
  floatAnimation = "slow",
  floatDelay = 0,
  zIndex = 1,
}: EyeFollowerProps) {
  // Refs to each eye and its pupil — mutated directly to avoid re-renders.
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const leftPupilRef = useRef<HTMLDivElement>(null);
  const rightPupilRef = useRef<HTMLDivElement>(null);

  // Independent blink toggles for each eye.
  const [leftBlink, setLeftBlink] = useState(false);
  const [rightBlink, setRightBlink] = useState(false);

  // ── Pupil tracking ──────────────────────────────────────────────────
  useEffect(() => {
    const applyOffset = (
      eyeEl: HTMLDivElement | null,
      pupilEl: HTMLDivElement | null,
    ) => {
      if (!eyeEl || !pupilEl) return;

      if (!mousePos) {
        pupilEl.style.transform = "translate(0px, 0px)";
        return;
      }

      const rect = eyeEl.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = mousePos.x - eyeCenterX;
      const dy = mousePos.y - eyeCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Soft falloff so distant mice still nudge the pupil.
      const FALLOFF_PX = 600;
      const scale = Math.min(distance, FALLOFF_PX) / FALLOFF_PX;
      const offset = scale * pupilMaxOffset;
      const x = Math.cos(angle) * offset;
      const y = Math.sin(angle) * offset;

      pupilEl.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    };

    applyOffset(leftEyeRef.current, leftPupilRef.current);
    applyOffset(rightEyeRef.current, rightPupilRef.current);
  }, [mousePos, pupilMaxOffset]);

  // ── Independent blink timers ───────────────────────────────────────
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (setter: (v: boolean) => void) => {
      const fire = () => {
        setter(true);
        timers.push(setTimeout(() => setter(false), 170));
        // Next blink in 3-7 seconds.
        timers.push(setTimeout(fire, 3000 + Math.random() * 4000));
      };
      // Stagger the first blink so the four shapes don't blink together.
      timers.push(setTimeout(fire, 1500 + Math.random() * 4000));
    };

    schedule(setLeftBlink);
    schedule(setRightBlink);

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  // ── Outer positioning wrapper — keeps the float animation transform
  //    from clashing with the `translate(-50%, -50%)` centering rule.
  const wrapperStyle: CSSProperties = {
    position: "absolute",
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: `${width}px`,
    height: `${height}px`,
    transform: "translate(-50%, -50%)",
    zIndex,
  };

  const shapeStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    background: color,
    borderRadius: getBorderRadius(shape, width, height),
    animationDelay: `${floatDelay}s`,
    position: "relative",
  };

  const eyesRowStyle: CSSProperties = {
    position: "absolute",
    top: `${eyeTop}px`,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: `${eyeSpacing}px`,
  };

  return (
    <div style={wrapperStyle} aria-hidden="true">
      <div className={FLOAT_CLASS[floatAnimation]} style={shapeStyle}>
        <div style={eyesRowStyle}>
          <Eye
            eyeRef={leftEyeRef}
            pupilRef={leftPupilRef}
            eyeSize={eyeSize}
            pupilSize={pupilSize}
            blinking={leftBlink}
          />
          <Eye
            eyeRef={rightEyeRef}
            pupilRef={rightPupilRef}
            eyeSize={eyeSize}
            pupilSize={pupilSize}
            blinking={rightBlink}
          />
        </div>
      </div>
    </div>
  );
}

// ── Sub-component: single eye + pupil ──────────────────────────────────

interface EyeProps {
  eyeRef: React.RefObject<HTMLDivElement | null>;
  pupilRef: React.RefObject<HTMLDivElement | null>;
  eyeSize: number;
  pupilSize: number;
  blinking: boolean;
}

function Eye({ eyeRef, pupilRef, eyeSize, pupilSize, blinking }: EyeProps) {
  return (
    <div
      ref={eyeRef}
      className={[
        "relative grid place-items-center rounded-full bg-white",
        blinking ? "animate-eye-blink overflow-hidden" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: `${eyeSize}px`, height: `${eyeSize}px` }}
    >
      <div
        ref={pupilRef}
        className="rounded-full bg-slate-900"
        style={{
          width: `${pupilSize}px`,
          height: `${pupilSize}px`,
          // Initial transform is the rest position; the eye-tracking effect
          // overwrites this string with the live translate(...) every frame.
          transform: "translate(0px, 0px)",
        }}
      />
    </div>
  );
}
