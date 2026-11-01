import SocialLinks from "@/components/social-links";

/**
 * Tagline (bottom-left) + social icons (bottom-right). Fixed to the viewport
 * and rendered from the root layout, so they are visible on every page.
 */
export default function SiteFooter() {
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3 bg-gradient-to-t from-slate-950/55 via-slate-950/20 to-transparent p-4 pt-10 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-end sm:justify-between sm:p-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <p className="font-tech text-[12px] uppercase leading-snug tracking-[0.06em] text-white [text-shadow:0_1px_10px_rgb(0_0_0/0.65)]">
        BRIDGING HUMAN VISION AND MACHINE RENDERING
      </p>
      <div className="pointer-events-auto self-end">
        <SocialLinks />
      </div>
    </footer>
  );
}
