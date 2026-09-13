import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import { testimonials } from "../data/siteContent";
import "./Testimonials.css";

export default function Testimonials() {
  return (
    <>
      <section className="section testimonials-hero">
        <div className="container testimonials-hero-inner">
          <Reveal as="p" className="eyebrow">
            Testimonials
          </Reveal>
          <Reveal as="h1" delay={0.05} className="testimonials-title">
            Real people, real progress.
          </Reveal>
          <Reveal as="p" delay={0.1} className="testimonials-lede">
            Every plan is different, because every person is. Here's what changed for a few of
            the people I've worked with.
          </Reveal>
        </div>
      </section>

      <section className="section section-alt testimonials-list">
        <div className="container testimonials-stack">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              className={`testimonial-row ${i % 2 === 1 ? "testimonial-row-right" : ""}`}
              direction={i % 2 === 1 ? "left" : "right"}
              amount={0.4}
            >
              <span className="testimonial-row-mark" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote className="testimonial-row-quote">{t.quote}</blockquote>
              <p className="testimonial-row-attribution">
                <strong>{t.name}</strong>
                <span> · {t.context}</span>
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-dark testimonials-cta">
        <div className="container testimonials-cta-inner">
          <Reveal as="h2">Ready to write your own?</Reveal>
          <Reveal as="p" delay={0.08} className="testimonials-cta-sub">
            The first step is a free, no-pressure consultation.
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
