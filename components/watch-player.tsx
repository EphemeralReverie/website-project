"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { loadPlayerJS, type PlayerJSPlayer } from "@/lib/playerjs";
import { STRIPE_PAYMENT_LINK, type Project } from "@/lib/projects";

const STORAGE_KEY = "unlocked_film_slug";
const MIN_CENTS = 200; // $2.00

export default function WatchPlayer({ project }: { project: Project }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerJSPlayer | null>(null);
  // PlayerJS callbacks outlive renders, so the live value is kept in a ref.
  const unlockedRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [amount, setAmount] = useState("0");
  const [warning, setWarning] = useState(false);
  const [shield, setShield] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const markUnlocked = useCallback(() => {
    unlockedRef.current = true;
    setUnlocked(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, project.slug);
    } catch {
      /* storage unavailable (private mode) — still unlocked for this visit */
    }
  }, [project.slug]);

  // 1) Unlocked via ?unlocked=true (Stripe return URL) or a previous unlock.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    const fromQuery = new URLSearchParams(window.location.search).get("unlocked") === "true";
    if (fromQuery || stored === project.slug || stored === "true") markUnlocked();
  }, [project.slug, markUnlocked]);

  // 2) Attach Player.js to the (server-rendered) iframe and watch for "play".
  //    The video frame itself never waits for this helper, so if the helper is
  //    slow or blocked the film still shows. The helper keeps asking the player
  //    to report in until it does, so it doesn't matter who gets there first.
  useEffect(() => {
    let alive = true;
    let isReady = false;
    let attempts = 0;
    let poll = 0;
    loadPlayerJS().then((lib) => {
      const iframe = iframeRef.current;
      if (!alive || !lib || !iframe) return;
      const player = new lib.Player(iframe);
      playerRef.current = player;
      // The iframe may already have loaded before this code ran, so don't wait
      // for its onload event: allow messages now.
      (player as unknown as { loaded: boolean }).loaded = true;
      const gate = () => {
        if (unlockedRef.current) return;
        player.pause(); // the exact moment play starts, stop it…
        setShowOverlay(true); // …and ask for support
      };
      const onReady = () => {
        if (isReady) return;
        isReady = true;
        window.clearInterval(poll);
        setReady(true);
        player.on("play", gate);
        player.on("timeupdate", gate); // safety net if "play" is missed
      };
      player.on("ready", onReady);
      poll = window.setInterval(() => {
        if (isReady || ++attempts > 40) return window.clearInterval(poll);
        player.on("ready", onReady);
      }, 400);
    });
    return () => {
      alive = false;
      window.clearInterval(poll);
    };
  }, []);

  // 3) Safari on Mac can leave a video frame unpainted (black) until something
  //    forces a redraw — zooming or resizing the window does. Do the same
  //    automatically: shrink the box by 1px for one frame, then restore it.
  //    Invisible, and the video itself is not touched or reloaded.
  const nudge = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    box.style.width = "calc(100% - 1px)";
    requestAnimationFrame(() => {
      box.style.width = "";
    });
  }, []);
  useEffect(() => {
    const timers = [200, 800, 2000, 4000].map((ms) => window.setTimeout(nudge, ms));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [nudge]);

  // 4) Safety net: if the player never reports in (blocked script, protocol
  //    mismatch), put a transparent layer over it so a click still opens the
  //    overlay instead of silently letting the film play for free.
  useEffect(() => {
    if (ready || unlocked) return;
    const t = window.setTimeout(() => setShield(true), 3500);
    return () => window.clearTimeout(t);
  }, [ready, unlocked]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = amount.trim().replace(/^\$/, "").replace(",", ".");
    const value = raw === "" ? 0 : Number(raw);
    const cents = Number.isFinite(value) ? Math.round(value * 100) : 0;

    // 0, blank or invalid → free viewing, no redirect
    if (cents <= 0) {
      setWarning(false);
      markUnlocked();
      setShowOverlay(false);
      setShield(false);
      playerRef.current?.play();
      return;
    }
    // $0.01 – $1.99 → below the minimum
    if (cents < MIN_CENTS) {
      setWarning(true);
      return;
    }
    // $2.00 or more → Stripe, amount prefilled in cents
    window.location.href = `${STRIPE_PAYMENT_LINK}?prefilled_amount=${cents}`;
  };

  const src = `https://player.mediadelivery.net/embed/${project.libraryId}/${project.videoId}?autoplay=false&loop=false&muted=false&preload=false&responsive=false`;

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-title"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-xl"
    >
      <form
        onSubmit={submit}
        noValidate
        className="font-tech my-auto w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8"
      >
        <h2 id="support-title" className="text-lg tracking-tight">
          Support Ephemeral Reverie
        </h2>

        <label className="mt-6 block text-left">
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/70">
            Contribution (USD)
          </span>
          <div className="mt-2 flex items-center rounded-lg border border-white/20 bg-black/30 px-3 focus-within:border-white/60">
            <span className="text-white/70">$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setWarning(false);
              }}
              className="w-full bg-transparent px-2 py-3 text-base text-white outline-none placeholder:text-white/40"
            />
          </div>
        </label>

        <p role="alert" className={`mt-3 text-sm text-amber-300 ${warning ? "" : "hidden"}`}>
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
  );

  return (
    <div ref={boxRef} className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl shadow-black/60">
      <iframe
        ref={iframeRef}
        src={src}
        title={project.title}
        loading="eager"
        onLoad={nudge}
        style={{ border: 0, position: "absolute", top: 0, height: "100%", width: "100%" }}
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen;"
        allowFullScreen
      />

      {shield && !unlocked && !ready && (
        <button
          type="button"
          aria-label="Play"
          onClick={() => setShowOverlay(true)}
          className="absolute inset-0 z-10 cursor-pointer"
        />
      )}

      {/* rendered on <body> so it is never clipped by the 16:9 player box */}
      {mounted && showOverlay && !unlocked && createPortal(overlay, document.body)}
    </div>
  );
}
