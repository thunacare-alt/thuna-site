/* Scroll-pinned story flow — the page's animated narrative.
   As the visitor scrolls, a sticky split-stage scrubs through Thuna's monthly
   visit: the scene art animates in (cuff inflates, ECG draws, tubes fill, ring
   counts) beside the step copy. Reuses the shared scene art; reduced-motion and
   no-JS fall back to a static grid rendered in the Astro markup. */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BEATS, N, SPACING, BASE_W, BASE_H, clamp, BeatScenes } from "./scenes";

export default function StoryFlow() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const actualRef = useRef(0);

  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState(1);

  // hide the static fallback grid (only when we're actually animating)
  useLayoutEffect(() => {
    if (reduced) return;
    document.getElementById("how")?.classList.add("flow-ready");
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;

    const fit = () => {
      const el = sceneRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const base = Math.min(r.width / BASE_W, r.height / BASE_H);
      const zoom = r.width < 620 ? 1.18 : 1;
      setScale(base * zoom);
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (sceneRef.current) ro.observe(sceneRef.current);

    // test hook: ?flow=0..1 freezes the flow at a position (for screenshots)
    const fp = new URLSearchParams(window.location.search).get("flow");
    if (fp != null) {
      setProgress(clamp(parseFloat(fp)));
      return () => ro.disconnect();
    }

    const onScroll = () => {
      const el = rootRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = el.offsetHeight - window.innerHeight;
      targetRef.current = clamp((window.scrollY - top) / Math.max(1, span));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    let raf = 0;
    const tick = () => {
      actualRef.current += (targetRef.current - actualRef.current) * 0.14;
      const a = actualRef.current;
      setProgress((prev) => (Math.abs(prev - a) > 0.0004 ? a : prev));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  if (reduced) return null;

  const p = progress;
  const active = clamp(Math.round(p / SPACING), 0, N - 1);
  const frozen = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("flow") != null;
  const jumpTo = (i: number) => {
    const el = rootRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (i / (N - 1)) * span, behavior: "smooth" });
  };

  return (
    <div ref={rootRef} className="flow" style={{ height: frozen ? "100vh" : `${Math.round((N * 0.78 + 0.7) * 100)}vh` }}>
      <div className="flow__stage">
        <div className="flow__bar"><i style={{ width: `${p * 100}%` }} /></div>

        <div className="flow__text">
          {BEATS.map((b, i) => {
            const c = i * SPACING;
            const vis = clamp(1 - Math.abs((p - c) / SPACING) / 0.6);
            return (
              <div key={b.key} className="flow__panel" aria-hidden={vis < 0.5} style={{ opacity: vis, transform: `translateY(${(1 - vis) * 26}px)`, pointerEvents: vis > 0.5 ? "auto" : "none" }}>
                <div className="flow__num">{String(i + 1).padStart(2, "0")}</div>
                <span className="flow__time">{b.time}</span>
                <h3 className="flow__title">{b.title}</h3>
                <p className="flow__body">{b.body}</p>
              </div>
            );
          })}
        </div>

        <div ref={sceneRef} className="flow__scene">
          <div ref={canvasRef} style={{ position: "absolute", left: "50%", top: "50%", width: BASE_W, height: BASE_H, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center" }}>
            <BeatScenes progress={p} travel={42} />
          </div>
          <div className="flow__scene-scrim" />
          <ol className="flow__rail">
            {BEATS.map((b, i) => (
              <li key={b.key}>
                <button className={i === active ? "on" : ""} onClick={() => jumpTo(i)} aria-label={`Go to ${b.title}`} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
