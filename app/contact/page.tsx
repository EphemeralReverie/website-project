import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";
import SiteHeader from "@/components/site-header";
import { ShaderBackground } from "@/components/ui/shader-state";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <ShaderBackground className="absolute inset-0 z-0 h-full w-full pointer-events-none" />
      <SiteHeader />

      <main className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-6 pb-6 pt-28 sm:pt-32">
        <h1 className="font-tech mb-8 text-xs uppercase tracking-[0.3em] text-white/70">
          Contact
        </h1>
        <ContactForm />
      </main>

      {/* Deliberately NOT inside the z-10 wrapper: a z-indexed ancestor creates
          its own stacking context and would stop `mix-blend-screen` from
          blending with the shader canvas. Being positioned and later in tree
          order, it still paints above the background. The logo is white on
          black, so `screen` makes the black vanish. */}
      <div className="relative flex justify-center px-6 pb-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/image1.jpg"
          alt="Ephemeral Reverie"
          className="w-full max-w-md mix-blend-screen contrast-150 select-none"
          draggable={false}
        />
      </div>
    </div>
  );
}
