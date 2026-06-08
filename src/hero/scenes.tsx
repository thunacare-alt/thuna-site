/* Shared Thuna scene art — the 7 monthly-visit beats, reused by both the
   cursor-scrubbed hero and the scroll-pinned story flow. Each beat composes the
   ported Remotion visuals, driven by a scrub-reversible frame. */
import React from "react";
import { FrameProvider } from "./shim";
import { PALETTE } from "./constants";
import { Companion, ElderlyParent, Doctor, PersonWithPhone } from "./figures";
import {
  GlassCard, EcgLine, PhoneMockup, RiskRing,
  HeartIcon, EcgIcon, GlucoseIcon, SecondaryRow,
  QuestionnairePanel, LabPanel, LabKitBox, RiskReviewPanel,
  MemberScreen, FAMILY, TrendPanel,
} from "./cards";

export const BASE_W = 1180;
export const BASE_H = 660;
export const SCENE_FRAMES = 150;
export const N = 7;
export const SPACING = 1 / (N - 1);
const WIN = SPACING * 0.9;

export const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export type Beat = { key: string; tag: string; caption: string; em: string; title: string; time: string; body: string };
export const BEATS: Beat[] = [
  { key: "arrive", tag: "Arrives", caption: "A Thuna companion visits your home", em: "— every month.",
    title: "A companion arrives", time: "Monthly · at home",
    body: "Background-checked, ID-verified, trained in our six-week home-care protocol — the same familiar faces every month, not a different stranger each time." },
  { key: "ask", tag: "Asks", caption: "It starts with a few", em: "simple questions.",
    title: "A few simple questions", time: "First 5 minutes",
    body: "A short profile: how you've been, sleep, diet, anything new since last visit. The context that numbers alone can never show." },
  { key: "vitals", tag: "Measures", caption: "Then the vitals that matter —", em: "BP, ECG, glucose & more.",
    title: "Vitals at the dining table", time: "~15 minutes",
    body: "Blood pressure, ECG, blood glucose, SpO₂, temperature, pulse and weight — recorded into your family's record and explained as we go." },
  { key: "lab", tag: "Home labs", caption: "Lab tests, arranged at home", em: "when they're needed.",
    title: "Labs at home, only when needed", time: "When a trend flags",
    body: "If something is drifting, a registered Nursing Assistant draws bloods at home — the right test, from an NABL-accredited partner lab. Never a fixed calendar." },
  { key: "doctor", tag: "MD review", caption: "A doctor reviews", em: "every single reading.",
    title: "An MD reviews every reading", time: "Same day",
    body: "Each reading lands beside your last eleven. An MD reviews the trend virtually the same day and flags anything drifting — before symptoms appear." },
  { key: "family", tag: "Family", caption: "Your whole family follows along —", em: "wherever they are.",
    title: "The whole family follows along", time: "Within the hour",
    body: "A plain-language summary lands in the app and on WhatsApp. Everyone stays in the loop — no jargon, no panic, just continuity." },
  { key: "prevent", tag: "Prevention", caption: "Small changes, caught early —", em: "before they become an emergency.",
    title: "Small changes, caught early", time: "Every month",
    body: "Drift is caught months before it becomes an emergency — what an annual checkup, by design, never could." },
];

// ── scene compositions (BASE_W × BASE_H canvas space) ──────────────────────────
const HomeFigures: React.FC<{ bp?: number; spo2?: number; glucose?: number }> = ({ bp = 0, spo2 = 0, glucose = 0 }) => (
  <>
    <div style={{ position: "absolute", left: 30, bottom: -8 }}>
      <ElderlyParent height={398} bp={bp} spo2={spo2} glucose={glucose} />
    </div>
    <div style={{ position: "absolute", left: 338, bottom: 2 }}>
      <Companion height={356} />
    </div>
  </>
);

// cinematic white+blue ambient with just a hint of morning warmth
const ambientGlow = {
  position: "absolute" as const, inset: 0,
  background:
    "radial-gradient(38% 48% at 22% 16%, rgba(255,241,214,0.34), transparent 70%)," +
    "radial-gradient(64% 60% at 82% -4%, rgba(37,99,235,0.08), transparent 70%)",
};

