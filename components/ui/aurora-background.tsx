"use client";

// AuroraBackground — the 21st.dev "Aurora Background" (dark variant), shown as a
// pre-rendered seamless 40-second loop.
//
// Why a video? The original is a full-screen CSS gradient with a blur filter and
// a blend mode that the browser has to repaint every frame. That is smooth on a
// fast graphics card but very laggy without one (or with hardware acceleration
// turned off). The loop in /public/aurora was recorded frame-by-frame from the
// real CSS (see the `.aurora-*` rules in app/globals.css), so it looks the same,
// but playing a small looping video is cheap for any computer.
//
// Only the visual effect is kept: no text, no buttons and no mouse, touch or
// hover handling of any kind. If the video can't be played, the live CSS version
// is used instead.

import { useEffect, useState } from "react";

type Variant = "landscape" | "portrait";

const base = (v: Variant) => `/aurora/aurora-${v}`;

function CssAurora() {
  return (
    <div className="aurora-layer">
      <div className="aurora-blend">
        <div className="aurora-stripes" />
      </div>
    </div>
  );
}

export function AuroraBackground({ className = "" }: { className?: string }) {
  const [variant, setVariant] = useState<Variant | null>(null);
  const [reduced, setReduced] = useState(false);
  const [useCss, setUseCss] = useState(false);

  useEffect(() => {
    const portrait = window.matchMedia("(orientation: portrait)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setVariant(portrait.matches ? "portrait" : "landscape");
      setReduced(motion.matches);
    };
    update();
    portrait.addEventListener("change", update);
    motion.addEventListener("change", update);
    return () => {
      portrait.removeEventListener("change", update);
      motion.removeEventListener("change", update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-zinc-900 ${className}`}
    >
      {variant && useCss && <CssAurora />}
      {variant && !useCss && reduced && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${base(variant)}.jpg`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setUseCss(true)}
        />
      )}
      {variant && !useCss && !reduced && (
        <video
          key={variant}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={`${base(variant)}.jpg`}
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
        >
          <source src={`${base(variant)}.mp4`} type="video/mp4" />
          <source src={`${base(variant)}.webm`} type="video/webm" onError={() => setUseCss(true)} />
        </video>
      )}
    </div>
  );
}

export default AuroraBackground;
