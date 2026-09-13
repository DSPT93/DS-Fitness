import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import { business } from "../data/siteContent";
import "./About.css";

const values = [
  {
    title: "Evidence over trends",
    copy: "Programming grounded in what actually builds strength and lasting habits — no fads.",
  },
  {
    title: "You, not a template",
    copy: "Every plan is adjusted for your body, your schedule and what you tell me each session.",
  },
  {
    title: "Honest, at every step",
    copy: "You'll always know why we're doing something, and what to expect from it.",
  },
];

export default function About() {
  return (
    <>
      <section className="section about-hero">
        <div className="container about-hero-inner">
          <Reveal as="p" className="eyebrow">
            About
          </Reveal>
          <Reveal as="h1" delay={0.05} className="about-title">
            Hi, I'm {business.trainerName}.
          </Reveal>
          <Reveal as="p" delay={0.1} className="about-lede">
            I help people build strength, move without pain, and feel more like themselves —
            through training that fits into real life, not the other way round.
          </Reveal>
        </div>
      </section>

      <section className="section section-alt about-story">
        <div className="container about-story-grid">
          <Reveal className="about-photo" direction="right">
            <div className="about-photo-placeholder" aria-hidden="true">
              <span>Photo</span>
            </div>
          </Reveal>

          <Reveal className="about-copy" direction="left" delay={0.1}>
            <h2>My approach</h2>
            <p>
              I trained for years chasing programmes that looked good on paper but didn't fit
              real, busy lives. Now I coach the way I wish I'd been coached — sessions built
              around your goals, your joints, your energy, and the time you actually have.
            </p>
            <p>
              Whether that's in-person sessions, a call, or fully remote coaching, the process
              starts the same way: a conversation, not a sales pitch.
            </p>
            <p>
              Replace this paragraph with your own certifications, background and story once
              you're ready to make the site yours.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section about-values">
        <div className="container">
          <Reveal as="h2" className="about-values-title">
            What guides every session
          </Reveal>
          <div className="about-values-grid">
            {values.map((v, i) => (
              <Reveal key={v.title} className="about-value-card" delay={i * 0.08}>
                <h3>{v.title}</h3>
                <p>{v.copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark about-cta">
        <div className="container about-cta-inner">
          <Reveal as="h2">Let's talk about your goals.</Reveal>
          <Reveal delay={0.1}>
            <Link to="/booking" className="btn btn-primary">
              Book your free consultation today
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
