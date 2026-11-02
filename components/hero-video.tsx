// Full-bleed 16:9 background loop, played by Bunny.net's own embedded player —
// Bunny decides the quality. The iframe is sized to "cover" the viewport (never
// distorted, the overflow is cropped), is muted and looping, has the player
// controls switched off, and has pointer events disabled so it can't be clicked.
//
// A black layer sits on top for the first half second and then fades away
// (CSS only, see `.hero-cover` in globals.css). It hides the moment where
// Bunny's own start-up play button may show. It does not touch the video: the
// player still streams straight from Bunny at the quality Bunny chooses.

const HERO_SRC =
  "https://player.mediadelivery.net/embed/792798/9c08378f-8829-488b-873b-adaf290b5354" +
  "?autoplay=true&loop=true&muted=true&controls=false&preload=true&responsive=false";

export default function HeroVideo() {
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
      <div aria-hidden="true" className="hero-cover pointer-events-none absolute inset-0 bg-black" />
    </div>
  );
}
