import type { Metadata } from "next";
import { asset, route } from "../../lib/projects";
import Cursor from "../../components/home/Cursor";

export const metadata: Metadata = {
  title: "About · Sheikh Robin Emon",
  description: "Sheikh Robin Emon works across product design, interaction design and front-end engineering.",
};

const skills = ["Product strategy", "UX research", "Interaction design", "Design systems", "Prototyping", "Motion", "React & TypeScript", "Accessibility"];

export default function About() {
  return (
    <main id="main" className="profile-page">
      <Cursor />
      <header className="profile-nav">
        <a href={route("/")}>← Selected work</a>
        <a href={route("/contact/")}>Contact</a>
      </header>
      <section className="profile-layout">
        <div>
          <p className="eyebrow">About the designer</p>
          <h1>
            Sheikh Robin <em>Emon.</em>
          </h1>
          <p>
            I’m a graduate student at the University of South Florida with a background in product management and technology. I work across product design, interaction and front-end engineering.
          </p>
          <p>
            I build working prototypes — on web and on mobile — to see how a design holds up when people change their minds, make a mistake or return to a task later. This collection applies that approach to seven very different products.
          </p>
          <ul className="profile-skills">
            {skills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <a className="text-link" href={route("/")}>
            Explore selected work
          </a>
        </div>
        <img src={asset("studio.webp")} alt="Sculptural objects in warm afternoon light" width="768" height="512" />
      </section>
    </main>
  );
}
