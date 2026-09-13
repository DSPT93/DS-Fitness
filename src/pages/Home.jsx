import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "../components/Reveal";
import { business, prompts, testimonials } from "../data/siteContent";
import "./Home.css";

const featuredTestimonials = testimonials.slice(0, 4);

const steps = [
  {
    number: "01",
    title: "Free consultation",
    copy: "A relaxed conversation, in person, by phone or on video, about your goals and what's held you back so far.",
  },
  {
    number: "02",
    title: "A plan built around you",
    copy: "Programming shaped by your body, your schedule and your life — not a generic template.",
  },
  {
    number: "03",
    title: "Coached, every step",
    copy: "Real-time feedback and adjustments, in the room or online, so progress never stalls.",
  },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <>
      <section className="hero" ref={heroRef}>
        <motion.div className="hero-glow" style={{ scale: heroScale }} aria-hidden="true" />
        <motion.div className="hero-content container" style={{ y: heroY, opacity: heroOpacity }}>
          <motion.p
            className="eyebrow hero-eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {business.location}
          </motion.p>
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Feel stronger in the body you already have.
          </motion.h1>
          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
          >
            1:1 personal training and online coaching built around your goals, your body and your
            schedule — not the other way round.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.34 }}
          >
            <Link to="/booking" className="btn btn-primary">
              Book your free consultation today
            </Link>
            <Link to="/pricing" className="btn btn-ghost">
              See pricing
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <span />
          <p>Scroll</p>
        </motion.div>
      </section>

      <section className="section prompts">
        <div className="container prompts-inner">
          {prompts.map((prompt, i) => (
            <Reveal
              as="p"
              key={prompt}
              className={`prompt-line ${i % 2 === 1 ? "prompt-line-alt" : ""}`}
              delay={i * 0.03}
            >
              {prompt}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-dark approach">
        <div className="container">
          <Reveal as="p" className="eyebrow">
            How it works
          </Reveal>
          <Reveal as="h2" className="approach-title" delay={0.05}>
            Coaching that fits into your life, not around it.
          </Reveal>

          <div className="approach-grid">
            {steps.map((step, i) => (
              <Reveal key={step.number} className="approach-card" delay={0.1 + i * 0.08}>
                <span className="approach-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section testimonial-scroll">
        <div className="container">
          <Reveal as="p" className="eyebrow">
            In their words
          </Reveal>
          <Reveal as="h2" delay={0.05} className="testimonial-scroll-title">
            Real people, real progress.
          </Reveal>
        </div>

        <div className="testimonial-stack container">
          {featuredTestimonials.map((t, i) => (
            <Reveal
              key={t.name}
              className={`testimonial-block ${i % 2 === 1 ? "testimonial-block-right" : ""}`}
              direction={i % 2 === 1 ? "left" : "right"}
              amount={0.5}
            >
              <span className="testimonial-mark" aria-hidden="true">
                &ldquo;
              </span>
              <p className="testimonial-quote">{t.quote}</p>
              <p className="testimonial-attribution">
                <strong>{t.name}</strong> · {t.context}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal className="container testimonial-scroll-cta">
          <Link to="/testimonials" className="btn btn-ghost">
            Read more testimonials
          </Link>
        </Reveal>
      </section>

      <section className="section cta-banner">
        <div className="container cta-banner-inner">
          <Reveal as="h2">Ready to start?</Reveal>
          <Reveal as="p" delay={0.08} className="cta-banner-sub">
            Book a free, no-pressure consultation — in person, by phone, or on video. Takes less
            than two minutes.
          </Reveal>
          <Reveal delay={0.16}>
            <Link to="/booking" className="btn btn-primary cta-banner-btn">
              Book your free consultation today
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
