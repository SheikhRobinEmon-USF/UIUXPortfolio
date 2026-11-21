import type { Metadata } from "next";
import { asset, route } from "../../lib/projects";

export const metadata: Metadata = {
  title: "About · Sheikh Robin Emon",
  description:
    "Sheikh Robin Emon explores product design, interaction and frontend engineering through seven independent design studies.",
};

export default function About() {
  return (
    <main id="main" className="profile-page">
      <header className="profile-nav">
        <a href={route("/")}>Selected work</a>
        <a href={route("/contact/")}>Contact</a>
      </header>
      <section className="profile-layout">
        <div>
          <p className="eyebrow">About the designer</p>
          <h1>
            Sheikh Robin <em>Emon.</em>
          </h1>
          <p>
            I’m a graduate student at the University of South Florida with a
            background in product management and technology. I work across
            product design, interaction and frontend engineering.
          </p>
          <p>
            I build interactive prototypes to see how a design holds up when
            people change their minds, make a mistake or return to a task later.
            This collection applies that approach to seven independent concepts.
          </p>
          <a className="text-link" href={route("/")}>
            Explore selected work
          </a>
        </div>
        <img
          src={asset("studio.webp")}
          alt="Sculptural objects in warm afternoon light"
          width="768"
          height="512"
        />
      </section>
    </main>
  );
}
