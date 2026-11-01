"use client";

import { useEffect, useRef, useState } from "react";
import { loadPlayerJS } from "@/lib/playerjs";

const HERO_SRC =
  "https://player.mediadelivery.net/embed/792798/9c08378f-8829-488b-873b-adaf290b5354" +
  "?autoplay=true&loop=true&muted=true&controls=false&preload=true&responsive=false";

// Bunny's auto-generated thumbnail of the hero video, shown while the player
// starts up (instead of a black screen). If it can't load, the cover simply
// stays black.
const POSTER_SRC =
  "https://vz-8b01c340-1ec.b-cdn.net/9c08378f-8829-488b-873b-adaf290b5354/thumbnail.jpg";

// Start fetching Player.js as soon as this module runs, not after hydration.
if (typeof window !== "undefined") void loadPlayerJS();

/**
 * Full-bleed 16:9 background loop. The iframe is sized to "cover" the viewport
 * (never distorted — the overflow is cropped) and has pointer-events disabled.
 *
 * Speed: the iframe is part of the server-rendered HTML, so the browser starts
 * loading the video the moment the page arrives, without waiting for any
 * JavaScript. Player.js attaches afterwards and keeps asking the player to
 * report in until it does, so it doesn't matter which one gets there first.
 *
 * Bunny's player shows its own play button before autoplay kicks in. That UI
 * lives inside a cross-origin iframe and can't be styled, so a cover (the
 * video's thumbnail on black) sits on top and fades out as soon as the video
 * is really playing.
 */
export default function HeroVideo() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const [playing, setPlaying] = useState(false);
  const [posterOk, setPosterOk] = useState(true);

  // The poster can fail before hydration (no onError handler attached yet).
  useEffect(() => {
    const img = posterRef.current;
    if (img && img.complete && img.naturalWidth === 0) setPosterOk(false);
  }, []);

  useEffect(() => {
    let alive = true;
    let ready = false;
    let attempts = 0;
    let poll = 0;
    let revealTimer = 0;
    const reveal = () => {
      window.clearTimeout(revealTimer);
      setPlaying(true);
    };
    // Failsafe: never keep the cover up for long if the player can't report in.
    const failsafe = window.setTimeout(reveal, 4000);

    loadPlayerJS().then((lib) => {
      const iframe = iframeRef.current;
      if (!alive || !lib || !iframe) return;
      const player = new lib.Player(iframe);
      // The iframe may already have loaded (and announced itself) before this
      // code ran, so don't wait for its onload event: allow messages now.
      (player as unknown as { loaded: boolean }).loaded = true;

      const onReady = () => {
        if (ready) return;
        ready = true;
        window.clearInterval(poll);
        player.mute();
        player.setLoop(true);
        player.play();
        // "play" can fire while Bunny's play button is still on screen, so
        // don't lift the cover on it straight away. Lift it as soon as the
        // video has actually advanced; if no time updates arrive, shortly
        // after "play" instead.
        player.on("play", () => {
          window.clearTimeout(revealTimer);
          revealTimer = window.setTimeout(reveal, 1200);
        });
        player.on("timeupdate", (value) => {
          const seconds = (value as { seconds?: number } | undefined)?.seconds;
          if (typeof seconds === "number" && seconds > 0.2) reveal();
        });
      };
      // Ask now, and keep asking until the player answers.
      player.on("ready", onReady);
      poll = window.setInterval(() => {
        if (ready || ++attempts > 20) return window.clearInterval(poll);
        player.on("ready", onReady);
      }, 400);
    });

    return () => {
      alive = false;
      window.clearTimeout(failsafe);
      window.clearTimeout(revealTimer);
      window.clearInterval(poll);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "max(100vw, calc(100dvh * 16 / 9))",
          height: "max(100dvh, calc(100vw * 9 / 16))",
        }}
      >
        <iframe
          ref={iframeRef}
          src={HERO_SRC}
          title="Ephemeral Reverie hero"
          loading="eager"
          tabIndex={-1}
          aria-hidden="true"
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
          style={{
            border: 0,
            position: "absolute",
            top: 0,
            height: "100%",
            width: "100%",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Cover: hides Bunny's own start-up UI (play button) until the video is
          really playing, and shows the video's thumbnail instead of black. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-700"
        style={{ opacity: playing ? 0 : 1 }}
      >
        {posterOk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={posterRef}
            src={POSTER_SRC}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
            onError={() => setPosterOk(false)}
          />
        )}
      </div>
    </div>
  );
}
