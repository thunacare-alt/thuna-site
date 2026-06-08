// Ported from the Thuna Remotion project (palette/springs/type), de-Remotion-ised.
// The hero scenes keep their original white + blue clinical palette; the brand
// green/cream framing lives around the stage (see Hero.tsx / index.astro).

export const FONTS = {
  heading: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`,
  body: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`,
} as const;

export const PALETTE = {
  bg: "#F7FAFC",
  bgWarm: "#FFFFFF",
  white: "#FFFFFF",

  sky: "#4DA6FF",
  blue: "#1565D8",
  blueDeep: "#0E4DA8",
  navy: "#0F3D91",

  skySoft: "#A9D3FF",
  blueSoft: "#D7E7FB",
  navySoft: "#AFC0E2",
  blueWash: "rgba(21,101,216,0.10)",

  text: "#0F2742",
  textMuted: "rgba(15,39,66,0.5)",
  textFaint: "rgba(15,39,66,0.28)",

  glassBg: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(21,101,216,0.25)",
  glassShadow: "rgba(21,101,216,0.18)",

  morningGold: "rgba(255,234,198,0.55)",
  morningHaze: "rgba(255,242,224,0.5)",
  lightRay: "rgba(255,236,206,0.16)",
} as const;

export const GRADIENTS = {
  blue: `linear-gradient(135deg, ${PALETTE.blue} 0%, ${PALETTE.sky} 100%)`,
  blueDeep: `linear-gradient(135deg, ${PALETTE.navy} 0%, ${PALETTE.blue} 55%, ${PALETTE.sky} 100%)`,
  glass: `linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.6) 100%)`,
} as const;

export const SPRINGS = {
  snap: { damping: 22, stiffness: 200, mass: 0.7 },
  smooth: { damping: 18, stiffness: 100, mass: 1.0 },
  heavy: { damping: 28, stiffness: 70, mass: 1.8 },
  pop: { damping: 12, stiffness: 160, mass: 0.9 },
  counter: { damping: 100, stiffness: 200, mass: 1 },
  float: { damping: 40, stiffness: 30, mass: 2.0 },
  cinematic: { damping: 60, stiffness: 40, mass: 3.0 },
  elastic: { damping: 9, stiffness: 200, mass: 0.8 },
} as const;

export const TYPE = {
  h2: { fontSize: 78, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.08 },
  h3: { fontSize: 44, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.2 },
} as const;
