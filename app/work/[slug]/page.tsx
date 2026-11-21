import { existsSync } from "node:fs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { caseStudies } from "../../../lib/case-studies";
import { projects, route, asset, projectArtwork } from "../../../lib/projects";

type WorkProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: WorkProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} · Sheikh Robin Emon`,
    description: caseStudies[project.slug].concept,
  };
}

export default async function Work({ params }: WorkProps) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const content = caseStudies[project.slug];
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  const prototype = route(`/play/${slug}/`);
  const workIndex = route(`/?project=${slug}`);
  const shots = [
    { file: `${slug}-screen.jpg`, caption: `${project.name} landing screen` },
    { file: `${slug}-detail.jpg`, caption: content.capture },
  ].filter((shot) => existsSync(`public/media/${shot.file}`));

  return (
    <main
      id="main"
      className="case"
      style={
        {
          "--paper": project.color,
          "--ink": project.ink,
        } as React.CSSProperties
      }
    >
      <header className="case-nav">
        <a href={workIndex}>Selected work</a>
        <a href={prototype}>Launch prototype</a>
      </header>
      <section className="case-intro" aria-labelledby="case-title">
        <div className="case-lead">
          <div>
            <p className="eyebrow">{project.tag} · Independent concept</p>
            <h1 id="case-title">
              {project.name}
              <span>.</span>
            </h1>
            <p className="case-strapline">{project.line}</p>
          </div>
          <div className="case-lead-details">
            <p>{content.concept}</p>
            <a className="primary-cta" href={prototype}>
              Explore interactive prototype
            </a>
          </div>
        </div>
        <img
          className="case-hero hero-artwork"
          {...projectArtwork(slug)}
          sizes="88vw"
          alt=""
          width="900"
          height="510"
          fetchPriority="high"
        />
        <dl className="meta">
          <div>
            <dt>Role</dt>
            <dd>Product design, interaction & frontend</dd>
          </div>
          <div>
            <dt>Scope</dt>
            <dd>Independent product concept</dd>
          </div>
          <div>
            <dt>Platform</dt>
            <dd>Responsive web</dd>
          </div>
          <div>
            <dt>Tools</dt>
            <dd>Next.js, React, TypeScript, CSS</dd>
          </div>
        </dl>
      </section>

      <div className="case-body">
        <section>
          <p className="eyebrow">The problem</p>
          <h2>{project.problem}</h2>
          <p>{project.audience}</p>
          <h3>Product opportunity</h3>
          <p>{content.opportunity}</p>
        </section>
        <section>
          <p className="eyebrow">Research and assumptions</p>
          <h2>What informed the approach</h2>
          <p>{content.pattern}</p>
          <p>
            <a className="source-link" href={content.source[1]}>
              {content.source[0]}
            </a>
          </p>
          <h3>Design hypothesis</h3>
          <p>{project.hypothesis}</p>
          <aside>
            <strong>Hypothetical persona</strong>
            <p>{project.persona}</p>
          </aside>
        </section>
        <section>
          <p className="eyebrow">User journey</p>
          <h2>How the main task flows</h2>
          <ol className="flow" role="list">
            {project.flow.map((step, index) => (
              <li key={step}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                {step}
              </li>
            ))}
          </ol>
          <h3>Information architecture</h3>
          <ul className="case-list">
            {content.architecture.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <p className="eyebrow">Wireframes</p>
          <h2>Screen structure</h2>
          <div className="wireframes">
            {content.frames.map((frame) => (
              <figure key={frame.title}>
                <div className="wire-page">
                  {frame.rows.map((row, index) => (
                    <div className="wire-row" key={index}>
                      {row.map((block) => (
                        <span key={block}>{block}</span>
                      ))}
                    </div>
                  ))}
                </div>
                <figcaption>{frame.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section>
          <p className="eyebrow">Visual identity</p>
          <h2>The {project.name} design system</h2>
          <div className="swatches">
            <div style={{ background: project.color, color: project.ink }}>
              {project.color.toUpperCase()}
            </div>
            <div style={{ background: project.ink, color: "white" }}>
              {project.ink.toUpperCase()}
            </div>
            <div style={{ background: "#faf7ed", color: "#222" }}>#FAF7ED</div>
          </div>
          <p>{content.identity}</p>
        </section>
        <section>
          <p className="eyebrow">High-fidelity screens</p>
          <h2>The implemented experience</h2>
          <div className="case-screens">
            {shots.map((shot) => (
              <figure key={shot.file}>
                <img
                  src={asset(shot.file)}
                  alt={shot.caption}
                  width="1440"
                  height="900"
                  loading="lazy"
                />
                <figcaption>{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
          {!shots.length && (
            <p>The interactive prototype is available below.</p>
          )}
          <h3>Signature interaction</h3>
          <p>{project.signature}</p>
          <h3>Design decision</h3>
          <p>{project.tradeoff}</p>
        </section>
        <section>
          <p className="eyebrow">Validation and results</p>
          <h2>What the prototype demonstrates</h2>
          <p>{content.result}</p>
          <p>
            Browser tests exercise the main journey, local persistence and
            responsive widths. The personas and design hypotheses are
            illustrative. This is an independent concept with no recruited
            usability study or business results.
          </p>
          <h3>Reflection and what to test next</h3>
          <p>{content.reflection}</p>
          <a className="primary-cta" href={prototype}>
            Open {project.name} demo
          </a>
        </section>
      </div>
      <a className="next-case" href={route(`/work/${next.slug}/`)}>
        <small>Next project · {next.tag}</small>
        <strong>{next.name}.</strong>
        <img
          src={asset(next.slug + ".webp")}
          alt=""
          width="720"
          height="360"
          loading="lazy"
        />
      </a>
    </main>
  );
}
