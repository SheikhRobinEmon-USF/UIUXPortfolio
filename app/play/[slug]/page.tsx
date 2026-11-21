import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "../../../lib/projects";
import { tours } from "../../../lib/tours";
import PlayShell from "../../../components/play/PlayShell";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} prototype · Sheikh Robin Emon`,
    description: `Explore ${project.name}, a ${project.tag.toLowerCase()} product — web and mobile app prototypes.`,
  };
}
export default async function Play({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();
  return <PlayShell project={p} tour={tours[slug]} />;
}
