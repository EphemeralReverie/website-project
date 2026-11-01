import type { Metadata } from "next";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { projects } from "@/lib/projects";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      <AuroraBackground />

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-40 pt-28 sm:pt-32">
        <h1 className="font-tech mb-10 text-xs uppercase tracking-[0.3em] text-white/80">
          Projects
        </h1>

        <ul className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.slug}>
              <Link href={`/projects/${p.slug}`} className="group block">
                <h2 className="font-tech mb-3 text-sm leading-snug tracking-tight text-white sm:text-base">
                  {p.title}
                </h2>
                <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl shadow-black/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="liquid-glass absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full opacity-90 transition group-hover:scale-110">
                    <svg viewBox="0 0 16 16" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M4 2.5v11l9-5.5z" />
                    </svg>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
