import { Link } from "react-router-dom";
import { business, navLinks } from "../data/siteContent";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="/logo.png" alt={business.name} className="footer-logo" />
          <p className="footer-tagline">{business.tagline}</p>
        </div>

        <nav className="footer-links" aria-label="Footer">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="footer-contact">
          <a href={`mailto:${business.email}`}>{business.email}</a>
          <a href={`tel:${business.phone.replace(/\s+/g, "")}`}>{business.phone}</a>
          <span>{business.location}</span>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </span>
        <Link to="/admin" className="footer-admin">
          Admin
        </Link>
      </div>
    </footer>
  );
}
