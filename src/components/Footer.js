import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getAllCategories } from '../utils/categoryUtils';
import logo from '../assets/logo.png';
import './Footer.css';

const DEFAULT_CONTACT = {
  officeAddress: "204, Mauli CHS, Plot No. D-22,\nSector 20, Nerul, Navi Mumbai, Maharashtra - 400706",
  phonePrimary: "+91 70392 06369",
  emailPrimary: "info@achintyah.com"
};

const Footer = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const [footerCategories, setFooterCategories] = useState(() => getAllCategories());

  useEffect(() => {
    const handleCatUpdate = () => {
      setFooterCategories(getAllCategories());
    };
    window.addEventListener('achintyah_categories_updated', handleCatUpdate);
    window.addEventListener('storage', handleCatUpdate);
    return () => {
      window.removeEventListener('achintyah_categories_updated', handleCatUpdate);
      window.removeEventListener('storage', handleCatUpdate);
    };
  }, []);

  const [contactInfo, setContactInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('achintyah_contact_content');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          officeAddress: parsed.officeAddress || DEFAULT_CONTACT.officeAddress,
          phonePrimary: parsed.phonePrimary || DEFAULT_CONTACT.phonePrimary,
          emailPrimary: parsed.emailPrimary || DEFAULT_CONTACT.emailPrimary
        };
      }
    } catch (e) {}
    return DEFAULT_CONTACT;
  });

  useEffect(() => {
    let isMounted = true;
    const apiHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5001' 
      : '';

    const loadContact = async () => {
      try {
        const res = await fetch(`${apiHost}/api/contact-content`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && typeof data === 'object') {
            setContactInfo(prev => ({
              officeAddress: data.officeAddress || prev.officeAddress,
              phonePrimary: data.phonePrimary || prev.phonePrimary,
              emailPrimary: data.emailPrimary || prev.emailPrimary
            }));
            try {
              localStorage.setItem('achintyah_contact_content', JSON.stringify(data));
            } catch (e) {}
          }
        }
      } catch (err) {
        // Fallback already loaded from localStorage
      }
    };

    loadContact();

    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('achintyah_contact_content');
        if (saved) {
          const parsed = JSON.parse(saved);
          setContactInfo(prev => ({
            officeAddress: parsed.officeAddress || prev.officeAddress,
            phonePrimary: parsed.phonePrimary || prev.phonePrimary,
            emailPrimary: parsed.emailPrimary || prev.emailPrimary
          }));
        }
      } catch (e) {}
    };

    window.addEventListener('achintyah_contact_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('achintyah_contact_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (location.pathname === '/admin') {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-brand-icon">
                <img src={logo} alt="Achintyah Agrogreentech Pvt Ltd logo" />
              </div>
              <div>
                <span className="footer-brand-name">Achintyah Agrogreentech</span>
                <span className="footer-brand-sub">Private Limited</span>
              </div>
            </div>
            <p className="footer-desc">
              {t('heroSub')}
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>{t('quickLinks')}</h4>
            <ul>
              <li><Link to="/">{t('home')}</Link></li>
              <li><Link to="/about">{t('about')}</Link></li>
              <li><Link to="/products">{t('products')}</Link></li>
              <li><Link to="/services">{t('services')}</Link></li>
              <li><Link to="/contact">{t('contact')}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('products')}</h4>
            <ul>
              {footerCategories.slice(0, 5).map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`}>
                    {cat}
                  </Link>
                </li>
              ))}
              <li className="footer-more-cat-item">
                <Link to="/products" className="footer-more-cat-link">
                  Show More Categories →
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('contactInfo')}</h4>
            <div className="footer-contacts">
              <div className="footer-contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <strong>Registered Office</strong>
                  <p style={{ whiteSpace: 'pre-line' }}>{contactInfo.officeAddress || DEFAULT_CONTACT.officeAddress}</p>
                </div>
              </div>
              <div className="footer-contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <strong>Phone</strong>
                  <p>
                    <a href={`tel:${(contactInfo.phonePrimary || DEFAULT_CONTACT.phonePrimary).replace(/[^0-9+]/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {contactInfo.phonePrimary || DEFAULT_CONTACT.phonePrimary}
                    </a>
                  </p>
                </div>
              </div>
              <div className="footer-contact-item">
                <span className="contact-icon">✉️</span>
                <div>
                  <strong>Email</strong>
                  <p>
                    <a href={`mailto:${contactInfo.emailPrimary || DEFAULT_CONTACT.emailPrimary}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {contactInfo.emailPrimary || DEFAULT_CONTACT.emailPrimary}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>{t('copyright')}</p>
          <p className="footer-tagline">🌱 Growing Greener, Growing Better</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
