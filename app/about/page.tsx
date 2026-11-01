import type { Metadata } from "next";
import { AuroraBackground } from "@/components/ui/aurora-background";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white flex flex-col justify-between">
      <AuroraBackground />

      <main className="font-tech relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-40 flex flex-col items-center text-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl max-w-2xl w-full mt-12">
          <h1 className="text-2xl tracking-tight md:text-3xl">
            About Ephemeral Reverie
          </h1>
          <div className="mt-6 space-y-5 text-sm leading-relaxed text-white/85 md:text-[15px]">
            <p>
              Ephemeral Reverie refers to that transient space where mind and
              imagination align. Founded by Nicolai, the studio exists to
              capture those fleeting moments and manifest them into cinema.
            </p>
            <p>
              With a degree in Film &amp; Media Science from the University of
              Copenhagen and extensive experience in traditional filmmaking,
              Nicolai now fully operates at the intersection of classical
              cinematography and generative AI.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/image3.png"
            alt="Nicolai, founder of Ephemeral Reverie"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-none outline-none ring-0 mt-8 mx-auto"
          />
        </div>
      </main>
    </div>
  );
}
