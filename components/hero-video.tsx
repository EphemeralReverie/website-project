"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

const HERO_SRC =
  "https://player.mediadelivery.net/embed/792798/9c08378f-8829-488b-873b-adaf290b5354" +
  "?autoplay=true&loop=true&muted=true&preload=true&responsive=false";

type PlayerJS = {
  Player: new (el: HTMLIFrameElement) => {
    on: (event: string, cb: () => void) => void;
    mute: () => void;
    setLoop: (loop: boolean) => void;
    play: () => void;
  };
};

/**
 * Full-bleed 16:9 background loop. The iframe is sized to "cover" the viewport
 * (never distorted — the overflow is cropped), and has pointer-events disabled
 * so the Bunny player UI can never be hovered or clicked.
 */
export default function HeroVideo() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const started = useRef(false);

  const init = () => {
    const w = window as unknown as { playerjs?: PlayerJS };
    if (started.current || !w.playerjs || !iframeRef.current) return;
    started.current = true;
    const player = new w.playerjs.Player(iframeRef.current);
    // Belt and braces on top of the URL params: some mobile browsers only
    // honour autoplay once the player confirms it is muted.
    player.on("ready", () => {
      player.mute();
      player.setLoop(true);
      player.play();
    });
  };

  useEffect(() => {
    init(); // script may already be cached from a previous navigation
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
      <Script
        src="https://iframe.mediadelivery.net/player.js"
        strategy="afterInteractive"
        onReady={init}
      />
    </div>
  );
}