const BeatContent: React.FC<{ index: number; local: number }> = ({ index, local }) => {
  switch (index) {
    case 0:
      return (
        <>
          <div style={ambientGlow} />
          <div style={{ position: "absolute", left: 90, top: 60, width: 360, height: 560, borderRadius: "18px 18px 0 0", background: "linear-gradient(180deg, rgba(235,243,255,0.7), rgba(255,255,255,0))", border: "1px solid rgba(37,99,235,0.08)" }} />
          <div style={{ position: "absolute", right: 120, top: 120, display: "flex", alignItems: "center", gap: 12, padding: "14px 22px", borderRadius: 999, background: "rgba(255,255,255,0.86)", border: `1px solid ${PALETTE.glassBorder}`, boxShadow: `0 16px 40px ${PALETTE.glassShadow}` }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: PALETTE.blue }} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontSize: 22, fontWeight: 700, color: PALETTE.text }}>Monthly home visit</span>
          </div>
          <HomeFigures />
        </>
      );
    case 1:
      return (
        <>
          <div style={ambientGlow} />
          <HomeFigures />
          <div style={{ position: "absolute", right: 56, top: 90 }}><QuestionnairePanel width={470} /></div>
        </>
      );
    case 2: {
      const bp = clamp(local * 1.25);
      const spo2 = clamp((local - 0.45) * 2);
      const glucose = clamp((local - 0.6) * 2.2);
      return (
        <>
          <div style={ambientGlow} />
          <HomeFigures bp={bp} spo2={spo2} glucose={glucose} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 26, display: "flex", justifyContent: "center", gap: 18 }}>
            <GlassCard label="Blood Pressure" value="128/82" unit="mmHg" accent={PALETTE.blue} icon={HeartIcon} delay={6} seed="bp" width={250} />
            <GlassCard label="ECG" accent={PALETTE.sky} icon={EcgIcon} delay={20} seed="ecg" width={234}>
              <div style={{ marginTop: 2 }}>
                <EcgLine width={186} height={54} color={PALETTE.blue} strokeWidth={3} beats={3} drawDelay={24} drawDuration={30} glow={false} />
                <div style={{ fontFamily: '"Inter",sans-serif', fontSize: 17, fontWeight: 700, color: PALETTE.blue, marginTop: 2 }}>72 bpm · Normal</div>
              </div>
            </GlassCard>
            <GlassCard label="Glucose" value="110" unit="mg/dL" accent={PALETTE.blue} icon={GlucoseIcon} delay={34} seed="glucose" width={250} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 212, display: "flex", justifyContent: "center" }}>
            <SecondaryRow delay={46} />
          </div>
        </>
      );
    }
    case 3:
      return (
        <>
          <div style={ambientGlow} />
          <HomeFigures />
          <div style={{ position: "absolute", left: 250, bottom: 30 }}><LabKitBox /></div>
          <div style={{ position: "absolute", right: 56, top: 70 }}><LabPanel width={486} /></div>
        </>
      );
    case 4:
      return (
        <>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(37,99,235,0.08) 0%, rgba(255,255,255,0) 60%)" }} />
          <div style={{ position: "absolute", left: 90, top: 150, width: 240, height: 360, borderRadius: 24, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(37,99,235,0.10)" }} />
          <div style={{ position: "absolute", left: 70, bottom: -30 }}><Doctor height={500} /></div>
          <div style={{ position: "absolute", right: 50, top: 0, bottom: 0, display: "flex", alignItems: "center" }}><RiskReviewPanel width={560} /></div>
        </>
      );
    case 5: {
      const slots = [
        { x: -300, y: -40, s: 0.92, d: 4, r: -7 },
        { x: 0, y: -86, s: 1.0, d: 16, r: 0 },
        { x: 300, y: -40, s: 0.92, d: 28, r: 7 },
      ];
      return (
        <>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 60% at 60% 30%, rgba(37,99,235,0.07), transparent 70%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {slots.map((s, i) => (
              <div key={i} style={{ position: "absolute", transform: `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg) scale(${s.s})` }}>
                <PhoneMockup width={156} delay={s.d} idleAmp={1.1}><MemberScreen m={FAMILY[i]} delay={s.d} /></PhoneMockup>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 70, bottom: -10 }}><PersonWithPhone height={360} /></div>
          <div style={{ position: "absolute", left: "54%", bottom: 70, transform: "translateX(-50%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 28px", borderRadius: 999, background: `linear-gradient(135deg, ${PALETTE.blue}, ${PALETTE.blueDeep})`, boxShadow: `0 22px 50px rgba(37,99,235,0.45)` }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 26 26"><path d="M4 6 h18 v12 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 Z" fill="none" stroke="#fff" strokeWidth="2.2" /><path d="M4 7 L13 14 L22 7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ fontFamily: '"Inter",sans-serif', fontSize: 24, fontWeight: 800, color: "#fff" }}>Your report is ready</span>
            </div>
          </div>
        </>
      );
    }
    case 6:
      return (
        <>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 60% at 50% 24%, rgba(37,99,235,0.07), transparent 70%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
            <RiskRing size={206} target={86} delay={6} label="Wellness" />
            <TrendPanel width={620} />
          </div>
        </>
      );
    default:
      return null;
  }
};

/** The crossfading beat layers for a given 0..1 journey progress. Drop inside a
 *  scaled BASE_W×BASE_H canvas wrapper. Only the 1–2 nearest beats mount. */
export const BeatScenes: React.FC<{ progress: number; travel?: number }> = ({ progress, travel = 64 }) => {
  const p = progress;
  return (
    <>
      {BEATS.map((b, i) => {
        const c = i * SPACING;
        const dist = (p - c) / SPACING;
        const ad = Math.abs(dist);
        if (ad > 1.04) return null;
        const vis = 1 - smoothstep(0, 1, Math.min(ad, 1));
        const local = clamp((p - (c - WIN)) / WIN);
        const frame = easeInOut(local) * SCENE_FRAMES;
        return (
          <div key={b.key} aria-hidden="true" style={{
            position: "absolute", inset: 0, opacity: vis,
            transform: `translateX(${dist * travel}px) scale(${0.97 + vis * 0.03})`,
            pointerEvents: "none", willChange: "transform, opacity",
          }}>
            <FrameProvider value={{ frame, fps: 30, width: BASE_W, height: BASE_H }}>
              <BeatContent index={i} local={local} />
            </FrameProvider>
          </div>
        );
      })}
    </>
  );
};
