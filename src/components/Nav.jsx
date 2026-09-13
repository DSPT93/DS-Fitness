import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { business, navLinks } from "../data/siteContent";
import "./Nav.css";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-inner container">
        <NavLink to="/" className="nav-brand" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt={business.name} className="nav-brand-logo" />
        </NavLink>

        <div className="nav-actions">
          <NavLink to="/booking" className="btn btn-primary nav-cta" onClick={() => setOpen(false)}>
            Book Free Consultation
          </NavLink>

          <div className="nav-menu-wrap" ref={menuRef}>
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

            <AnimatePresence>
              {open && (
                <motion.div
                  id="main-menu"
                  className="nav-dropdown"
                  initial={{ opacity: 0, scale: 0.94, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <nav className="nav-dropdown-links" aria-label="Primary">
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === "/"}
                        className={({ isActive }) => `nav-dropdown-link ${isActive ? "nav-dropdown-link-active" : ""}`}
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </NavLink>
                    ))}
                  </nav>

                  <div className="nav-dropdown-footer">
                    <NavLink to="/booking" className="btn btn-primary nav-dropdown-cta" onClick={() => setOpen(false)}>
                      Book Free Consultation
                    </NavLink>
                    <p className="nav-dropdown-contact">
                      {business.email}
                      <br />
                      {business.phone}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
