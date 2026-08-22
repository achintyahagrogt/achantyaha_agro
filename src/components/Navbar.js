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
    { path: '/', label: t('home') },
    { path: '/about', label: t('about') },
    { path: '/products', label: t('products') },
    { path: '/services', label: t('services') },
    { path: '/contact', label: t('contact') },
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

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <li key={link.path}>
              <Link 
                to={link.path} 
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            {user ? (
              <Link to="/admin" className="nav-link admin-nav-pill" title={`Logged in as ${user.name || user.username}`}>
                🔐 {t('adminPanel')}
              </Link>
            ) : (
              <Link to="/login" className="nav-link">
                🔐 {t('login')}
              </Link>
            )}
          </li>
          <li>
            <LanguageSelector />
          </li>
          <li>
            <Link to="/contact" className="nav-cta">{t('getQuote')}</Link>
          </li>
        </ul>

        <button 
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
