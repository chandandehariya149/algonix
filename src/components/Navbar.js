import { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/tutorials', label: 'Tutorials' },
  { to: '/sheet',     label: 'Sheet' },
  { to: '/author',    label: 'Author' },
];

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Sticky shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close profile dropdown on outside click / esc
  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') { setMenuOpen(false); setOpen(false); } };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    setOpen(false);
    logout?.();
  };

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__inner container">
        <Link to="/" className="nav__logo" onClick={() => setOpen(false)} aria-label="Algonix home">
          <span className="nav__logo-mark" />
          <span className="nav__logo-text">ALGONIX</span>
        </Link>

        <nav className={`nav__links ${open ? 'is-open' : ''}`} aria-label="Primary">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <a
            href="https://www.linkedin.com/company/algonix"
            className="nav__link"
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
          >
            Events
          </a>

          {/* Mobile-only CTA inside drawer */}
          <div className="nav__mobile-cta">
            {user ? (
              <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <Link to="/login"  className="btn btn-ghost"  onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/signup" className="btn btn-primary" onClick={() => setOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        </nav>

        <div className="nav__cta">
          {user ? (
            <div className="nav__profile" ref={menuRef}>
              <button
                type="button"
                className="nav__avatar-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <img
                  src={user.profilePhoto || '/assets/default-profile.png'}
                  alt={user.name || 'Profile'}
                  className="nav__avatar"
                />
              </button>
              {menuOpen && (
                <div className="nav__menu" role="menu">
                  <div className="nav__menu-head">
                    <strong>{user.name || 'User'}</strong>
                    <span>{user.email}</span>
                  </div>
                  <button className="nav__menu-item" onClick={() => { setMenuOpen(false); navigate('/profile'); }}>
                    My Profile
                  </button>
                  <button className="nav__menu-item nav__menu-item--danger" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"  className="btn btn-ghost nav__login">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Get started</Link>
            </>
          )}

          <button
            type="button"
            className={`nav__burger ${open ? 'is-open' : ''}`}
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
