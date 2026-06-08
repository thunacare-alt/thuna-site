/* Thuna characters — ported from thuna-care-video/src (Companion, ElderlyParent,
   Doctor, PersonWithPhone). SVG bodies unchanged; only the Remotion imports are
   swapped for the local shim so the cursor-scrubbed frame drives their life. */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, noise2D } from "./shim";
import { PALETTE } from "./constants";

// ── Home-visit companion (kneeling, facing left) ──────────────────────────────
export const Companion: React.FC<{ height?: number; carryBag?: boolean }> = ({
  height = 560,
  carryBag = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = (height / 600) * 520;

  const breathe = 1 + Math.sin((frame / fps) * Math.PI * 0.65) * 0.016;
  const headBob = Math.sin((frame / fps) * Math.PI * 0.5) * 1.2;
  const headTilt = -3 + noise2D("comp-head", frame * 0.006, 0) * 1.4;
  const strand = noise2D("comp-strand", frame * 0.02, 0) * 2.5;
  const reach = Math.sin((frame / fps) * Math.PI * 0.7) * 4;
  const cyc = (frame % Math.round(fps * 3.4)) / fps;
  const blink = cyc > 3.1 && cyc < 3.22 ? 0.12 : 1;

  return (
    <svg width={w} height={height} viewBox="0 0 520 600" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="c-uniform" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F2F6FB" />
          <stop offset="100%" stopColor="#DEE8F2" />
        </linearGradient>
        <linearGradient id="c-uniform-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(150,170,195,0)" />
          <stop offset="100%" stopColor="rgba(120,145,175,0.26)" />
        </linearGradient>
        <linearGradient id="c-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4C9A8" />
          <stop offset="100%" stopColor="#E7B492" />
        </linearGradient>
        <linearGradient id="c-hair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3A2C2A" />
          <stop offset="100%" stopColor="#221917" />
        </linearGradient>
        <linearGradient id="c-trousers" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E2EAF3" />
          <stop offset="100%" stopColor="#C7D5E4" />
        </linearGradient>
        <linearGradient id="c-bag" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2C3A4E" />
          <stop offset="100%" stopColor="#1A2330" />
        </linearGradient>
        <linearGradient id="c-badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={PALETTE.sky} />
          <stop offset="100%" stopColor={PALETTE.blue} />
        </linearGradient>
        <filter id="c-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="rgba(30,60,100,0.16)" />
        </filter>
      </defs>

      <ellipse cx="280" cy="582" rx="180" ry="22" fill="rgba(30,60,100,0.13)" />

      <g filter="url(#c-shadow)">
        <path d="M250 520 Q150 560 360 566 Q420 566 430 540 Q360 520 300 514 Z" fill="url(#c-trousers)" />
        <path d="M236 430 Q180 470 200 528 Q214 540 250 524 Q256 470 286 446 Z" fill="url(#c-trousers)" />
        <path d="M150 552 Q140 574 168 576 L214 576 Q222 562 210 556 Z" fill="#2C3A4E" />
      </g>

      {carryBag && (
        <g filter="url(#c-shadow)">
          <rect x="372" y="470" width="116" height="92" rx="16" fill="url(#c-bag)" />
          <path d="M398 470 Q398 446 430 446 Q462 446 462 470" fill="none" stroke="#2C3A4E" strokeWidth="9" strokeLinecap="round" />
          <rect x="372" y="504" width="116" height="7" rx="3.5" fill={PALETTE.sky} />
          <g transform="translate(430 530)">
            <rect x="-5" y="-14" width="10" height="28" rx="2" fill="#FFFFFF" />
            <rect x="-14" y="-5" width="28" height="10" rx="2" fill="#FFFFFF" />
          </g>
        </g>
      )}

      <g style={{ transformOrigin: "270px 360px", transform: `scaleY(${breathe})` }}>
        <path
          d="M210 250 Q176 268 170 340 L166 452 Q166 466 182 466 L356 466 Q372 466 372 452 L366 340 Q360 268 326 250 Q268 234 210 250 Z"
          fill="url(#c-uniform)"
          stroke="#DCE6F0"
          strokeWidth="2"
        />
        <path d="M300 250 Q360 268 366 340 L372 452 Q372 466 356 466 L300 466 Z" fill="url(#c-uniform-shade)" opacity="0.7" />
        <path d="M244 244 L268 296 L292 244 Q268 236 244 244 Z" fill="#EAF1F8" stroke="#D4E0EC" strokeWidth="1.5" />
        <path d="M226 320 Q230 384 222 460" stroke="rgba(150,170,195,0.32)" strokeWidth="2" fill="none" />
        <path d="M312 320 Q308 384 316 460" stroke="rgba(150,170,195,0.32)" strokeWidth="2" fill="none" />
        <g transform="translate(304 312)">
          <rect x="-30" y="-19" width="60" height="38" rx="9" fill="url(#c-badge)" />
          <path d="M-18 0 L-9 0 L-4 -9 L4 10 L9 0 L18 0" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <path d="M252 248 L300 302" stroke="rgba(77,166,255,0.7)" strokeWidth="5" />
        <path d="M326 256 Q360 274 360 330 Q360 352 342 356 Q326 332 322 286 Z" fill="url(#c-uniform)" stroke="#DCE6F0" strokeWidth="1.5" />
        <path d="M352 344 Q364 392 344 430 Q336 442 326 436 Q330 392 334 352 Z" fill="url(#c-skin)" />
        <g style={{ transformOrigin: "200px 300px", transform: `translate(${-reach}px, 0)` }}>
          <path d="M214 256 Q176 270 150 320 Q140 342 158 350 Q186 320 218 288 Z" fill="url(#c-uniform)" stroke="#DCE6F0" strokeWidth="1.5" />
          <path d="M150 326 Q120 356 110 392 Q108 406 122 408 Q150 372 170 346 Z" fill="url(#c-skin)" />
          <ellipse cx="114" cy="404" rx="18" ry="15" fill="url(#c-skin)" />
        </g>
      </g>

      <g transform="translate(238 432) rotate(-16)" filter="url(#c-shadow)">
        <rect x="0" y="0" width="120" height="86" rx="12" fill="#1A2330" />
        <rect x="6" y="6" width="108" height="74" rx="7" fill={PALETTE.bg} />
        <rect x="14" y="16" width="50" height="9" rx="4" fill={PALETTE.blue} />
        <rect x="14" y="32" width="90" height="6" rx="3" fill="rgba(21,101,216,0.3)" />
        <rect x="14" y="44" width="74" height="6" rx="3" fill="rgba(21,101,216,0.22)" />
        <rect x="14" y="56" width="84" height="6" rx="3" fill="rgba(21,101,216,0.22)" />
      </g>

      <g style={{ transformOrigin: "270px 210px", transform: `translateY(${headBob}px) rotate(${headTilt}deg)` }}>
        <path d="M252 230 L252 256 Q270 268 288 256 L288 230 Z" fill="url(#c-skin)" />
        <ellipse cx="270" cy="158" rx="84" ry="88" fill="url(#c-hair)" />
        <circle cx="338" cy="156" r="26" fill="url(#c-hair)" />
        <path d="M210 158 Q210 104 270 104 Q330 104 330 158 Q330 216 270 228 Q210 216 210 158 Z" fill="url(#c-skin)" />
        <path d="M210 158 Q206 104 270 100 Q336 98 330 158 Q318 128 270 126 Q236 128 228 158 Q220 146 210 158 Z" fill="url(#c-hair)" />
        <path d={`M224 140 Q${218 + strand} 176 ${228 + strand} 202`} stroke="url(#c-hair)" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="238" cy="178" rx="15" ry="10" fill="rgba(77,166,255,0.10)" />
        <ellipse cx="302" cy="178" rx="15" ry="10" fill="rgba(77,166,255,0.10)" />
        <g style={{ transformOrigin: "270px 164px", transform: `scaleY(${blink})` }}>
          <ellipse cx="246" cy="164" rx="7.5" ry="8.5" fill="#3A2C2A" />
          <ellipse cx="294" cy="164" rx="7.5" ry="8.5" fill="#3A2C2A" />
          <circle cx="248" cy="161" r="2.4" fill="#fff" />
          <circle cx="296" cy="161" r="2.4" fill="#fff" />
          <path d="M236 150 Q246 145 257 150" stroke="#2C211F" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M283 150 Q294 145 305 150" stroke="#2C211F" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
        <path d="M270 170 Q274 184 266 188" stroke="rgba(150,100,80,0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M250 200 Q270 216 290 200" stroke="#C36B52" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};

// ── Elderly parent (seated, facing right) with on-arm vitals devices ──────────
export const ElderlyParent: React.FC<{
  height?: number;
  bp?: number;
  spo2?: number;
  glucose?: number;
}> = ({ height = 620, bp = 0, spo2 = 0, glucose = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = (height / 660) * 720;

  const breathe = 1 + Math.sin((frame / fps) * Math.PI * 0.55) * 0.016;
  const headBob = Math.sin((frame / fps) * Math.PI * 0.45) * 1.2;
  const headTilt = noise2D("parent-head", frame * 0.005, 0) * 1.2;

  const cuffWrap = interpolate(bp, [0, 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const inflate = interpolate(bp, [0.45, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cuffPulse = bp > 0.8 ? 1 + Math.sin((frame / fps) * Math.PI * 2.2) * 0.025 : 1;
  const bulbSquish = bp > 0.45 && bp < 0.85 ? 0.85 + Math.sin((frame / fps) * Math.PI * 3) * 0.15 : 1;

  return (
    <svg width={w} height={height} viewBox="0 0 720 660" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="p-chair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E7EDF4" />
          <stop offset="100%" stopColor="#CBD8E6" />
        </linearGradient>
        <linearGradient id="p-cardigan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C93AD" />
          <stop offset="100%" stopColor="#5E7791" />
        </linearGradient>
        <linearGradient id="p-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0CBA8" />
          <stop offset="100%" stopColor="#E3B492" />
        </linearGradient>
        <linearGradient id="p-cuff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PALETTE.sky} />
          <stop offset="100%" stopColor={PALETTE.blue} />
        </linearGradient>
        <filter id="p-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="rgba(30,60,100,0.16)" />
        </filter>
      </defs>

      <ellipse cx="320" cy="638" rx="240" ry="24" fill="rgba(30,60,100,0.12)" />

      <g filter="url(#p-shadow)">
        <rect x="60" y="300" width="430" height="320" rx="46" fill="url(#p-chair)" />
        <rect x="40" y="360" width="90" height="240" rx="34" fill="#D7E1EC" />
        <rect x="300" y="360" width="110" height="250" rx="34" fill="#DEE7F0" />
        <rect x="80" y="276" width="380" height="120" rx="46" fill="#EEF3F9" />
      </g>

      <g style={{ transformOrigin: "270px 560px" }}>
        <path d="M180 560 L150 626 Q148 640 164 640 L210 640 Q220 640 220 628 L236 540 Z" fill="#48586B" />
        <path d="M250 560 L250 628 Q250 640 266 640 L312 640 Q322 640 320 628 L316 540 Z" fill="#48586B" />
        <ellipse cx="178" cy="640" rx="42" ry="16" fill="#2C3A4E" />
        <ellipse cx="288" cy="640" rx="42" ry="16" fill="#2C3A4E" />
      </g>

      <g style={{ transformOrigin: "250px 400px", transform: `scaleY(${breathe})` }}>
        <path d="M150 560 Q120 410 200 372 Q250 356 300 372 Q372 408 346 560 Z" fill="url(#p-cardigan)" />
        <path d="M248 372 L250 556" stroke="#4A6080" strokeWidth="4" />
        <circle cx="249" cy="420" r="5" fill="#3C5070" />
        <circle cx="249" cy="460" r="5" fill="#3C5070" />
        <circle cx="249" cy="500" r="5" fill="#3C5070" />
        <path d="M214 372 L250 410 L286 372 Q250 360 214 372 Z" fill="#EAF1F8" />
        <path d="M168 392 Q120 440 150 540 Q160 552 176 546 Q168 470 210 426 Z" fill="url(#p-cardigan)" />
        <ellipse cx="172" cy="548" rx="26" ry="22" fill="url(#p-skin)" />
      </g>

      <path d="M300 392 Q360 380 470 392 L476 452 Q380 470 306 452 Z" fill="url(#p-cardigan)" />
      <path d="M452 388 Q470 392 476 452 L452 452 Z" fill="#6E87A1" />
      <path d="M470 396 Q580 398 650 416 Q664 430 656 446 Q585 470 476 452 Z" fill="url(#p-skin)" />
      <g>
        <ellipse cx="656" cy="432" rx="30" ry="26" fill="url(#p-skin)" />
        <path d="M676 420 q26 -2 40 4 q6 4 0 10 q-22 6 -42 2 Z" fill="url(#p-skin)" />
        <path d="M676 432 q28 0 44 6 q6 4 0 10 q-24 6 -46 0 Z" fill="url(#p-skin)" />
        <path d="M674 446 q24 2 38 10 q5 5 -1 9 q-20 4 -40 -4 Z" fill="url(#p-skin)" />
      </g>

      <g style={{ transformOrigin: "250px 280px", transform: `translateY(${headBob}px) rotate(${headTilt}deg)` }}>
        <path d="M222 350 L222 378 Q250 392 280 378 L280 350 Z" fill="url(#p-skin)" />
        <ellipse cx="250" cy="250" rx="96" ry="98" fill="#C9D2DC" />
        <path d="M176 252 Q176 180 250 178 Q324 180 324 252 Q324 320 250 336 Q176 320 176 252 Z" fill="url(#p-skin)" />
        <path d="M172 244 Q172 168 250 164 Q330 166 330 246 Q310 206 250 204 Q196 206 172 244 Z" fill="#D5DCE4" />
        <path d="M172 244 Q190 220 214 220 Q198 236 196 258 Q182 252 172 244 Z" fill="#C2CBD6" />
        <ellipse cx="206" cy="276" rx="18" ry="12" fill="rgba(77,166,255,0.10)" />
        <ellipse cx="294" cy="276" rx="18" ry="12" fill="rgba(77,166,255,0.10)" />
        <g stroke="#5E7791" strokeWidth="4" fill="none">
          <rect x="196" y="244" width="46" height="34" rx="12" fill="rgba(255,255,255,0.25)" />
          <rect x="258" y="244" width="46" height="34" rx="12" fill="rgba(255,255,255,0.25)" />
          <path d="M242 258 L258 258" />
          <path d="M196 256 L178 250" />
          <path d="M304 256 L322 250" />
        </g>
        <ellipse cx="219" cy="262" rx="5.5" ry="6.5" fill="#3A3A40" />
        <ellipse cx="281" cy="262" rx="5.5" ry="6.5" fill="#3A3A40" />
        <path d="M222 302 Q250 320 278 302" stroke="#B07A5C" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>

      {bp > 0 && (
        <g style={{ transformOrigin: "390px 422px", transform: `scaleY(${cuffPulse})` }}>
          <rect
            x={interpolate(cuffWrap, [0, 1], [392, 322], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            y="386"
            width={interpolate(cuffWrap, [0, 1], [0, 150], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            height="74"
            rx="14"
            fill="url(#p-cuff)"
            opacity="0.95"
          />
          {cuffWrap > 0.9 && (
            <>
              <rect x="322" y="386" width="150" height="74" rx="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
              <rect x="334" y="400" width={120 * inflate} height="8" rx="4" fill="rgba(255,255,255,0.55)" />
              <path d="M396 460 Q404 520 452 548" stroke={PALETTE.blue} strokeWidth="6" fill="none" />
              <g style={{ transformOrigin: "470px 556px", transform: `scale(${bulbSquish})` }}>
                <ellipse cx="470" cy="556" rx="26" ry="34" fill="url(#p-cuff)" />
              </g>
            </>
          )}
        </g>
      )}

      {spo2 > 0 && (
        <g opacity={interpolate(spo2, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
          <rect x="708" y="416" width="40" height="30" rx="8" fill={PALETTE.white} stroke={PALETTE.blue} strokeWidth="3" />
          <rect x="712" y="422" width="28" height="6" rx="3" fill={PALETTE.sky} />
          <circle cx="728" cy="404" r={4 + Math.abs(Math.sin((frame / fps) * Math.PI * 2.4)) * 4} fill={PALETTE.blue} opacity="0.8" />
        </g>
      )}

      {glucose > 0 && (
        <g
          opacity={interpolate(glucose, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          transform={`translate(${interpolate(glucose, [0, 1], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} 0)`}
        >
          <rect x="700" y="470" width="46" height="78" rx="12" fill="#27384C" />
          <rect x="706" y="478" width="34" height="24" rx="5" fill={PALETTE.sky} />
          <circle cx="723" cy="468" r="4" fill={PALETTE.blue} />
          <circle cx="700" cy="452" r="5" fill={PALETTE.navy} />
        </g>
      )}
    </svg>
  );
};

// ── Doctor (white coat, stethoscope) — from Scene04Doctor ─────────────────────
export const Doctor: React.FC<{ height?: number }> = ({ height = 760 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = (height / 760) * 520;
  const breathe = 1 + Math.sin((frame / fps) * Math.PI * 0.6) * 0.016;
  const headBob = Math.sin((frame / fps) * Math.PI * 0.5) * 1.1;
  const sway = noise2D("doc-sway", frame * 0.005, 0) * 3;
  return (
    <svg width={w} height={height} viewBox="0 0 520 760" style={{ transform: `translateX(${sway}px)`, overflow: "visible" }}>
      <defs>
        <linearGradient id="d-coat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E4ECF5" />
        </linearGradient>
        <linearGradient id="d-coat-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(150,170,195,0)" />
          <stop offset="100%" stopColor="rgba(120,145,175,0.22)" />
        </linearGradient>
        <linearGradient id="d-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E9B591" />
          <stop offset="100%" stopColor="#D9A079" />
        </linearGradient>
        <linearGradient id="d-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PALETTE.sky} />
          <stop offset="100%" stopColor={PALETTE.blue} />
        </linearGradient>
        <filter id="d-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="rgba(30,60,100,0.16)" />
        </filter>
      </defs>

      <ellipse cx="260" cy="744" rx="210" ry="26" fill="rgba(30,60,100,0.12)" />

      <g style={{ transformOrigin: "260px 470px", transform: `scaleY(${breathe})` }} filter="url(#d-shadow)">
        <path d="M150 760 Q118 460 206 408 L314 408 Q402 460 370 760 Z" fill="url(#d-coat)" />
        <path d="M260 408 L260 760" stroke="#DCE6F0" strokeWidth="2" />
        <path d="M150 760 Q118 460 206 408 L260 408 L260 760 Z" fill="url(#d-coat-shade)" opacity="0.6" />
        <path d="M214 410 L260 520 L240 410 Z" fill="#EEF3F9" />
        <path d="M306 410 L260 520 L280 410 Z" fill="#EEF3F9" />
        <path d="M236 408 L260 470 L284 408 Z" fill="url(#d-shirt)" />
        <circle cx="260" cy="560" r="4" fill="#C7D3E0" />
        <circle cx="260" cy="610" r="4" fill="#C7D3E0" />
        <rect x="300" y="560" width="56" height="44" rx="6" fill="#EEF3F9" stroke="#D6E0EB" strokeWidth="2" />
        <rect x="318" y="552" width="6" height="34" rx="3" fill={PALETTE.blue} />
        <path d="M206 412 Q150 462 170 600 Q182 612 198 604 Q190 500 236 452 Z" fill="url(#d-coat)" />
        <path d="M314 412 Q370 462 350 600 Q338 612 322 604 Q330 500 284 452 Z" fill="url(#d-coat)" />
        <path d="M226 416 Q220 520 268 548 Q316 520 310 426" stroke="#2C3A4E" strokeWidth="7" fill="none" strokeLinecap="round" />
        <circle cx="268" cy="556" r="15" fill="#7C8BA0" stroke="#2C3A4E" strokeWidth="3" />
        <circle cx="226" cy="414" r="6" fill="#2C3A4E" />
        <circle cx="310" cy="424" r="6" fill="#2C3A4E" />
      </g>

      <g style={{ transformOrigin: "260px 300px", transform: `translateY(${headBob}px)` }}>
        <path d="M236 404 L236 368 L284 368 L284 404 Q260 416 236 404 Z" fill="url(#d-skin)" />
        <ellipse cx="260" cy="296" rx="80" ry="84" fill="#2C2622" />
        <path d="M194 296 Q194 224 260 222 Q326 224 326 296 Q326 366 260 380 Q194 366 194 296 Z" fill="url(#d-skin)" />
        <path d="M192 290 Q192 220 260 216 Q330 218 330 292 Q306 252 260 250 Q214 252 192 290 Q188 268 192 290 Z" fill="#2C2622" />
        <g stroke="#2C3A4E" strokeWidth="4" fill="none">
          <rect x="206" y="288" width="44" height="34" rx="11" fill="rgba(255,255,255,0.22)" />
          <rect x="270" y="288" width="44" height="34" rx="11" fill="rgba(255,255,255,0.22)" />
          <path d="M250 302 L270 302" />
          <path d="M206 300 L188 294" />
          <path d="M314 300 L332 294" />
        </g>
        <ellipse cx="228" cy="306" rx="5.5" ry="6.5" fill="#2C2420" />
        <ellipse cx="292" cy="306" rx="5.5" ry="6.5" fill="#2C2420" />
        <path d="M240 340 Q260 354 280 340" stroke="#B07A5C" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};

// ── Adult child smiling at their phone — from Scene05Family ────────────────────
export const PersonWithPhone: React.FC<{ height?: number }> = ({ height = 520 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const w = (height / 520) * 300;
  const breathe = 1 + Math.sin((frame / fps) * Math.PI * 0.7) * 0.018;
  const nod = Math.sin((frame / fps) * Math.PI * 0.5) * 1.4;
  const phoneGlow = 0.5 + Math.sin((frame / fps) * Math.PI * 1.6) * 0.3;
  return (
    <svg width={w} height={height} viewBox="0 0 300 520" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="pp-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F1C6A2" />
          <stop offset="100%" stopColor="#E3AE86" />
        </linearGradient>
        <linearGradient id="pp-shirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={PALETTE.sky} />
          <stop offset="100%" stopColor={PALETTE.blue} />
        </linearGradient>
        <filter id="pp-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="rgba(30,60,100,0.16)" />
        </filter>
      </defs>
      <ellipse cx="150" cy="506" rx="120" ry="16" fill="rgba(30,60,100,0.12)" />
      <path d="M118 360 L104 496 Q104 508 118 508 L142 508 Q150 508 150 498 L150 360 Z" fill="#3C4A5E" />
      <path d="M150 360 L150 498 Q150 508 162 508 L186 508 Q196 508 194 496 L182 360 Z" fill="#46566B" />
      <g style={{ transformOrigin: "150px 250px", transform: `scaleY(${breathe})` }} filter="url(#pp-shadow)">
        <path d="M92 380 Q80 250 150 232 Q220 250 208 380 Z" fill="url(#pp-shirt)" />
        <path d="M208 256 Q236 300 220 360 Q210 370 200 362 Q206 310 178 276 Z" fill="url(#pp-shirt)" />
        <path d="M96 262 Q70 300 96 344 Q120 356 140 344 L150 318 Q120 300 118 272 Z" fill="url(#pp-shirt)" />
        <ellipse cx="146" cy="336" rx="20" ry="16" fill="url(#pp-skin)" />
      </g>
      <g transform="translate(120 296) rotate(-12)">
        <rect x="0" y="0" width="64" height="100" rx="12" fill="#1A2330" filter="url(#pp-shadow)" />
        <rect x="5" y="6" width="54" height="88" rx="8" fill={PALETTE.bg} />
        <rect x="14" y="20" width="36" height="7" rx="3" fill={PALETTE.blue} opacity={phoneGlow + 0.4} />
        <rect x="14" y="34" width="46" height="5" rx="2.5" fill="rgba(21,101,216,0.3)" />
        <rect x="14" y="44" width="40" height="5" rx="2.5" fill="rgba(21,101,216,0.22)" />
        <rect x="14" y="62" width="46" height="14" rx="7" fill={PALETTE.sky} opacity="0.85" />
      </g>
      <g style={{ transformOrigin: "150px 200px", transform: `rotate(${10 + nod}deg)` }}>
        <path d="M138 230 L138 256 L166 256 L166 230 Q152 240 138 230 Z" fill="url(#pp-skin)" />
        <ellipse cx="150" cy="170" rx="58" ry="60" fill="#2C2622" />
        <path d="M104 174 Q104 120 150 118 Q196 120 196 174 Q196 226 150 236 Q104 226 104 174 Z" fill="url(#pp-skin)" />
        <path d="M104 170 Q104 116 150 114 Q198 116 198 172 Q176 140 150 138 Q120 140 104 170 Z" fill="#2C2622" />
        <ellipse cx="132" cy="180" rx="5" ry="6" fill="#2C2420" />
        <ellipse cx="170" cy="180" rx="5" ry="6" fill="#2C2420" />
        <path d="M132 202 Q150 216 170 202" stroke="#B07A5C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};
