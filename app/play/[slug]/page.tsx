import type { Metadata } from "next";
import { projects } from "../../../lib/projects";
import { notFound } from "next/navigation";
import Prototype from "../../../components/Prototype";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} demo · Sheikh Robin Emon`,
    description: `Explore ${project.name}, an independent ${project.tag.toLowerCase()} prototype.`,
  };
}

export default async function Play({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();
  return <Prototype project={p} />;
}
