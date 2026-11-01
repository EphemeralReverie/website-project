import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
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
  return { title: project?.title ?? "Watch" };
}

export default async function WatchPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <ShaderBackground className="absolute inset-0 z-0 h-full w-full pointer-events-none" />
      <SiteHeader />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        <h1 className="mb-5 text-lg font-medium leading-snug tracking-tight sm:text-2xl">
          {project.title}
        </h1>
        <WatchPlayer project={project} />
      </main>
    </div>
  );
}
