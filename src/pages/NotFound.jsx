import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container" style={{ textAlign: "center", padding: "80px 0" }}>
        <p className="eyebrow" style={{ justifyContent: "center" }}>
          404
        </p>
        <h1>This page took a rest day.</h1>
        <p style={{ color: "var(--color-ink-soft)", marginBottom: 24 }}>
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </section>
  );
}
