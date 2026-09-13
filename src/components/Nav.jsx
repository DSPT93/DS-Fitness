import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { business, navLinks } from "../data/siteContent";
import "./Nav.css";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`nav ${scrolled ? "nav-scrolled" : ""} ${open ? "nav-menu-open" : ""}`}>
      <div className="nav-inner container">
        <NavLink to="/" className="nav-brand" onClick={() => setOpen(false)}>
          {business.shortName}
        </NavLink>

        <div className="nav-actions">
          <NavLink to="/booking" className="btn btn-primary nav-cta" onClick={() => setOpen(false)}>
            Book Free Consultation
          </NavLink>

          <button
            type="button"
            className={`nav-burger ${open ? "nav-burger-open" : ""}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="main-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="main-menu"
            className="nav-overlay"
            initial={{ clipPath: "circle(2% at calc(100% - 44px) 38px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 38px)" }}
            exit={{ clipPath: "circle(2% at calc(100% - 44px) 38px)" }}
            transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
          >
            <nav className="nav-overlay-links" aria-label="Primary">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06, duration: 0.4 }}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) => `nav-overlay-link ${isActive ? "nav-overlay-link-active" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            <motion.div
              className="nav-overlay-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <NavLink to="/booking" className="btn btn-primary" onClick={() => setOpen(false)}>
                Book Free Consultation
              </NavLink>
              <p className="nav-overlay-contact">
                {business.email} · {business.phone}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
