import type { Metadata } from "next";
import { route } from "../../lib/projects";
import Cursor from "../../components/home/Cursor";

export const metadata: Metadata = {
  title: "Connect · Sheikh Robin Emon",
  description:
    "Connect with Sheikh Robin Emon about product design, interaction design and frontend opportunities.",
};

const channels = [
  {
    title: "Email",
    value: "robinemon13@gmail.com",
    href: "mailto:robinemon13@gmail.com",
  },
  {
    title: "LinkedIn",
    value: "Sheikh Robin Emon",
    href: "https://www.linkedin.com/in/sheikh-robin-emon-2807a1146",
  },
  {
    title: "Connect on GitHub",
    value: "SheikhRobinEmon-USF",
    href: "https://github.com/SheikhRobinEmon-USF",
  },
];

export default function Contact() {
  return (
    <main id="main" className="profile-page contact-page">
      <Cursor />
      <header className="profile-nav">
        <a href={route("/")}>← Selected work</a>
        <a href={route("/about/")}>About</a>
      </header>
      <section className="profile-layout">
        <div>
          <p className="eyebrow">United States</p>
          <h1>
            Let’s <em>talk.</em>
          </h1>
          <p>
            I’m open to roles and collaborations in UI/UX, product design,
            interaction and creative frontend development.
          </p>
        </div>
        <ul className="contact-channels" aria-label="Contact methods">
          {channels.map((channel) => (
            <li key={channel.title}>
              <a href={channel.href}>
                <span>{channel.title}</span>
                <strong>{channel.value}</strong>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
