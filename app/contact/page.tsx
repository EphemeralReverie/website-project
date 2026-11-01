import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";
import { ShaderBackground } from "@/components/ui/shader-state";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <ShaderBackground className="absolute inset-0 z-0 h-full w-full pointer-events-none" />

      <main className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-6 pb-40 pt-28 sm:pt-32">
        <h1 className="font-tech mb-8 text-xs uppercase tracking-[0.3em] text-white/70">
          Contact
        </h1>
        <ContactForm />
        {/* image1.png is a transparent cut-out (lettering only), so it blends
            into the shader on any screen without blend modes. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/image1.png"
          alt="Ephemeral Reverie"
          className="mt-12 w-full max-w-md select-none"
          draggable={false}
        />
      </main>

    </div>
  );
}
