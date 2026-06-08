/* The interactive, cursor-scrubbed hero.
   Move the cursor left→right (or scroll on touch) to travel through Thuna's
   monthly home visit, beat by beat. Each beat reuses the Remotion scene visuals,
   driven by a scrub-reversible frame instead of a render clock. */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { FrameProvider } from "./shim";
import { PALETTE } from "./constants";
import { Companion, ElderlyParent, Doctor, PersonWithPhone } from "./figures";
import {
  GlassCard, EcgLine, PhoneMockup, RiskRing,
  HeartIcon, EcgIcon, GlucoseIcon, SecondaryRow,
  QuestionnairePanel, LabPanel, LabKitBox, RiskReviewPanel,
  MemberScreen, FAMILY, TrendPanel,
} from "./cards";

const BASE_W = 1180;
const BASE_H = 660;
const SCENE_FRAMES = 150;
const N = 7;
const SPACING = 1 / (N - 1);
const W = SPACING * 0.9;

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const BEATS = [
  { key: "arrive", tag: "Arrives", caption: "A Thuna companion visits your home", em: "— every month." },
  { key: "ask", tag: "Asks", caption: "It starts with a few", em: "simple questions." },
  { key: "vitals", tag: "Measures", caption: "Then the vitals that matter —", em: "BP, ECG, glucose & more." },
  { key: "lab", tag: "Home labs", caption: "Lab tests, arranged at home", em: "when they're needed." },
  { key: "doctor", tag: "MD review", caption: "A doctor reviews", em: "every single reading." },
  { key: "family", tag: "Family", caption: "Your whole family follows along —", em: "wherever they are." },
  { key: "prevent", tag: "Prevention", caption: "Small changes, caught early —", em: "before they become an emergency." },
];

// ── per-beat scene compositions (in the BASE_W × BASE_H canvas space) ──────────
const HomeFigures: React.FC<{ bp?: number; spo2?: number; glucose?: number; children?: React.ReactNode }> = ({
  bp = 0, spo2 = 0, glucose = 0, children,
}) => (
  <>
    <div style={{ position: "absolute", left: 30, bottom: -8 }}>
      <ElderlyParent height={398} bp={bp} spo2={spo2} glucose={glucose} />
    </div>
    <div style={{ position: "absolute", left: 338, bottom: 2 }}>
      <Companion height={356} />
    </div>
    {children}
  </>
);

const morningGlow = {
  position: "absolute" as const, inset: 0,
  background:
    "radial-gradient(40% 50% at 22% 18%, rgba(255,234,198,0.5), transparent 70%)," +
    "radial-gradient(60% 60% at 80% 0%, rgba(21,101,216,0.06), transparent 70%)",
};

