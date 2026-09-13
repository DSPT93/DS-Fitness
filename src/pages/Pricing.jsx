import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import { pricingPlans } from "../data/siteContent";
import "./Pricing.css";

const faqs = [
  {
    q: "What happens at the free consultation?",
    a: "A relaxed 20–30 minute conversation, in person, by phone, or on video, about your goals, your current activity, and any injuries or concerns. You'll leave with a clear recommendation — no pressure to book anything further.",
  },
  {
    q: "Do I need to bring anything?",
    a: "Just comfortable clothing. All equipment is provided for in-person sessions.",
  },
  {
    q: "Can I pause or cancel a package?",
    a: "Yes — sessions can be rescheduled with 24 hours' notice, and packages don't expire.",
  },
  {
    q: "Who is the intro offer for?",
    a: "Anyone training with me for the first time. It's a low-commitment way to experience personalised coaching before deciding on a bigger package.",
  },
];

export default function Pricing() {
  return (
    <>
      <section className="section pricing-hero">
        <div className="container pricing-hero-inner">
          <Reveal as="p" className="eyebrow">
            Pricing
          </Reveal>
          <Reveal as="h1" delay={0.05} className="pricing-title">
            Simple, honest pricing.
          </Reveal>
          <Reveal as="p" delay={0.1} className="pricing-lede">
            Every journey starts with a free consultation, so you know exactly what to expect
            before you commit to anything.
          </Reveal>
        </div>
      </section>

      <section className="section section-alt pricing-plans">
        <div className="container pricing-grid">
          {pricingPlans.map((plan, i) => (
            <Reveal
              key={plan.name}
              className={`pricing-card ${plan.highlight ? "pricing-card-highlight" : ""}`}
              delay={i * 0.08}
            >
              {plan.highlight && <span className="pricing-badge">Most popular</span>}
              <h3>{plan.name}</h3>
              <div className="pricing-amount">
                <span className="pricing-price">{plan.price}</span>
                <span className="pricing-period">/{plan.period}</span>
              </div>
              <p className="pricing-desc">{plan.description}</p>
              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link
                to="/booking"
                className={`btn ${plan.highlight ? "btn-primary" : "btn-ghost"} pricing-cta`}
              >
                {plan.cta}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section pricing-faq">
        <div className="container pricing-faq-inner">
          <Reveal as="h2" className="pricing-faq-title">
            Questions, answered.
          </Reveal>
          <div className="pricing-faq-list">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} className="pricing-faq-item" delay={i * 0.06}>
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark pricing-cta-banner">
        <div className="container pricing-cta-banner-inner">
          <Reveal as="h2">Not sure which fits you best?</Reveal>
          <Reveal as="p" delay={0.08} className="pricing-cta-banner-sub">
            That's exactly what the free consultation is for.
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
