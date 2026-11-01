import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShaderBackground } from "@/components/ui/shader-state";
import WatchPlayer from "@/components/watch-player";
import { getProject, projects } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  return { title: project?.title ?? "Watch", description: project?.description };
}

export default async function WatchPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <ShaderBackground className="absolute inset-0 z-0 h-full w-full pointer-events-none" />

      <main className="relative z-10 px-4 pb-40 pt-28 sm:px-6 sm:pt-32">
        {/* The column is capped by the screen height as well as its width, so
            the title, 16:9 player and description always fit above the footer. */}
        <div className="mx-auto w-full max-w-[max(18rem,min(64rem,calc((100dvh_-_22rem)*16/9)))]">
          <h1 className="font-tech mb-5 text-base leading-snug tracking-tight sm:text-xl">
            {project.title}
          </h1>
          <WatchPlayer project={project} />
          <p className="font-tech mt-5 text-[13px] leading-relaxed text-white/80 sm:text-sm">
            {project.description}
          </p>
        </div>
      </main>
    </div>
  );
}
