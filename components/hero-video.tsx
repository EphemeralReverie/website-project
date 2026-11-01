"use client";

import { useEffect, useRef, useState } from "react";
import { loadPlayerJS, type PlayerJS } from "@/lib/playerjs";

const HERO_SRC =
  "https://player.mediadelivery.net/embed/792798/9c08378f-8829-488b-873b-adaf290b5354" +
  "?autoplay=true&loop=true&muted=true&preload=true&responsive=false";

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
    // Failsafe: never leave the screen black if the player can't report in.
    const failsafe = window.setTimeout(() => setPlaying(true), 6000);
    if (lib && iframeRef.current) {
      const player = new lib.Player(iframeRef.current);
      player.on("ready", () => {
        player.mute();
        player.setLoop(true);
        player.play();
        player.on("play", () => setPlaying(true));
        player.on("timeupdate", () => setPlaying(true));
      });
    }
    return () => window.clearTimeout(failsafe);
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-700"
        style={{ opacity: playing ? 0 : 1 }}
      />
    </div>
  );
}
