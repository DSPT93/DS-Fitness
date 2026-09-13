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
            I help people lose weight, get stronger and feel better within themselves. We do
            this with structured training sessions and planning that is actually based around
            you.
          </Reveal>
        </div>
      </section>

      <section className="section section-alt about-story">
        <div className="container about-story-grid">
          <Reveal className="about-photo" direction="right">
            <img src="/images/david.jpg" alt={business.trainerName} className="about-photo-img" />
          </Reveal>

          <Reveal className="about-copy" direction="left" delay={0.1}>
            <h2>My story</h2>
            <p>
              I help people feel better because I know how it feels to not be your best self.
              Seven years ago I was at my heaviest weight and unhealthy. Training had never
              crossed my mind, but I knew that I was feeling my worst. At 25 years old, I was
              facing the reality that putting my shoes on had become a tricky task because I
              was so big.
            </p>
            <p>
              Change was needed and little did I know, it was right around the corner. I joined
              a gym and started working out with a good friend who had some experience within
              the gym. The gym became the key to change that I needed. Training was fun,
              exciting and motivating. This was so strong a feeling that I decided I wanted to
              help other people who may have felt how I did back then.
            </p>
            <p>
              Weighing 115kg and moving better than I ever have, we find ourselves here seven
              years on. Now it is time for me to help you feel your best self and to not feel
              how I did back then.
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
          <Reveal as="h2">Ready to feel your best self?</Reveal>
          <Reveal as="p" delay={0.08} className="about-cta-sub">
            Book in for a free consultation and let's start planning how we can get you feeling
            your best self.
          </Reveal>
          <Reveal delay={0.16}>
            <Link to="/booking" className="btn btn-primary">
              Book your free consultation today
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
