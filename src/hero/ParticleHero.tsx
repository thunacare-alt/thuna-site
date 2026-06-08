/* Auto-playing, mouse-reactive particle hero (canvas-2D, high-end).
   A blue particle field on cinematic white AUTO-MORPHS through Thuna's story on a
   continuous loop with ZERO user input: a glowing ECG heartbeat that draws + a
   pulse of light travels it → vitals bloom (heart) → family constellation →
   drift caught early → loop. The cursor is an ambient delight only (parallax +
   gentle repulsion), never required. Reduced-motion → one calm static frame.

   Canvas-2D (not WebGL) for rock-solid 60fps + identical rendering everywhere;
   glow via a pre-rendered sprite, depth/parallax, slow cinematic easing. */
import React, { useEffect, useRef } from "react";

const CAPTIONS = [
  "Every heartbeat, watched at home.",
  "The vitals that matter — every month.",
  "Your whole family, connected by care.",
  "Small changes, caught early.",
];
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const easeIO = (t: number) => t * t * (3 - 2 * t);

function ecgProfile(u: number): number {
  if (u < 0.10) return 0;
  if (u < 0.18) return 0.13 * Math.sin(((u - 0.10) / 0.08) * Math.PI);
  if (u < 0.34) return 0;
  if (u < 0.38) return -0.18 * ((u - 0.34) / 0.04);
  if (u < 0.42) return -0.18 + 1.18 * ((u - 0.38) / 0.04);
  if (u < 0.46) return 1.0 - 1.42 * ((u - 0.42) / 0.04);
  if (u < 0.50) return -0.42 + 0.42 * ((u - 0.46) / 0.04);
  if (u < 0.72) return 0.24 * Math.sin(((u - 0.50) / 0.22) * Math.PI);
  return 0;
}

type P = { x: number; y: number; tx: number[]; ty: number[]; z: number; size: number; ph: number; rev: number };

