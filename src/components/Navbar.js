import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: t('home'), icon: '🏠' },
    { path: '/about', label: t('about'), icon: '🌱' },
    { path: '/products', label: t('products'), icon: '📦' },
    { path: '/services', label: t('services'), icon: '🔬' },
    { path: '/contact', label: t('contact'), icon: '📞' },
  ];

  // Only hide main navbar on Admin panel
  if (location.pathname === '/admin') {
    return null;
  }

  return (
    <nav className="navbar scrolled inner-page">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <img src={logo} alt="Achintyah Agrogreentech Pvt Ltd logo" />
          </div>
          <div className="brand-text">
            <span className="brand-name">Achintyah</span>
            <span className="brand-sub">Agrogreentech Pvt. Ltd.</span>
          </div>
        </Link>

        {/* Navigation Links & Mobile Drawer */}
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {/* Mobile Drawer Header with Back Button (Mobile Only) */}
          <div className="nav-drawer-header">
            <button 
              className="btn-drawer-back" 
              onClick={() => setMenuOpen(false)}
              aria-label="Go Back and close menu"
              title="Back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </button>
            <div className="nav-drawer-brand">
              <img src={logo} alt="Achintyah Logo" className="drawer-logo" />
              <div className="drawer-brand-text">
                <strong>Achintyah</strong>
                <span>Agrogreentech</span>
              </div>
            </div>
            <button 
              className="btn-drawer-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="nav-drawer-body">
            <div className="nav-drawer-section-label">Navigation Menu</div>

            <ul className="nav-menu-list">
              {navLinks.map(link => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="nav-link-left">
                      <span className="nav-link-icon">{link.icon}</span>
                      <span className="nav-link-text">{link.label}</span>
                    </span>
                    <span className="nav-link-arrow">›</span>
                  </Link>
                </li>
              ))}

              <li className="nav-admin-li">
                {user ? (
                  <Link to="/admin" className="nav-link admin-nav-pill" title={`Logged in as ${user.name || user.username}`} onClick={() => setMenuOpen(false)}>
                    <span className="nav-link-left">
                      <span className="nav-link-icon">🔐</span>
                      <span className="nav-link-text">{t('adminPanel')}</span>
                    </span>
                    <span className="nav-link-arrow">›</span>
                  </Link>
                ) : (
                  <Link to="/login" className="nav-link login-nav-pill" onClick={() => setMenuOpen(false)}>
                    <span className="nav-link-left">
                      <span className="nav-link-icon">🔐</span>
                      <span className="nav-link-text">{t('login')}</span>
                    </span>
                    <span className="nav-link-arrow">›</span>
                  </Link>
                )}
              </li>
            </ul>

            <div className="nav-drawer-divider" />

            {/* Language Selector */}
            <div className="nav-drawer-lang-box">
              <span className="drawer-lang-label">Language / भाषा निवडा</span>
              <LanguageSelector />
            </div>

            {/* Get Quote CTA */}
            <div className="nav-drawer-cta-box">
              <Link to="/contact" className="nav-cta" onClick={() => setMenuOpen(false)}>
                <span>{t('getQuote')}</span>
                <span className="cta-arrow">→</span>
              </Link>
            </div>

            {/* Mobile Drawer Quick Contact Footer */}
            <div className="nav-drawer-footer">
              <div className="drawer-footer-heading">Need Assistance?</div>
              <a href="tel:+917039206369" className="drawer-contact-row">
                <span className="dcr-icon">📞</span>
                <span>+91 70392 06369</span>
              </a>
              <a href="mailto:info@achintyah.com" className="drawer-contact-row">
                <span className="dcr-icon">✉️</span>
                <span>info@achintyah.com</span>
              </a>
              <div className="drawer-eco-tag">
                🌱 Certified Bio-Agri Inputs & Tech
              </div>
            </div>
          </div>
        </div>

        <div className="nav-actions-mobile">
          <button 
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            title="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {menuOpen && (
          <div className="nav-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
