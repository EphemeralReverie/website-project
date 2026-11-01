"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { STRIPE_PAYMENT_LINK, type Project } from "@/lib/projects";

const STORAGE_KEY = "unlocked_film_slug";

type PlayerInstance = {
  on: (event: string, cb: (data?: unknown) => void) => void;
  play: () => void;
  pause: () => void;
};
type PlayerJS = { Player: new (el: HTMLIFrameElement) => PlayerInstance };

export default function WatchPlayer({ project }: { project: Project }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<PlayerInstance | null>(null);
  // The PlayerJS callback outlives renders, so the live value is kept in a ref.
  const unlockedRef = useRef(false);

  const [unlocked, setUnlocked] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [amount, setAmount] = useState("0");
  const [warning, setWarning] = useState(false);

  const markUnlocked = useCallback(() => {
    unlockedRef.current = true;
    setUnlocked(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, project.slug);
    } catch {
      /* storage unavailable (private mode) — still unlocked for this visit */
    }
  }, [project.slug]);

  // Unlocked via ?unlocked=true (Stripe return URL) or previously stored.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    const fromQuery =
      new URLSearchParams(window.location.search).get("unlocked") === "true";
    if (fromQuery || stored === project.slug) {
      markUnlocked();
    }
  }, [project.slug, markUnlocked]);

  const initPlayer = useCallback(() => {
    const w = window as unknown as { playerjs?: PlayerJS };
    if (playerRef.current || !w.playerjs || !iframeRef.current) return;
    const player = new w.playerjs.Player(iframeRef.current);
    playerRef.current = player;
    player.on("ready", () => {
      player.on("play", () => {
        if (!unlockedRef.current) {
          player.pause();
          setShowOverlay(true);
        }
      });
    });
  }, []);

  useEffect(() => {
    initPlayer(); // script may already be loaded from an earlier navigation
  }, [initPlayer]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = amount.trim().replace(/^\$/, "").replace(",", ".");
    const value = raw === "" ? 0 : Number(raw);
    const cents = Number.isFinite(value) ? Math.round(value * 100) : 0;

    // 0, blank or invalid → free viewing
    if (cents <= 0) {
      setWarning(false);
      markUnlocked();
      setShowOverlay(false);
      playerRef.current?.play();
      return;
    }
    // $0.01 – $1.99 → below the minimum
    if (cents < 200) {
      setWarning(true);
      return;
    }
    // $2.00+ → Stripe. Both spellings of the prefill parameter are sent;
    // Stripe ignores whichever it doesn't recognise.
    window.location.href = `${STRIPE_PAYMENT_LINK}?prefilledamount=${cents}&prefilled_amount=${cents}`;
  };

  const src = `https://player.mediadelivery.net/embed/${project.libraryId}/${project.videoId}?autoplay=false&loop=false&muted=false&preload=false&responsive=false`;

  return (
    <>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl shadow-black/60">
        <iframe
          ref={iframeRef}
          src={src}
          title={project.title}
          loading="lazy"
          style={{ border: 0, position: "absolute", top: 0, height: "100%", width: "100%" }}
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen;"
          allowFullScreen
        />

        {showOverlay && !unlocked && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-title"
            className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xl"
          >
            <form
              onSubmit={submit}
              noValidate
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8"
            >
              <h2 id="support-title" className="text-xl font-medium tracking-tight">
                Support this Short Film
              </h2>

              <label className="mt-6 block text-left">
                <span className="font-tech text-[11px] uppercase tracking-[0.15em] text-white/60">
                  Contribution (USD)
                </span>
                <div className="mt-2 flex items-center rounded-lg border border-white/15 bg-black/30 px-3 focus-within:border-white/50">
                  <span className="text-white/60">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setWarning(false);
                    }}
                    className="w-full bg-transparent px-2 py-3 text-white outline-none"
                    autoFocus
                  />
                </div>
              </label>

              <p
                role="alert"
                className={`mt-3 text-sm text-amber-300 ${warning ? "" : "hidden"}`}
              >
                Please enter at least $2.00 for a contribution, or enter $0
              </p>

              <button
                type="submit"
                className="mt-6 w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-white/85"
              >
                Continue &amp; Watch
              </button>
            </form>
          </div>
        )}
      </div>

      <Script
        src="https://iframe.mediadelivery.net/player.js"
        strategy="afterInteractive"
        onReady={initPlayer}
      />
    </>
  );
}
