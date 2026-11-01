// Player.js (https://github.com/embedly/player.js, BSD) is the open protocol
// Bunny.net Stream's embed speaks over postMessage. It is bundled with the site
// rather than loaded from a third-party CDN, so it is always available *before*
// the video iframe is created (the library can only talk to an iframe that did
// not finish loading before the Player was constructed).

export type PlayerJSPlayer = {
  on: (event: string, cb: (value?: unknown) => void) => void;
  play: () => void;
  pause: () => void;
  mute: () => void;
  setLoop: (loop: boolean) => void;
};

export type PlayerJS = {
  Player: new (iframe: HTMLIFrameElement) => PlayerJSPlayer;
};

let pending: Promise<PlayerJS | null> | null = null;

/** Resolves to the library, or null if it could not be loaded. Browser only. */
export function loadPlayerJS(): Promise<PlayerJS | null> {
  if (!pending) {
    pending = import("player.js")
      .then((mod) => {
        const w = window as unknown as { playerjs?: PlayerJS };
        const lib = (mod as { default?: PlayerJS }).default ?? (mod as unknown as PlayerJS);
        return w.playerjs ?? (lib && lib.Player ? lib : null);
      })
      .catch(() => null);
  }
  return pending;
}
