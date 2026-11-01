"use client";

import { useEffect, useRef, useState } from "react";
import { loadPlayerJS } from "@/lib/playerjs";

// ---------------------------------------------------------------------------
// Hero background loop — three ways to play it, fastest first:
//
//  1. "mp4"    A plain <video> pointed at Bunny's MP4 files. It is part of the
//              server-rendered page, so it starts downloading immediately, needs
//              no JavaScript and has no player interface at all (so no play
//              button can ever appear). Requires "MP4 Fallback" to be switched
//              on for the library in Bunny; if it isn't, this fails instantly...
//  2. "hls"    ...and we play Bunny's HLS stream in a plain <video> instead
//              (hls.js, or natively in Safari). Same: no interface, no button.
//  3. "iframe" Last resort: the official Bunny embed, with a cover that hides
//              its start-up play button until the video is really playing.
// ---------------------------------------------------------------------------

const VIDEO_ID = "9c08378f-8829-488b-873b-adaf290b5354";
const CDN = "https://vz-8b01c340-1ec.b-cdn.net"; // Bunny Stream pull zone
// Best quality first: the browser uses the first file that exists and plays, so
// a missing 1080p file simply falls through to 720p, then 480p.
const MP4_BY_HEIGHT = [1080, 720, 480].map((h) => `${CDN}/${VIDEO_ID}/play_${h}p.mp4`);
const MP4_SOURCES = MP4_BY_HEIGHT;
// Phones and "data saver" users start at 720p instead, to avoid a heavy download.
const MP4_LITE = MP4_BY_HEIGHT.slice(1);
const HLS_SRC = `${CDN}/${VIDEO_ID}/playlist.m3u8`;
const POSTER_SRC = `${CDN}/${VIDEO_ID}/thumbnail_2b5209f9.jpg`;
const IFRAME_SRC =
  `https://player.mediadelivery.net/embed/792798/${VIDEO_ID}` +
  "?autoplay=true&loop=true&muted=true&controls=false&preload=true&responsive=false";

type Mode = "mp4" | "hls" | "iframe";

export default function HeroVideo() {
  const [mode, setMode] = useState<Mode>("mp4");
  if (mode === "iframe") return <IframeHero />;
  return (
    <DirectHero
      key={mode}
      mode={mode}
      onFail={() => setMode(mode === "mp4" ? "hls" : "iframe")}
    />
  );
}

/* ------------------------------ direct <video> ----------------------------- */

function DirectHero({ mode, onFail }: { mode: "mp4" | "hls"; onFail: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let alive = true;
    let hls: { destroy: () => void } | undefined;
    const timers: number[] = [];
    const fail = () => alive && onFail();

    video.muted = true;
    video.defaultMuted = true;
    const tryPlay = () => void video.play().catch(() => {
      /* autoplay refused (e.g. iOS low-power mode): the poster stays visible */
    });
    const stopWatching = () => timers.forEach((t) => window.clearTimeout(t));
    video.addEventListener("playing", stopWatching);

    if (mode === "mp4") {
      const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData;
      const small = window.matchMedia("(max-width: 820px)").matches || !!saveData;
      if (small) {
        // Swap the 1080p-first list for a 720p-first one before much has downloaded.
        let i = 0;
        const next = () => {
          video.src = MP4_LITE[i++];
          video.load();
          tryPlay();
        };
        video.addEventListener("error", () => (i < MP4_LITE.length ? next() : fail()));
        next();
      }
      // Every <source> failed? (404 because MP4 Fallback is off, or not decodable.)
      // The error can happen before this code runs, so look at the state too.
      const check = () => {
        if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE && !small) fail();
      };
      check();
      timers.push(window.setInterval(check, 300));
      timers.push(window.setTimeout(fail, 6000)); // nothing playing after 6s
      tryPlay();
    } else {
      timers.push(window.setTimeout(fail, 7000));
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari / iOS play HLS natively
        video.addEventListener("error", fail);
        video.src = HLS_SRC;
        tryPlay();
      } else {
        import("hls.js")
          .then(({ default: Hls }) => {
            if (!alive) return;
            if (!Hls.isSupported()) return fail();
            // Start from a good estimate of bandwidth (not the lowest quality) and
            // never go beyond what the screen can show.
            const h = new Hls({
              capLevelToPlayerSize: true,
              abrEwmaDefaultEstimate: 8_000_000,
              maxBufferLength: 12,
            });
            hls = h;
            h.on(Hls.Events.ERROR, (_e, data) => data.fatal && fail());
            h.on(Hls.Events.MANIFEST_PARSED, tryPlay);
            h.loadSource(HLS_SRC);
            h.attachMedia(video);
          })
          .catch(fail);
      }
    }

    return () => {
      alive = false;
      timers.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
      video.removeEventListener("playing", stopWatching);
      video.removeEventListener("error", fail);
      hls?.destroy();
    };
  }, [mode, onFail]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER_SRC}
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
      >
        {mode === "mp4" && MP4_SOURCES.map((src) => <source key={src} src={src} />)}
      </video>
    </div>
  );
}

/* --------------------------------- iframe ---------------------------------- */

// Start fetching Player.js as soon as this module runs, not after hydration.
if (typeof window !== "undefined") void loadPlayerJS();

function IframeHero() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);

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
      // The iframe may already have loaded before this code ran, so don't wait
      // for its onload event: allow messages now and keep asking until it answers.
      (player as unknown as { loaded: boolean }).loaded = true;
      const onReady = () => {
        if (ready) return;
        ready = true;
        window.clearInterval(poll);
        player.mute();
        player.setLoop(true);
        player.play();
        player.on("play", () => {
          window.clearTimeout(revealTimer);
          revealTimer = window.setTimeout(reveal, 1200);
        });
        player.on("timeupdate", (value) => {
          const seconds = (value as { seconds?: number } | undefined)?.seconds;
          if (typeof seconds === "number" && seconds > 0.2) reveal();
        });
      };
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
          src={IFRAME_SRC}
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={POSTER_SRC}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </div>
    </div>
  );
}