const BeatContent: React.FC<{ index: number; local: number }> = ({ index, local }) => {
  switch (index) {
    case 0: // arrives
      return (
        <>
          <div style={morningGlow} />
          {/* doorway hint */}
          <div style={{ position: "absolute", left: 90, top: 60, width: 360, height: 560, borderRadius: "18px 18px 0 0", background: "linear-gradient(180deg, rgba(255,244,224,0.55), rgba(255,255,255,0))", border: "1px solid rgba(21,101,216,0.08)" }} />
          <div style={{ position: "absolute", right: 120, top: 120, display: "flex", alignItems: "center", gap: 12, padding: "14px 22px", borderRadius: 999, background: "rgba(255,255,255,0.78)", border: `1px solid ${PALETTE.glassBorder}`, boxShadow: `0 16px 40px ${PALETTE.glassShadow}` }}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: PALETTE.blue }} />
            <span style={{ fontFamily: '"Inter",sans-serif', fontSize: 22, fontWeight: 700, color: PALETTE.text }}>Monthly home visit</span>
          </div>
          <HomeFigures />
        </>
      );
    case 1: // questions
      return (
        <>
          <div style={morningGlow} />
          <HomeFigures />
          <div style={{ position: "absolute", right: 56, top: 90 }}>
            <QuestionnairePanel width={470} />
          </div>
        </>
      );
    case 2: { // vitals
      const bp = clamp(local * 1.25);
      const spo2 = clamp((local - 0.45) * 2);
      const glucose = clamp((local - 0.6) * 2.2);
      return (
        <>
          <div style={morningGlow} />
          <HomeFigures bp={bp} spo2={spo2} glucose={glucose} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 26, display: "flex", justifyContent: "center", gap: 18 }}>
            <GlassCard label="Blood Pressure" value="128/82" unit="mmHg" accent={PALETTE.blue} icon={HeartIcon} delay={6} seed="bp" width={250} />
            <GlassCard label="ECG" accent={PALETTE.sky} icon={EcgIcon} delay={20} seed="ecg" width={234}>
              <div style={{ marginTop: 2 }}>
                <EcgLine width={186} height={54} color={PALETTE.blue} strokeWidth={3} beats={3} drawDelay={24} drawDuration={30} glow={false} />
                <div style={{ fontFamily: '"Inter",sans-serif', fontSize: 17, fontWeight: 700, color: PALETTE.sky, marginTop: 2 }}>72 bpm · Normal</div>
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
    case 3: // lab
      return (
        <>
          <div style={morningGlow} />
          <HomeFigures />
          <div style={{ position: "absolute", left: 250, bottom: 30 }}><LabKitBox /></div>
          <div style={{ position: "absolute", right: 56, top: 70 }}>
            <LabPanel width={486} />
          </div>
        </>
      );
    case 4: // doctor reviews
      return (
        <>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(21,101,216,0.08) 0%, rgba(255,255,255,0) 60%)" }} />
          <div style={{ position: "absolute", left: 90, top: 150, width: 240, height: 360, borderRadius: 24, background: "rgba(255,255,255,0.4)", border: "1px solid rgba(21,101,216,0.10)" }} />
          <div style={{ position: "absolute", left: 70, bottom: -30 }}><Doctor height={500} /></div>
          <div style={{ position: "absolute", right: 50, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
            <RiskReviewPanel width={560} />
          </div>
        </>
      );
    case 5: { // family
      const slots = [
        { x: -300, y: -40, s: 0.92, d: 4, r: -7 },
        { x: 0, y: -86, s: 1.0, d: 16, r: 0 },
        { x: 300, y: -40, s: 0.92, d: 28, r: 7 },
      ];
      return (
        <>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 60% at 60% 30%, rgba(21,101,216,0.07), transparent 70%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {slots.map((s, i) => (
              <div key={i} style={{ position: "absolute", transform: `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg) scale(${s.s})` }}>
                <PhoneMockup width={156} delay={s.d} idleAmp={1.1}>
                  <MemberScreen m={FAMILY[i]} delay={s.d} />
                </PhoneMockup>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 70, bottom: -10 }}><PersonWithPhone height={360} /></div>
          <div style={{ position: "absolute", left: "54%", bottom: 70, transform: "translateX(-50%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 28px", borderRadius: 999, background: `linear-gradient(135deg, ${PALETTE.blue}, ${PALETTE.blueDeep})`, boxShadow: `0 22px 50px rgba(21,101,216,0.45)` }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 26 26"><path d="M4 6 h18 v12 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 Z" fill="none" stroke="#fff" strokeWidth="2.2" /><path d="M4 7 L13 14 L22 7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ fontFamily: '"Inter",sans-serif', fontSize: 24, fontWeight: 800, color: "#fff" }}>Your report is ready</span>
            </div>
          </div>
        </>
      );
    }
    case 6: // preventive
      return (
        <>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 60% at 50% 24%, rgba(21,101,216,0.07), transparent 70%)" }} />
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

export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const targetRef = useRef(0.04);
  const actualRef = useRef(0.04);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const [progress, setProgress] = useState(0.04);
  const [mode, setMode] = useState<"cursor" | "touch" | "static">("cursor");
  const [scale, setScale] = useState(1);
  const [interacted, setInteracted] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("j")
  );

  const setTarget = useCallback((v: number) => {
    targetRef.current = clamp(v);
  }, []);

  // fit the BASE canvas into the stage
  useEffect(() => {
    const fit = () => {
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const base = Math.min(r.width / BASE_W, r.height / BASE_H);
      // on narrow/portrait stages, zoom in a touch (crops the empty sides)
      const zoom = r.width < 620 ? 1.2 : 1;
      setScale(base * zoom);
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("resize", fit);
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); };
  }, []);

  // mode + interaction wiring
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduced) { setMode("static"); setProgress(0.34); actualRef.current = 0.34; return; }
    setMode(fine ? "cursor" : "touch");

    // optional deep-link / test hook: ?j=0..1 sets the starting journey position
    const jp = new URLSearchParams(window.location.search).get("j");
    if (jp != null) {
      const v = clamp(parseFloat(jp));
      targetRef.current = v;
      actualRef.current = v;
      setProgress(v);
      setInteracted(true);
    }

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
      setTarget(e.clientX / window.innerWidth);
      if (!interacted) setInteracted(true);
    };
    if (fine) window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // touch: gently auto-advance through the whole story until first interaction
      if (!fine && !interacted) targetRef.current = clamp(targetRef.current + dt / 15);
      actualRef.current += (targetRef.current - actualRef.current) * 0.12;
      const a = actualRef.current;
      setProgress((prev) => (Math.abs(prev - a) > 0.0005 ? a : prev));
      // imperative parallax + cursor glow (cheap, every frame)
      const { x, y } = mouseRef.current;
      if (canvasRef.current) {
        canvasRef.current.style.transform =
          `translate(-50%, -50%) translate(${(x - 0.5) * -10}px, ${(y - 0.5) * -12}px) scale(${scale})`;
      }
      if (glowRef.current && fine) {
        glowRef.current.style.background =
          `radial-gradient(360px 360px at ${x * 100}% ${y * 100}%, rgba(37,99,235,0.12), transparent 70%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [scale, interacted, setTarget]);

  // keyboard
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { setTarget(clamp(targetRef.current + SPACING)); setInteracted(true); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { setTarget(clamp(targetRef.current - SPACING)); setInteracted(true); }
    if (e.key === "Home") setTarget(0);
    if (e.key === "End") setTarget(1);
  };

  // drag-to-scrub on the rail / stage (touch + mouse)
  const dragRef = useRef(false);
  const onRailPoint = (clientX: number) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTarget((clientX - r.left) / r.width);
    setInteracted(true);
  };

  const p = progress;
  const activeIndex = clamp(Math.round(p / SPACING), 0, N - 1);

  return (
    <div
      ref={rootRef}
      className="hero-island"
      style={{ position: "relative", display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0, width: "100%" }}
    >
      <div
        ref={stageRef}
        className="hero-stage"
        role="slider"
        tabIndex={0}
        aria-label="Thuna monthly visit — move to travel through the journey"
        aria-valuemin={0}
        aria-valuemax={N - 1}
        aria-valuenow={activeIndex}
        aria-valuetext={BEATS[activeIndex].tag}
        onKeyDown={onKey}
        onPointerDown={(e) => { dragRef.current = true; onRailPoint(e.clientX); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
        onPointerMove={(e) => { if (dragRef.current) onRailPoint(e.clientX); }}
        onPointerUp={() => { dragRef.current = false; }}
        onPointerCancel={() => { dragRef.current = false; }}
        style={{
          position: "relative",
          flex: "1 1 auto",
          minHeight: 0,
          width: "100%",
          overflow: "hidden",
          borderRadius: 26,
          background: "linear-gradient(180deg, #FBFDFF 0%, #EEF4FB 100%)",
          boxShadow: "inset 0 0 0 1px rgba(21,101,216,0.10), 0 30px 80px rgba(20,45,33,0.16)",
          cursor: mode === "cursor" ? "ew-resize" : "grab",
          touchAction: "pan-y",
        }}
      >
        {/* cursor glow */}
        <div ref={glowRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4 }} />

        {/* the scaled canvas */}
        <div
          ref={canvasRef}
          style={{
            position: "absolute", left: "50%", top: "50%",
            width: BASE_W, height: BASE_H,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {BEATS.map((b, i) => {
            const c = i * SPACING;
            const dist = (p - c) / SPACING;
            const ad = Math.abs(dist);
            if (ad > 1.04) return null;
            const vis = 1 - smoothstep(0, 1, Math.min(ad, 1));
            const local = clamp((p - (c - W)) / W);
            const frame = easeInOut(local) * SCENE_FRAMES;
            return (
              <div
                key={b.key}
                aria-hidden="true"
                style={{
                  position: "absolute", inset: 0,
                  opacity: vis,
                  transform: `translateX(${dist * 64}px) scale(${0.97 + vis * 0.03})`,
                  pointerEvents: "none",
                  willChange: "transform, opacity",
                }}
              >
                <FrameProvider value={{ frame, fps: 30, width: BASE_W, height: BASE_H }}>
                  <BeatContent index={i} local={local} />
                </FrameProvider>
              </div>
            );
          })}
        </div>

        {/* bottom scrim so captions read cleanly over the scene */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 230, zIndex: 5, pointerEvents: "none", background: "linear-gradient(to top, #EFF4FB 8%, rgba(239,244,251,0.86) 38%, rgba(239,244,251,0) 100%)" }} />

        {/* captions */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 84, display: "flex", justifyContent: "center", padding: "0 24px", zIndex: 6, pointerEvents: "none" }}>
          <div style={{ position: "relative", height: 96, width: "min(760px, 92%)" }}>
            {BEATS.map((b, i) => {
              const c = i * SPACING;
              const cd = Math.abs((p - c) / SPACING);
              const cvis = clamp(1 - cd / 0.62);
              return (
                <div key={b.key} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", textAlign: "center", opacity: cvis, transform: `translateY(${(1 - cvis) * 14}px)` }}>
                  <div style={{ fontFamily: '"Inter",sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#2563EB", marginBottom: 10 }}>
                    {String(i + 1).padStart(2, "0")} · {b.tag}
                  </div>
                  <div style={{ fontFamily: '"Inter",sans-serif', fontSize: "clamp(20px, 2.6vw, 31px)", lineHeight: 1.16, color: "#0F172A", fontWeight: 800, letterSpacing: "-0.025em" }}>
                    {b.caption} <span style={{ color: "#2563EB" }}>{b.em}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* progress rail */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, display: "flex", justifyContent: "center", zIndex: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 999, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(10px)", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 8px 24px rgba(15,23,42,0.10)" }}>
            {BEATS.map((b, i) => {
              const on = i === activeIndex;
              return (
                <button
                  key={b.key}
                  onClick={() => { setTarget(i * SPACING); setInteracted(true); }}
                  aria-label={`Go to: ${b.tag}`}
                  style={{ width: on ? 30 : 10, height: 10, borderRadius: 999, border: "none", padding: 0, cursor: "pointer", background: on ? "#2563EB" : "rgba(37,99,235,0.22)", transition: "width .3s ease, background .3s ease" }}
                />
              );
            })}
          </div>
        </div>

        {/* hint */}
        {mode !== "static" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 7, pointerEvents: "none", opacity: interacted ? 0 : 1, transition: "opacity .6s ease" }}>
            <div className="hero-hint" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 22px", borderRadius: 999, background: "rgba(15,23,42,0.9)", color: "#fff", fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 15.5, boxShadow: "0 16px 40px rgba(15,23,42,0.28)" }}>
              <span>{mode === "touch" ? "Drag to follow the visit" : "Move your cursor to follow the visit"}</span>
              <span className="hero-hint__arrow" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* static-mode caption list (reduced motion) */}
      {mode === "static" && (
        <ul style={{ listStyle: "none", margin: "26px auto 0", padding: "0 20px", maxWidth: 760, display: "grid", gap: 8 }}>
          {BEATS.map((b, i) => (
            <li key={b.key} style={{ fontFamily: '"Inter",sans-serif', color: "#64748B", fontSize: 15 }}>
              <b style={{ color: "#2563EB" }}>{String(i + 1).padStart(2, "0")}</b>&nbsp; {b.caption} {b.em}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
