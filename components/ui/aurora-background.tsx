// AuroraBackground — adapted from the 21st.dev "Aurora Background" component.
//
// Only the visual effect is kept: the demo's headline, button, framer-motion
// animation and wrapper layout are gone, and so is every interactive hook.
// It is pure CSS (see `.aurora-layer` in app/globals.css) — no canvas, no
// JavaScript, no pointer/touch listeners — so it animates on its own loop,
// scales to any viewport by itself, and cannot intercept clicks or touches.

export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-zinc-900 ${className}`}
    >
      <div className="aurora-layer" />
    </div>
  );
}

export default AuroraBackground;