export default function ParticleHero() {
  const mountRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 760px)").matches;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    const ctx = canvas.getContext("2d");
    if (!ctx) { mount.classList.add("phero--fallback"); return; }
    mount.insertBefore(canvas, mount.firstChild);

    let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
    const N = mobile ? 1100 : 2800;
    const ps: P[] = [];

    // pre-rendered glow sprites (blue + light) — drawImage is far cheaper than per-particle gradients
    const makeSprite = (rgb: string, coreA: number) => {
      const s = 64, c = document.createElement("canvas"); c.width = c.height = s;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grd.addColorStop(0, `rgba(${rgb},${coreA})`);
      grd.addColorStop(0.32, `rgba(${rgb},${coreA * 0.5})`);
      grd.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grd; g.fillRect(0, 0, s, s);
      return c;
    };
    const spBlue = makeSprite("37,99,235", 0.85);
    const spNavy = makeSprite("30,58,138", 0.8);
    const spLight = makeSprite("147,197,253", 0.95);

    const buildTargets = () => {
      const Sw = Math.min(W * 0.82, 1060), Sh = Math.min(H * 0.6, 540);
      const cx = W * (mobile ? 0.5 : 0.62), cy = H * (mobile ? 0.52 : 0.5);
      for (let i = 0; i < N; i++) {
        const p = ps[i]; const t = i / N; const rr = () => Math.random();
        // ECG
        const ux = (t - 0.5) * Sw, u = (t * 5) % 1;
        let ey = ecgProfile(u) * Sh * 0.46 + (rr() - 0.5) * Sh * 0.03;
        // heart
        const th = t * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(th), 3);
        const hy = 13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th);
        const hs = (Sh * 0.5) / 17, fill = 0.42 + 0.58 * Math.sqrt(rr());
        // rings
        const ring = i % 3, rad = (0.42 + ring * 0.24) * Sh * 0.5 + (rr() - 0.5) * 10, ra = rr() * Math.PI * 2;
        // trend
        let trx: number, trY: number;
        if (t > 0.93) { trx = Sw * 0.40 + (rr() - 0.5) * 28; trY = Sh * 0.40 + (rr() - 0.5) * 28; }
        else { const tt = t / 0.93; trx = (tt - 0.5) * Sw; trY = (-0.28 + 0.46 * tt + 0.42 * clamp((tt - 0.66) / 0.34)) * Sh; }
        p.tx = [cx + ux, cx + hx * hs * fill, cx + Math.cos(ra) * rad, cx + trx];
        p.ty = [cy - ey, cy - (hy * hs * fill + Sh * 0.04), cy - Math.sin(ra) * rad * 0.92, cy - trY];
      }
    };

    for (let i = 0; i < N; i++) {
      ps.push({ x: 0, y: 0, tx: [0, 0, 0, 0], ty: [0, 0, 0, 0], z: Math.random(), size: (mobile ? 8 : 11) * (0.45 + Math.random() * 0.95), ph: Math.random() * 6.2831, rev: i / N });
    }

    const resize = () => {
      const r = mount.getBoundingClientRect(); W = r.width; H = r.height;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      buildTargets();
    };
    resize();
    // seed at first target so the first frame isn't a clump
    for (const p of ps) { p.x = p.tx[0]; p.y = p.ty[0]; }
    let rto: any; const onResize = () => { clearTimeout(rto); rto = setTimeout(resize, 160); };
    window.addEventListener("resize", onResize);

    // mouse (ambient only)
    const m = { x: 0, y: 0, tx: 0, ty: 0, on: 0 };
    const onMove = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect();
      m.tx = e.clientX - r.left; m.ty = e.clientY - r.top; m.on = 1;
      if (lightRef.current) lightRef.current.style.transform = `translate(${m.tx}px, ${m.ty}px)`;
    };
    if (!mobile) window.addEventListener("mousemove", onMove, { passive: true });

    const setCaption = (i: number) => {
      const el = document.getElementById("heroCap"); if (!el) return;
      el.style.opacity = "0";
      window.setTimeout(() => { el.textContent = CAPTIONS[i % 4]; el.style.opacity = "1"; }, 260);
    };

    const HOLD = 3.4, MORPH = 2.4, PERIOD = HOLD + MORPH;
    let reveal = 0, lastIdx = -1;
    // ?hero=N freezes a beat for screenshots
    const heroParam = new URLSearchParams(window.location.search).get("hero");
    const frozenBeat = heroParam != null ? Math.max(0, Math.min(3, parseInt(heroParam, 10) || 0)) : null;

    const drawFrame = (time: number, dt: number, prevB: number, b: number, k: number, anim: boolean) => {
      ctx.clearRect(0, 0, W, H);
      const swayX = anim ? Math.sin(time * 0.18) * 10 : 0;
      const swayY = anim ? Math.cos(time * 0.14) * 8 : 0;
      m.x += (m.tx - m.x) * 0.06; m.y += (m.ty - m.y) * 0.06;
      const sweep = anim ? ((time * 0.12) % 1.25 - 0.12) : 2;
      const sweepX = W * (mobile ? 0.5 : 0.62) + (sweep - 0.5) * Math.min(W * 0.82, 1060);
      const ease = anim ? 1 - Math.exp(-dt * 7) : 1; // frame-rate-independent settle
      ctx.globalCompositeOperation = "source-over";

      for (let i = 0; i < N; i++) {
        const p = ps[i];
        const tx = p.tx[prevB] + (p.tx[b] - p.tx[prevB]) * k;
        const ty = p.ty[prevB] + (p.ty[b] - p.ty[prevB]) * k;
        const dx = anim ? Math.sin(time * 0.5 + p.ph) * (2 + p.z * 6) : 0;
        const dy = anim ? Math.cos(time * 0.42 + p.ph * 1.3) * (2 + p.z * 6) : 0;
        p.x += (tx + dx + swayX * (0.4 + p.z) - p.x) * ease;
        p.y += (ty + dy + swayY * (0.4 + p.z) - p.y) * ease;

        let X = p.x, Y = p.y;
        if (anim && m.on) {
          X += (m.x - W / 2) * -0.02 * (0.3 + p.z);
          Y += (m.y - H / 2) * -0.02 * (0.3 + p.z);
          const ddx = X - m.x, ddy = Y - m.y, dl2 = ddx * ddx + ddy * ddy;
          const f = Math.exp(-dl2 / (150 * 150)) * 30;
          const dl = Math.sqrt(dl2) + 0.001; X += (ddx / dl) * f; Y += (ddy / dl) * f;
        }
        const revGate = clamp((reveal - p.rev) * 6 + 0.2);
        if (revGate <= 0.02) continue;
        const pulse = anim ? Math.exp(-((X - sweepX) ** 2) / (70 * 70)) : 0;
        const s = p.size * (0.7 + p.z * 0.7) * (1 + pulse * 1.1) * (mobile ? 0.85 : 1);
        ctx.globalAlpha = (0.32 + 0.5 * p.z) * revGate;
        const spr = pulse > 0.35 ? spLight : (p.z > 0.6 ? spNavy : spBlue);
        ctx.drawImage(spr, X - s / 2, Y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0, disposed = false, last = performance.now();
    const start = performance.now();

    if (reduced || frozenBeat != null) {
      // static composed frame (calm heartbeat, or a chosen beat for screenshots)
      const fb = frozenBeat ?? 0;
      reveal = 1; setCaption(fb);
      for (const p of ps) { p.x = p.tx[fb]; p.y = p.ty[fb]; }
      // a couple of settling passes so drift/positions look natural
      for (let n = 0; n < 2; n++) drawFrame(0, 1, fb, fb, 1, false);
      return () => { disposed = true; window.removeEventListener("resize", onResize); window.removeEventListener("mousemove", onMove); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); };
    }

    setCaption(0);
    const loop = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      reveal = Math.min(1, reveal + dt / 1.8);
      // wall-clock-driven state → stays correct regardless of frame rate
      const T = (now - start) / 1000 + MORPH; // open on a settled heartbeat
      const idx = Math.floor(T / PERIOD) % 4;
      const tin = T % PERIOD;
      const prevB = (idx + 3) % 4;
      const k = tin < MORPH ? easeIO(clamp(tin / MORPH)) : 1;
      if (idx !== lastIdx) { lastIdx = idx; setCaption(idx); }
      drawFrame(now / 1000, dt, prevB, idx, k, true);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true; cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return (
    <div ref={mountRef} className="phero" aria-hidden="true">
      <div ref={lightRef} className="phero__light" />
      <svg className="phero__fallback-svg" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <path d="M0 100 H210 l18 -46 l26 92 l20 -120 l22 150 l16 -76 H600" fill="none" stroke="#2563EB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />
      </svg>
    </div>
  );
}
