import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudy from "../../../components/case/CaseStudy";
import { caseStudies } from "../../../lib/case-studies";
import { projects } from "../../../lib/projects";
import { systems } from "../../../lib/systems";
import { tours } from "../../../lib/tours";

type WorkProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: WorkProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} — ${project.tag} · Sheikh Robin Emon`,
    description: caseStudies[project.slug].concept,
  };
}

export default async function Work({ params }: WorkProps) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  return <CaseStudy project={project} content={caseStudies[slug] as any} tour={tours[slug]} system={systems[slug]} next={next} index={index} />;
}
