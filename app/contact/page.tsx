import type { Metadata } from "next";
import { route } from "../../lib/projects";

export const metadata: Metadata = {
  title: "Contact · Sheikh Robin Emon",
  description:
    "Connect with Sheikh Robin Emon about product design, interaction design and frontend opportunities.",
};

export default function Contact() {
  return (
    <main id="main" className="profile-page contact-page">
      <header className="profile-nav">
        <a href={route("/")}>Selected work</a>
        <a href={route("/about/")}>About</a>
      </header>
      <section className="profile-layout">
        <div>
          <p className="eyebrow">Contact · Tampa, Florida</p>
          <h1>
            Let’s <em>talk.</em>
          </h1>
          <p>
            I’m open to roles and collaborations in UI/UX, product design,
            interaction and creative frontend development.
          </p>
          <a
            className="text-link"
            href="https://github.com/SheikhRobinEmon-USF"
          >
            Connect on GitHub
          </a>
        </div>
      </section>
    </main>
  );
}
