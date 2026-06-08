/**
 * Tiny Remotion-compatibility shim.
 *
 * The hero reuses the Thuna Remotion scene components (Companion, ElderlyParent,
 * GlassCard, EcgLine, …) almost verbatim. Those call Remotion's frame clock and
 * helpers. Here we re-implement just enough — useCurrentFrame / useVideoConfig /
 * interpolate / spring / noise2D — so the same components render in the browser,
 * driven by a *cursor-scrubbed* frame instead of Remotion's render clock.
 */
import React, { createContext, useContext } from "react";

// ── frame context ────────────────────────────────────────────────────────────
type FrameCtx = { frame: number; fps: number; width: number; height: number };
const Ctx = createContext<FrameCtx>({ frame: 0, fps: 30, width: 1920, height: 1080 });

export const FrameProvider: React.FC<{ value: FrameCtx; children: React.ReactNode }> = ({
  value,
  children,
}) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;

export const useCurrentFrame = (): number => useContext(Ctx).frame;
export const useVideoConfig = (): FrameCtx => useContext(Ctx);

// ── AbsoluteFill ─────────────────────────────────────────────────────────────
export const AbsoluteFill: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  style,
  children,
  ...rest
}) => (
  <div
    {...rest}
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      ...style,
    }}
  >
    {children}
  </div>
);

// ── interpolate (port of Remotion's, multi-point + clamp/extend) ──────────────
type Extrapolate = "extend" | "clamp" | "identity";
type InterpOpts = {
  extrapolateLeft?: Extrapolate;
  extrapolateRight?: Extrapolate;
  easing?: (t: number) => number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function interpolate(
  input: number,
  inputRange: number[],
  outputRange: number[],
  opts: InterpOpts = {}
): number {
  const { extrapolateLeft = "extend", extrapolateRight = "extend", easing } = opts;

  // find the segment
  let i = 0;
  for (; i < inputRange.length - 1; i++) {
    if (input <= inputRange[i + 1]) break;
  }
  i = Math.min(i, inputRange.length - 2);

  const inMin = inputRange[i];
  const inMax = inputRange[i + 1];
  const outMin = outputRange[i];
  const outMax = outputRange[i + 1];

  let t = inMax === inMin ? 0 : (input - inMin) / (inMax - inMin);

  if (t < 0) {
    if (extrapolateLeft === "clamp") t = 0;
    else if (extrapolateLeft === "identity") return input;
  }
  if (t > 1) {
    if (extrapolateRight === "clamp") t = 1;
    else if (extrapolateRight === "identity") return input;
  }

  if (easing) t = easing(t);
  return lerp(outMin, outMax, t);
}

// ── spring (analytic 2nd-order step response — overshoot from damping ratio) ──
type SpringConfig = { damping?: number; stiffness?: number; mass?: number };
export function spring({
  frame,
  fps = 30,
  config = {},
  durationInFrames,
  from = 0,
  to = 1,
  delay = 0,
}: {
  frame: number;
  fps?: number;
  config?: SpringConfig;
  durationInFrames?: number;
  from?: number;
  to?: number;
  delay?: number;
}): number {
  const damping = config.damping ?? 10;
  const stiffness = config.stiffness ?? 100;
  const mass = config.mass ?? 1;

  const f = frame - delay;
  if (f <= 0) return from;

  // settle window in frames
  const D =
    durationInFrames ??
    Math.max(12, Math.min(90, Math.round(fps * 1.4 * Math.sqrt(mass / (stiffness / 100)))));

  const t = f / D; // 0 → 1 across the settle window
  if (t >= 1.6) return to;

  // damping ratio ζ (clamp to underdamped/critical band)
  const zeta = Math.min(0.999, damping / (2 * Math.sqrt(stiffness * mass)));
  const tau = t * 5; // by t=1, ~5 time-constants → settled
  const wd = Math.sqrt(1 - zeta * zeta);
  const x = 1 - Math.exp(-zeta * tau) * (Math.cos(wd * tau) + (zeta / wd) * Math.sin(wd * tau));
  return from + (to - from) * x;
}

// ── noise2D (smooth deterministic pseudo-noise, ~[-1,1]) ──────────────────────
const hash01 = (str: string): number => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
};

export function noise2D(seed: string, x: number, y: number): number {
  const s = hash01(seed);
  const a = Math.sin(x * 1.0 + s * 6.2831) * 0.62 + Math.sin(x * 2.3 + s * 12.566) * 0.38;
  const b = Math.sin(y * 1.0 + s * 3.1415) * 0.62 + Math.sin(y * 1.7 + s * 9.424) * 0.38;
  return (a + b) * 0.5;
}

// ── motion helpers (port of lib/motion.ts) ────────────────────────────────────
export const drift = (
  seed: string,
  frame: number,
  ampX = 14,
  ampY = 10,
  speed = 0.012
): { x: number; y: number } => ({
  x: noise2D(`${seed}-x`, frame * speed, 0) * ampX,
  y: noise2D(`${seed}-y`, 0, frame * speed) * ampY,
});

export const breathe = (frame: number, fps: number, amount = 0.012, hz = 0.18): number =>
  1 + Math.sin((frame / fps) * Math.PI * 2 * hz) * amount;
