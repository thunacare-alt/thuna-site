/* Cards & panels — ported from the Thuna Remotion scenes (GlassCard, EcgLine,
   PhoneMockup, RiskRing, Health-Profile checklist, vitals "& more" row, Home Lab
   tubes, Risk-Review bars, family phone screen, BP trend). Remotion imports
   swapped for the shim; delays are passed in from the hero composition. */
import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  noise2D,
  AbsoluteFill,
  drift,
  breathe,
} from "./shim";
import { PALETTE, SPRINGS, FONTS, GRADIENTS } from "./constants";

// ── GlassCard ─────────────────────────────────────────────────────────────────
export const GlassCard: React.FC<{
  label: string;
  value?: string;
  unit?: string;
  accent?: string;
  icon?: React.ReactNode;
  delay?: number;
  seed?: string;
  width?: number;
  floatAmp?: number;
  children?: React.ReactNode;
}> = ({ label, value, unit, accent = PALETTE.blue, icon, delay = 0, seed = label, width = 300, floatAmp = 1, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: SPRINGS.pop });
  const opacity = interpolate(enter, [0, 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(enter, [0, 1], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tilt = interpolate(enter, [0, 1], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const f = drift(seed, frame, 8 * floatAmp, 11 * floatAmp, 0.01);
  const br = breathe(frame, fps, 0.01, 0.2);
  return (
    <div style={{ opacity, transform: `translate(${f.x}px, ${f.y}px) perspective(1200px) rotateX(${tilt}deg) rotateY(${tilt * -0.4}deg) scale(${scale * br})`, transformStyle: "preserve-3d" }}>
      <div style={{ width, padding: "22px 26px", borderRadius: 26, background: GRADIENTS.glass, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1.5px solid ${PALETTE.glassBorder}`, boxShadow: `0 24px 60px ${PALETTE.glassShadow}, inset 0 1px 0 rgba(255,255,255,0.9)`, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: `${accent}22`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>{icon}</div>
          <div style={{ fontFamily: FONTS.body, fontSize: 15, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: PALETTE.textMuted }}>{label}</div>
        </div>
        {children ? (
          <div>{children}</div>
        ) : (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <div style={{ fontFamily: FONTS.heading, fontSize: 48, fontWeight: 900, letterSpacing: "-0.03em", color: PALETTE.text, lineHeight: 1 }}>{value}</div>
            {unit && <div style={{ fontFamily: FONTS.body, fontSize: 20, fontWeight: 600, color: accent }}>{unit}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

// ── EcgLine ───────────────────────────────────────────────────────────────────
const buildEcgPath = (w: number, cy: number, beats: number, amp: number): string => {
  const seg = w / beats;
  let d = `M 0 ${cy}`;
  for (let b = 0; b < beats; b++) {
    const x0 = b * seg;
    const p = (f: number) => x0 + seg * f;
    d += ` L ${p(0.12).toFixed(1)} ${cy}`;
    d += ` Q ${p(0.18).toFixed(1)} ${(cy - amp * 0.18).toFixed(1)} ${p(0.24).toFixed(1)} ${cy}`;
    d += ` L ${p(0.4).toFixed(1)} ${cy}`;
    d += ` L ${p(0.44).toFixed(1)} ${(cy + amp * 0.22).toFixed(1)}`;
    d += ` L ${p(0.48).toFixed(1)} ${(cy - amp).toFixed(1)}`;
    d += ` L ${p(0.52).toFixed(1)} ${(cy + amp * 0.4).toFixed(1)}`;
    d += ` L ${p(0.58).toFixed(1)} ${cy}`;
    d += ` Q ${p(0.7).toFixed(1)} ${(cy - amp * 0.32).toFixed(1)} ${p(0.82).toFixed(1)} ${cy}`;
    d += ` L ${p(1).toFixed(1)} ${cy}`;
  }
  return d;
};

export const EcgLine: React.FC<{
  width: number; height: number; color?: string; strokeWidth?: number;
  beats?: number; amp?: number; drawDelay?: number; drawDuration?: number; glow?: boolean;
}> = ({ width, height, color = PALETTE.blue, strokeWidth = 4, beats = 5, amp, drawDelay = 0, drawDuration = 70, glow = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cy = height / 2;
  const amplitude = amp ?? height * 0.32;
  const d = buildEcgPath(width, cy, beats, amplitude);
  const drawProg = spring({ frame: frame - drawDelay, fps, config: SPRINGS.cinematic, durationInFrames: drawDuration });
  const dashOffset = interpolate(drawProg, [0, 1], [1000, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drawn = drawProg > 0.98;
  const pulsePos = ((frame - drawDelay - drawDuration) * 0.9) % (width + 200);
  const breatheY = noise2D("ecg-breathe", frame * 0.01, 0) * 3;
  const gid = `ecg-glow-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible", transform: `translateY(${breatheY}px)` }}>
      <defs>
        {glow && (
          <filter id={gid} x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
        <linearGradient id="ecg-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="12%" stopColor={color} stopOpacity="1" />
          <stop offset="88%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#ecg-fade)" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" pathLength={1000} strokeDasharray={1000} strokeDashoffset={dashOffset} filter={glow ? `url(#${gid})` : undefined} />
      {drawn && <circle cx={pulsePos} cy={cy + breatheY} r={7} fill={color} opacity={0.9} filter={glow ? `url(#${gid})` : undefined} />}
    </svg>
  );
};

// ── PhoneMockup ───────────────────────────────────────────────────────────────
export const PhoneMockup: React.FC<{ children?: React.ReactNode; delay?: number; width?: number; idleAmp?: number; glassGlare?: boolean }> = ({ children, delay = 0, width = 360, idleAmp = 1, glassGlare = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const height = width * 2.06;
  const enter = spring({ frame: frame - delay, fps, config: SPRINGS.pop });
  const scale = interpolate(enter, [0, 1], [0.55, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = interpolate(enter, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const entryRotY = interpolate(enter, [0, 1], [-28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const entryRotX = interpolate(enter, [0, 1], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const idleRotY = noise2D("phone-ry", frame * 0.006, 0) * 6 * idleAmp;
  const idleRotX = noise2D("phone-rx", 0, frame * 0.006) * 4 * idleAmp;
  const floatY = Math.sin((frame / fps) * Math.PI * 0.7) * 10 * idleAmp;
  const glareX = interpolate(Math.sin((frame / fps) * Math.PI * 0.5), [-1, 1], [-40, 140]);
  return (
    <div style={{ opacity, transformStyle: "preserve-3d", transform: `translateY(${floatY}px) perspective(1400px) rotateX(${entryRotX + idleRotX}deg) rotateY(${entryRotY + idleRotY}deg) scale(${scale})` }}>
      <div style={{ width, height, borderRadius: 54, background: "linear-gradient(150deg, #2C3A4E 0%, #1B2734 60%, #11181F 100%)", padding: 12, boxShadow: `0 50px 90px rgba(40,60,90,0.4), inset 0 2px 3px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.4)`, position: "relative", transformStyle: "preserve-3d" }}>
        <div style={{ position: "absolute", left: -3, top: 150, width: 3, height: 70, borderRadius: 3, background: "#11181F" }} />
        <div style={{ position: "absolute", right: -3, top: 180, width: 3, height: 110, borderRadius: 3, background: "#11181F" }} />
        <div style={{ width: "100%", height: "100%", borderRadius: 44, overflow: "hidden", position: "relative", background: PALETTE.bgWarm }}>
          {children}
          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", width: 108, height: 30, borderRadius: 16, background: "#11181F", zIndex: 20 }} />
          {glassGlare && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${glareX - 18}%, rgba(255,255,255,0.28) ${glareX}%, transparent ${glareX + 18}%)`, pointerEvents: "none", zIndex: 30 }} />}
        </div>
      </div>
    </div>
  );
};

// ── RiskRing ──────────────────────────────────────────────────────────────────
export const RiskRing: React.FC<{ size?: number; target?: number; delay?: number; label?: string; suffix?: string }> = ({ size = 280, target = 86, delay = 0, label = "Wellness Index", suffix = "" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stroke = size * 0.085;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const fill = spring({ frame: frame - delay, fps, config: SPRINGS.cinematic, durationInFrames: 60 });
  const pct = interpolate(fill, [0, 1], [0, target], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dash = c * (1 - pct / 100);
  const count = spring({ frame: frame - delay, fps, config: SPRINGS.counter, durationInFrames: 60 });
  const shown = Math.round(interpolate(count, [0, 1], [0, target], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const glow = 0.5 + Math.sin((frame / fps) * Math.PI * 1.6) * 0.3;
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible" }}>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={PALETTE.blueDeep} /><stop offset="55%" stopColor={PALETTE.blue} /><stop offset="100%" stopColor={PALETTE.sky} />
          </linearGradient>
          <filter id="ring-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={4 + glow * 5} /></filter>
        </defs>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(21,101,216,0.14)" strokeWidth={stroke} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="url(#ring-grad)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={dash} opacity={0.5 * glow} filter="url(#ring-glow)" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="url(#ring-grad)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={dash} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONTS.heading, fontSize: size * 0.3, fontWeight: 900, letterSpacing: "-0.04em", color: PALETTE.text, lineHeight: 1 }}>{shown}{suffix}</div>
        <div style={{ fontFamily: FONTS.body, fontSize: size * 0.058, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: PALETTE.textMuted, marginTop: 8 }}>{label}</div>
      </div>
    </div>
  );
};

// ── vitals icons ──────────────────────────────────────────────────────────────
export const HeartIcon = (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 11 L7 11 L9 6 L13 17 L15 11 L21 11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
export const EcgIcon = (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M2 12 L6 12 L8 7 L11 17 L13 12 L16 12 L18 9 L20 12 L22 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
export const GlucoseIcon = (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3 C12 3 5 11 5 15 a7 7 0 0 0 14 0 C19 11 12 3 12 3 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /><path d="M9 15 h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>);

// ── "& more" secondary vitals row ─────────────────────────────────────────────
const SECONDARY = [
  { label: "SpO₂", value: "98%" },
  { label: "Temp", value: "98.4°F" },
  { label: "Pulse", value: "72" },
  { label: "Weight", value: "68 kg" },
];
export const SecondaryRow: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: SPRINGS.snap });
  const op = interpolate(p, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(p, [0, 1], [22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center", opacity: op, transform: `translateY(${y}px)` }}>
      {SECONDARY.map((c, i) => (
        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 16px", borderRadius: 15, background: GRADIENTS.glass, border: `1px solid ${PALETTE.glassBorder}`, boxShadow: `0 10px 24px ${PALETTE.glassShadow}` }}>
          <span style={{ width: 8, height: 8, borderRadius: 5, background: i % 2 ? PALETTE.blue : PALETTE.sky }} />
          <span style={{ fontFamily: FONTS.body, fontSize: 16, fontWeight: 600, color: PALETTE.textMuted }}>{c.label}</span>
          <span style={{ fontFamily: FONTS.heading, fontSize: 18, fontWeight: 800, color: PALETTE.text }}>{c.value}</span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 20px", borderRadius: 999, background: GRADIENTS.blue, boxShadow: `0 10px 24px rgba(21,101,216,0.32)` }}>
        <span style={{ fontFamily: FONTS.heading, fontSize: 18, fontWeight: 800, color: "#fff" }}>+ more</span>
      </div>
    </div>
  );
};

// ── Health Profile checklist ──────────────────────────────────────────────────
const QITEMS = ["Age & medical history", "Current medications", "Lifestyle & diet", "Family history", "Recent symptoms"];
const ChecklistRow: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: SPRINGS.snap });
  const op = interpolate(p, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(p, [0, 1], [26, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const check = spring({ frame: frame - delay - 6, fps, config: SPRINGS.pop });
  const checkScale = interpolate(check, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: op, transform: `translateX(${x}px)` }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: check > 0.1 ? GRADIENTS.blue : "rgba(21,101,216,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 22 22" style={{ transform: `scale(${checkScale})` }}><path d="M5 11 L9 15 L17 6" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <span style={{ fontFamily: FONTS.body, fontSize: 22, fontWeight: 600, color: PALETTE.text }}>{text}</span>
    </div>
  );
};
export const QuestionnairePanel: React.FC<{ width: number; seed?: string }> = ({ width, seed = "q" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 4, fps, config: SPRINGS.pop });
  const op = interpolate(enter, [0, 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sc = interpolate(enter, [0, 1], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const f = drift(seed, frame, 7, 9, 0.009);
  const br = breathe(frame, fps, 0.008, 0.2);
  return (
    <div style={{ opacity: op, transform: `translate(${f.x}px, ${f.y}px) scale(${sc * br})` }}>
      <div style={{ width, padding: "30px 36px", borderRadius: 30, background: GRADIENTS.glass, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1.5px solid ${PALETTE.glassBorder}`, boxShadow: `0 26px 64px ${PALETTE.glassShadow}, inset 0 1px 0 rgba(255,255,255,0.9)`, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 2 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(21,101,216,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="3" stroke={PALETTE.blue} strokeWidth="2" /><path d="M8 8 h8 M8 12 h8 M8 16 h5" stroke={PALETTE.blue} strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <span style={{ fontFamily: FONTS.heading, fontSize: 28, fontWeight: 800, color: PALETTE.text }}>Health Profile</span>
        </div>
        {QITEMS.map((t, i) => (<ChecklistRow key={t} text={t} delay={14 + i * 12} />))}
      </div>
    </div>
  );
};

// ── Home Lab Test ─────────────────────────────────────────────────────────────
const TESTS = [{ name: "Lipid Profile", fill: 0.82 }, { name: "HbA1c", fill: 0.66 }, { name: "Thyroid", fill: 0.74 }];
const TestTube: React.FC<{ name: string; fillTo: number; delay: number }> = ({ name, fillTo, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = spring({ frame: frame - delay, fps, config: SPRINGS.smooth, durationInFrames: 40 });
  const level = interpolate(f, [0, 1], [0, fillTo], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tubeH = 122; const tubeW = 42;
  const liq = level * (tubeH - 16);
  const slosh = Math.sin((frame / fps) * Math.PI * 1.6 + delay) * 1.6 * (f > 0.9 ? 1 : 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width={tubeW + 8} height={tubeH + 14} viewBox={`0 0 ${tubeW + 8} ${tubeH + 14}`}>
        <defs>
          <clipPath id={`tube-${name}`}><path d={`M4 6 L4 ${tubeH - 18} Q4 ${tubeH} ${4 + tubeW / 2} ${tubeH} Q${tubeW + 4} ${tubeH} ${tubeW + 4} ${tubeH - 18} L${tubeW + 4} 6 Z`} /></clipPath>
          <linearGradient id={`liq-${name}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={PALETTE.sky} /><stop offset="100%" stopColor={PALETTE.blue} /></linearGradient>
        </defs>
        <path d={`M4 6 L4 ${tubeH - 18} Q4 ${tubeH} ${4 + tubeW / 2} ${tubeH} Q${tubeW + 4} ${tubeH} ${tubeW + 4} ${tubeH - 18} L${tubeW + 4} 6`} fill="rgba(255,255,255,0.5)" stroke="rgba(21,101,216,0.35)" strokeWidth="2" />
        <g clipPath={`url(#tube-${name})`}>
          <rect x="2" y={tubeH - liq + slosh} width={tubeW + 4} height={liq + 20} fill={`url(#liq-${name})`} />
          <ellipse cx={4 + tubeW / 2} cy={tubeH - liq + slosh} rx={tubeW / 2} ry="4" fill={PALETTE.skySoft} opacity="0.8" />
        </g>
        <rect x="1" y="0" width={tubeW + 6} height="9" rx="3" fill="#2C3A4E" />
      </svg>
      <span style={{ fontFamily: FONTS.body, fontSize: 17, fontWeight: 700, color: PALETTE.text }}>{name}</span>
    </div>
  );
};
export const LabPanel: React.FC<{ width: number; seed?: string }> = ({ width, seed = "lab" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 4, fps, config: SPRINGS.pop });
  const op = interpolate(enter, [0, 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sc = interpolate(enter, [0, 1], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const f = drift(seed, frame, 7, 9, 0.009);
  const br = breathe(frame, fps, 0.008, 0.2);
  const badge = spring({ frame: frame - 70, fps, config: SPRINGS.elastic });
  const badgeOp = interpolate(badge, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeSc = interpolate(badge, [0, 1], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity: op, transform: `translate(${f.x}px, ${f.y}px) scale(${sc * br})` }}>
      <div style={{ width, padding: "28px 36px 26px", borderRadius: 30, background: GRADIENTS.glass, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1.5px solid ${PALETTE.glassBorder}`, boxShadow: `0 26px 64px ${PALETTE.glassShadow}, inset 0 1px 0 rgba(255,255,255,0.9)`, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(21,101,216,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M9 3 v6 L5 18 a2 2 0 0 0 2 3 h10 a2 2 0 0 0 2 -3 L15 9 V3" stroke={PALETTE.blue} strokeWidth="2" strokeLinejoin="round" /><path d="M8 3 h8" stroke={PALETTE.blue} strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <span style={{ fontFamily: FONTS.heading, fontSize: 28, fontWeight: 800, color: PALETTE.text }}>Home Lab Test</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
          {TESTS.map((t, i) => (<TestTube key={t.name} name={t.name} fillTo={t.fill} delay={14 + i * 12} />))}
        </div>
        <div style={{ opacity: badgeOp, transform: `scale(${badgeSc})`, alignSelf: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 22px", borderRadius: 999, background: GRADIENTS.blue, boxShadow: `0 12px 30px rgba(21,101,216,0.35)` }}>
            <svg width="20" height="20" viewBox="0 0 22 22"><path d="M5 11 L9 15 L17 6" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ fontFamily: FONTS.body, fontSize: 19, fontWeight: 700, color: "#fff" }}>Sample collected at home</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export const LabKitBox: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bob = Math.sin((frame / fps) * Math.PI * 0.7) * 3;
  return (
    <svg width="180" height="135" viewBox="0 0 200 150" style={{ transform: `translateY(${bob}px)`, overflow: "visible" }}>
      <defs><linearGradient id="kit" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#E4ECF5" /></linearGradient></defs>
      <ellipse cx="100" cy="140" rx="84" ry="12" fill="rgba(30,60,100,0.12)" />
      <rect x="26" y="44" width="148" height="92" rx="14" fill="url(#kit)" stroke="rgba(21,101,216,0.25)" strokeWidth="2" />
      <rect x="26" y="44" width="148" height="30" rx="14" fill={PALETTE.blue} opacity="0.9" />
      <g transform="translate(100 59)"><rect x="-5" y="-12" width="10" height="24" rx="2" fill="#fff" /><rect x="-12" y="-5" width="24" height="10" rx="2" fill="#fff" /></g>
      <rect x="44" y="86" width="14" height="40" rx="7" fill={PALETTE.skySoft} />
      <rect x="66" y="86" width="14" height="40" rx="7" fill={PALETTE.sky} />
      <rect x="120" y="86" width="36" height="40" rx="8" fill="rgba(21,101,216,0.10)" />
      <path d="M126 106 h24" stroke={PALETTE.blue} strokeWidth="2" strokeLinecap="round" />
      <path d="M126 116 h16" stroke={PALETTE.blue} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

// ── Risk Review bars (doctor's dashboard) ─────────────────────────────────────
const riskColor = (v: number) => (v >= 0.6 ? PALETTE.navy : v >= 0.45 ? PALETTE.blue : PALETTE.sky);
const DISEASES = [
  { name: "Cardiovascular", v: 0.72 }, { name: "Respiratory", v: 0.65 }, { name: "Hypertension", v: 0.58 },
  { name: "Bone Health", v: 0.55 }, { name: "Stroke", v: 0.48 }, { name: "Diabetes", v: 0.4 }, { name: "Liver", v: 0.35 },
];
const Bar: React.FC<{ name: string; v: number; delay: number }> = ({ name, v, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: SPRINGS.smooth });
  const w = interpolate(p, [0, 1], [0, v * 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const op = interpolate(p, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const color = riskColor(v);
  const shimmer = 0.85 + Math.sin((frame / fps) * Math.PI * 1.4 + delay) * 0.15;
  const shown = Math.round(interpolate(p, [0, 1], [0, v * 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: op }}>
      <div style={{ width: 150, textAlign: "right", fontFamily: FONTS.body, fontSize: 18, fontWeight: 600, color: PALETTE.text }}>{name}</div>
      <div style={{ flex: 1, height: 20, borderRadius: 10, background: "rgba(21,101,216,0.10)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, width: `${w}%`, borderRadius: 10, background: `linear-gradient(90deg, ${color}cc, ${color})`, boxShadow: `0 0 ${10 * shimmer}px ${color}88` }} />
      </div>
      <div style={{ width: 40, fontFamily: FONTS.heading, fontSize: 18, fontWeight: 800, color }}>{shown}</div>
    </div>
  );
};
export const RiskReviewPanel: React.FC<{ width: number }> = ({ width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 4, fps, config: SPRINGS.pop });
  const op = interpolate(enter, [0, 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sc = interpolate(enter, [0, 1], [0.84, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const f = drift("risk", frame, 6, 8, 0.008);
  const reviewed = spring({ frame: frame - 84, fps, config: SPRINGS.elastic });
  const revOp = interpolate(reviewed, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const revSc = interpolate(reviewed, [0, 1], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity: op, transform: `translate(${f.x}px, ${f.y}px) scale(${sc})` }}>
      <div style={{ width, padding: "28px 34px 30px", borderRadius: 30, background: GRADIENTS.glass, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1.5px solid ${PALETTE.glassBorder}`, boxShadow: `0 26px 64px ${PALETTE.glassShadow}, inset 0 1px 0 rgba(255,255,255,0.9)`, position: "relative" }}>
        <div style={{ fontFamily: FONTS.heading, fontSize: 30, fontWeight: 800, color: PALETTE.text }}>Risk Review</div>
        <div style={{ fontFamily: FONTS.body, fontSize: 16, color: PALETTE.textMuted, marginBottom: 20 }}>Scored by the Thuna engine · reviewed by an MD</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {DISEASES.map((d, i) => (<Bar key={d.name} name={d.name} v={d.v} delay={14 + i * 6} />))}
        </div>
        <div style={{ position: "absolute", right: 26, top: 24, opacity: revOp, transform: `scale(${revSc})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderRadius: 999, background: `linear-gradient(135deg, ${PALETTE.blue}, ${PALETTE.blueDeep})`, boxShadow: `0 16px 36px rgba(21,101,216,0.4)` }}>
            <svg width="22" height="22" viewBox="0 0 34 34"><circle cx="17" cy="17" r="16" fill="rgba(255,255,255,0.25)" /><path d="M10 17 L15 22 L24 11" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ fontFamily: FONTS.heading, fontSize: 20, fontWeight: 900, color: "#fff" }}>Reviewed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Family member phone screen ────────────────────────────────────────────────
type Member = { role: string; score: number; color: string; soft: string };
export const FAMILY: Member[] = [
  { role: "Father", score: 68, color: PALETTE.navy, soft: PALETTE.navySoft },
  { role: "Mother", score: 74, color: PALETTE.blue, soft: PALETTE.blueSoft },
  { role: "Daughter", score: 88, color: PALETTE.sky, soft: PALETTE.skySoft },
  { role: "Son", score: 92, color: PALETTE.sky, soft: PALETTE.skySoft },
];
export const MemberScreen: React.FC<{ m: Member; delay: number }> = ({ m, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = spring({ frame: frame - delay - 6, fps, config: SPRINGS.counter, durationInFrames: 40 });
  const shown = Math.round(interpolate(count, [0, 1], [0, m.score], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFFFFF 0%, ${PALETTE.bg} 100%)`, padding: "60px 24px 24px", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 84, height: 84, borderRadius: "50%", background: `linear-gradient(135deg, ${m.soft}, ${m.color})`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 14, boxShadow: `0 10px 24px ${m.color}55` }}>
        <svg width="50" height="50" viewBox="0 0 56 56"><circle cx="28" cy="20" r="13" fill="rgba(255,255,255,0.92)" /><path d="M8 52 Q8 34 28 34 Q48 34 48 52 Z" fill="rgba(255,255,255,0.92)" /></svg>
      </div>
      <div style={{ fontFamily: FONTS.heading, fontSize: 23, fontWeight: 800, color: PALETTE.text, marginTop: 16 }}>{m.role}</div>
      <div style={{ fontFamily: FONTS.heading, fontSize: 76, fontWeight: 900, letterSpacing: "-0.04em", color: m.color, lineHeight: 1, marginTop: 14 }}>{shown}</div>
      <div style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: PALETTE.textMuted, marginTop: 6 }}>Wellness Index</div>
      <div style={{ width: "82%", height: 10, borderRadius: 5, background: "rgba(21,101,216,0.12)", marginTop: 22, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${shown}%`, borderRadius: 5, background: `linear-gradient(90deg, ${m.soft}, ${m.color})` }} />
      </div>
    </AbsoluteFill>
  );
};

// ── BP trend (preventive — small change flagged early) ────────────────────────
const TREND = [120, 121, 119, 122, 124, 129, 125, 122];
const FLAG = 5; const VMIN = 112; const VMAX = 134;
const TrendChart: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const padX = 26; const padY = 22;
  const cw = w - padX * 2; const ch = h - padY * 2;
  const n = TREND.length;
  const xs = (i: number) => padX + (i / (n - 1)) * cw;
  const ys = (v: number) => padY + (1 - (v - VMIN) / (VMAX - VMIN)) * ch;
  const draw = spring({ frame: frame - 10, fps, config: SPRINGS.cinematic, durationInFrames: 60 });
  const pathLen = 1000;
  const dash = interpolate(draw, [0, 1], [pathLen, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let d = `M ${xs(0).toFixed(1)} ${ys(TREND[0]).toFixed(1)}`;
  for (let i = 1; i < n; i++) d += ` L ${xs(i).toFixed(1)} ${ys(TREND[i]).toFixed(1)}`;
  const flagOn = draw >= FLAG / (n - 1) + 0.05;
  const flagP = spring({ frame: frame - 10 - Math.round((FLAG / (n - 1)) * 60) - 6, fps, config: SPRINGS.pop });
  const pulse = (Math.sin((frame / fps) * Math.PI * 2.0) + 1) / 2;
  const pulseR = 10 + pulse * 14; const pulseOp = 0.5 * (1 - pulse);
  const fx = xs(FLAG); const fy = ys(TREND[FLAG]);
  const calloutScale = interpolate(flagP, [0, 1], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="trend-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={PALETTE.sky} /><stop offset="70%" stopColor={PALETTE.blue} /><stop offset="100%" stopColor={PALETTE.navy} /></linearGradient>
        <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(21,101,216,0.18)" /><stop offset="100%" stopColor="rgba(21,101,216,0)" /></linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (<line key={g} x1={padX} y1={padY + g * ch} x2={padX + cw} y2={padY + g * ch} stroke="rgba(21,101,216,0.08)" strokeWidth="1" />))}
      {TREND.map((_, i) => (<circle key={i} cx={xs(i)} cy={h - 6} r="3" fill="rgba(21,101,216,0.25)" />))}
      <path d={`${d} L ${xs(n - 1)} ${padY + ch} L ${xs(0)} ${padY + ch} Z`} fill="url(#trend-fill)" opacity={draw} />
      <path d={d} fill="none" stroke="url(#trend-grad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" pathLength={pathLen} strokeDasharray={pathLen} strokeDashoffset={dash} />
      {TREND.map((v, i) => { const reveal = draw >= i / (n - 1) - 0.02; if (!reveal) return null; const isFlag = i === FLAG; return <circle key={i} cx={xs(i)} cy={ys(v)} r={isFlag ? 0 : 4} fill={PALETTE.blue} />; })}
      {flagOn && (
        <g style={{ opacity: interpolate(flagP, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <circle cx={fx} cy={fy} r={pulseR} fill="none" stroke={PALETTE.blue} strokeWidth="2" opacity={pulseOp} />
          <circle cx={fx} cy={fy} r={9} fill={PALETTE.white} stroke={PALETTE.blue} strokeWidth="3.5" />
          <circle cx={fx} cy={fy} r={4} fill={PALETTE.blue} />
          <g style={{ transformOrigin: `${fx}px ${fy}px`, transform: `scale(${calloutScale})` }}>
            <line x1={fx} y1={fy - 12} x2={fx} y2={fy - 36} stroke={PALETTE.blue} strokeWidth="2" />
            <rect x={fx - 102} y={fy - 72} width="204" height="34" rx="17" fill={PALETTE.blue} />
            <text x={fx} y={fy - 50} textAnchor="middle" fill="#fff" style={{ fontFamily: FONTS.body, fontSize: 17, fontWeight: 700 }}>Change caught early</text>
          </g>
        </g>
      )}
    </svg>
  );
};
const MonthlyMotif: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 10 }}>
        {Array.from({ length: 12 }, (_, i) => {
          const p = spring({ frame: frame - 36 - i * 4, fps, config: SPRINGS.pop });
          const sc = interpolate(p, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (<div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: GRADIENTS.blue, transform: `scale(${sc})`, boxShadow: `0 0 8px ${PALETTE.sky}` }} />);
        })}
      </div>
      <span style={{ fontFamily: FONTS.body, fontSize: 19, fontWeight: 700, letterSpacing: "0.04em", color: PALETTE.textMuted }}>12 visits a year</span>
    </div>
  );
};
export const TrendPanel: React.FC<{ width: number }> = ({ width }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 2, fps, config: SPRINGS.pop });
  const op = interpolate(enter, [0, 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sc = interpolate(enter, [0, 1], [0.82, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const f = drift("prev", frame, 6, 8, 0.008);
  const br = breathe(frame, fps, 0.006, 0.18);
  const chartW = width - 72;
  return (
    <div style={{ opacity: op, transform: `translate(${f.x}px, ${f.y}px) scale(${sc * br})` }}>
      <div style={{ width, padding: "26px 36px 30px", borderRadius: 32, background: GRADIENTS.glass, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1.5px solid ${PALETTE.glassBorder}`, boxShadow: `0 26px 64px ${PALETTE.glassShadow}, inset 0 1px 0 rgba(255,255,255,0.9)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, alignSelf: "flex-start", padding: "7px 16px", borderRadius: 999, background: "rgba(21,101,216,0.10)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21 C12 21 4 14 4 8.5 A4.5 4.5 0 0 1 12 6 A4.5 4.5 0 0 1 20 8.5 C20 14 12 21 12 21 Z" stroke={PALETTE.blue} strokeWidth="2" strokeLinejoin="round" /><path d="M8 12 h2 l1.5 -3 l2 5 l1.5 -2 h2" stroke={PALETTE.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: PALETTE.blue }}>Preventive Care</span>
        </div>
        <div style={{ alignSelf: "flex-start", fontFamily: FONTS.heading, fontSize: 26, fontWeight: 800, color: PALETTE.text }}>Blood Pressure · monthly</div>
        <TrendChart w={chartW} h={210} />
        <MonthlyMotif />
      </div>
    </div>
  );
};
