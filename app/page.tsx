import HeroVideo from "@/components/hero-video";

export default function Home() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-black text-white">
      <HeroVideo />
      {/* subtle scrims keep the small overlay text legible over any frame */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-transparent to-black/25" />
    </main>
  );
}
