/* The interactive, cursor-scrubbed hero (opener).
   Move the cursor left→right (or drag / auto-advance on touch) to travel through
   Thuna's monthly home visit, beat by beat. Reuses the shared scene art. */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { BEATS, N, SPACING, BASE_W, BASE_H, clamp, BeatScenes } from "./scenes";

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

  const setTarget = useCallback((v: number) => { targetRef.current = clamp(v); }, []);

  useEffect(() => {
    const fit = () => {
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const base = Math.min(r.width / BASE_W, r.height / BASE_H);
      const zoom = r.width < 620 ? 1.2 : 1;
      setScale(base * zoom);
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("resize", fit);
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduced) { setMode("static"); setProgress(0.34); actualRef.current = 0.34; return; }
    setMode(fine ? "cursor" : "touch");

    const jp = new URLSearchParams(window.location.search).get("j");
    if (jp != null) { const v = clamp(parseFloat(jp)); targetRef.current = v; actualRef.current = v; setProgress(v); setInteracted(true); }

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
      if (!fine && !interacted) targetRef.current = clamp(targetRef.current + dt / 15);
      actualRef.current += (targetRef.current - actualRef.current) * 0.12;
      const a = actualRef.current;
      setProgress((prev) => (Math.abs(prev - a) > 0.0005 ? a : prev));
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
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); };
  }, [scale, interacted, setTarget]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { setTarget(clamp(targetRef.current + SPACING)); setInteracted(true); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { setTarget(clamp(targetRef.current - SPACING)); setInteracted(true); }
    if (e.key === "Home") setTarget(0);
    if (e.key === "End") setTarget(1);
  };

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
    <div ref={rootRef} className="hero-island" style={{ position: "relative", display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0, width: "100%" }}>
      <div
        ref={stageRef}
        className="hero-stage"
        role="slider"
        tabIndex={0}
        aria-label="Thuna monthly visit — move to travel through the journey"
        aria-valuemin={0} aria-valuemax={N - 1} aria-valuenow={activeIndex} aria-valuetext={BEATS[activeIndex].tag}
        onKeyDown={onKey}
        onPointerDown={(e) => { dragRef.current = true; onRailPoint(e.clientX); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
        onPointerMove={(e) => { if (dragRef.current) onRailPoint(e.clientX); }}
        onPointerUp={() => { dragRef.current = false; }}
        onPointerCancel={() => { dragRef.current = false; }}
        style={{
          position: "relative", flex: "1 1 auto", minHeight: 0, width: "100%", overflow: "hidden",
          borderRadius: 26,
          background: "linear-gradient(180deg, #FBFDFF 0%, #ECF2FE 100%)",
          boxShadow: "inset 0 0 0 1px rgba(37,99,235,0.08), 0 30px 80px -28px rgba(15,23,42,0.30)",
          cursor: mode === "cursor" ? "ew-resize" : "grab",
          touchAction: "pan-y",
        }}
      >
        <div ref={glowRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4 }} />
        <div ref={canvasRef} style={{ position: "absolute", left: "50%", top: "50%", width: BASE_W, height: BASE_H, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center" }}>
          <BeatScenes progress={p} />
        </div>

        {/* bottom scrim */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 230, zIndex: 5, pointerEvents: "none", background: "linear-gradient(to top, #ECF2FE 8%, rgba(236,242,254,0.86) 38%, rgba(236,242,254,0) 100%)" }} />

        {/* captions */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 84, display: "flex", justifyContent: "center", padding: "0 24px", zIndex: 6, pointerEvents: "none" }}>
          <div style={{ position: "relative", height: 96, width: "min(760px, 92%)" }}>
            {BEATS.map((b, i) => {
              const c = i * SPACING;
              const cvis = clamp(1 - Math.abs((p - c) / SPACING) / 0.62);
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

        {/* rail */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, display: "flex", justifyContent: "center", zIndex: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 999, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(10px)", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 8px 24px rgba(15,23,42,0.10)" }}>
            {BEATS.map((b, i) => {
              const on = i === activeIndex;
              return (
                <button key={b.key} onClick={() => { setTarget(i * SPACING); setInteracted(true); }} aria-label={`Go to: ${b.tag}`}
                  style={{ width: on ? 30 : 10, height: 10, borderRadius: 999, border: "none", padding: 0, cursor: "pointer", background: on ? "#2563EB" : "rgba(37,99,235,0.22)", transition: "width .3s ease, background .3s ease" }} />
              );
            })}
          </div>
        </div>

        {/* hint */}
        {mode !== "static" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 7, pointerEvents: "none", opacity: interacted ? 0 : 1, transition: "opacity .6s ease" }}>
            <div className="hero-hint" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 22px", borderRadius: 999, background: "rgba(15,23,42,0.9)", color: "#fff", fontFamily: '"Inter",sans-serif', fontWeight: 600, fontSize: 15.5, boxShadow: "0 16px 40px rgba(15,23,42,0.28)" }}>
              <span>{mode === "touch" ? "Drag to follow the visit" : "Move your cursor to follow the visit"}</span>
              <span className="hero-hint__arrow" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></span>
            </div>
          </div>
        )}
      </div>

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
