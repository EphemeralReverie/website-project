"use client";

import { useEffect, useRef, useState } from "react";
import { loadPlayerJS, type PlayerJS } from "@/lib/playerjs";

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
 * The Bunny player briefly shows its own play button / poster before
 * autoplay kicks in. That UI lives inside a cross-origin iframe and can't be
 * styled, so a black cover sits on top and fades out only once the video
 * reports that it is actually playing.
 */
export default function HeroVideo() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [lib, setLib] = useState<PlayerJS | null | undefined>(undefined); // undefined = still loading
  const [playing, setPlaying] = useState(false);
  const [posterOk, setPosterOk] = useState(true);
  const posterRef = useRef<HTMLImageElement>(null);

  // The poster can fail before hydration (no onError handler attached yet).
  useEffect(() => {
    const img = posterRef.current;
    if (img && img.complete && img.naturalWidth === 0) setPosterOk(false);
  }, []);

  // The iframe is only created once the Player.js library is ready, so the
  // library can attach to it before it finishes loading.
  useEffect(() => {
    let alive = true;
    loadPlayerJS().then((l) => alive && setLib(l));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (lib === undefined) return;
    let revealTimer = 0;
    const reveal = () => {
      window.clearTimeout(revealTimer);
      setPlaying(true);
    };
    // Failsafe: never keep the cover up for long if the player can't report in.
    const failsafe = window.setTimeout(reveal, 4000);
    if (lib && iframeRef.current) {
      const player = new lib.Player(iframeRef.current);
      player.on("ready", () => {
        player.mute();
        player.setLoop(true);
        player.play();
        // "play" can fire while Bunny's own play button is still on screen,
        // so don't lift the cover on it straight away. Lift it as soon as the
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
      });
    }
    return () => {
      window.clearTimeout(failsafe);
      window.clearTimeout(revealTimer);
    };
  }, [lib]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "max(100vw, calc(100dvh * 16 / 9))",
          height: "max(100dvh, calc(100vw * 9 / 16))",
        }}
      >
        {lib !== undefined && (
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
        )}
      </div>
      {/* Cover: hides Bunny's own start-up UI (play button) until the video is
          really playing. It shows the video's thumbnail so the screen is never
          just black while the player loads. */}
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
