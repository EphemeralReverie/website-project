import HeroVideo from "@/components/hero-video";
import SiteHeader from "@/components/site-header";
import SocialLinks from "@/components/social-links";

export default function Home() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-black text-white">
      <HeroVideo />

      {/* subtle scrims keep the small overlay text legible over any frame */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-transparent to-black/25" />

      <SiteHeader />

      <p className="font-tech absolute bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 z-20 max-w-full p-4 text-[12px] uppercase leading-snug tracking-[0.06em] text-white sm:bottom-0 sm:max-w-[min(55vw,34rem)] sm:p-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        BRIDGING HUMAN VISION AND MACHINE RENDERING
      </p>

      <div className="absolute bottom-0 right-0 z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SocialLinks />
      </div>
    </main>
  );
}
