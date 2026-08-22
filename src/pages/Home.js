import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { formatImageUrl } from '../utils/imageUtils';
import './Home.css';

const DEFAULT_HOME_CONTENT = {
  aboutTitle: "About Achintyah Agrogreentech Pvt. Ltd.",
  aboutDesc: "We are committed to providing innovative, reliable and eco-friendly agricultural solutions that enhance soil health, improve productivity and build a sustainable future for agriculture.",
  check1: "Quality Assurance",
  check2: "Timely Delivery",
  check3: "Expert Technical Support",
  check4: "Farmer-Centric Approach",
  badgeNum: "10+",
  badgeTxt: "Years of Excellence",
  mainImg: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80",
  sideImg1: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80",
  sideImg2: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80"
};

const stats = [
  { value: '500+', label: 'Products Delivered' },
  { value: '5+', label: 'Years Experience' },
  { value: '1000+', label: 'Happy Farmers' },
  { value: '15+', label: 'States Served' },
];

const features = [
  {
    icon: '🌿',
    title: 'Bio Fertilizers',
    desc: 'Premium bio-fertilizers enriched with nitrogen fixers and phosphate solubilizers for enhanced crop nutrition.',
    link: '/products',
  },
  {
    icon: '🔬',
    title: 'Micronutrients',
    desc: 'Precisely formulated micronutrient blends – Zinc, Boron, Calcium, Manganese – for optimal plant health.',
    link: '/products',
  },
  {
    icon: '💧',
    title: 'Water Soluble Fertilizers',
    desc: 'High-purity WSF for fertigation and foliar applications with rapid absorption and zero residue.',
    link: '/products',
  },
  {
    icon: '🌱',
    title: 'Plant Growth Regulators',
    desc: 'Scientifically developed PGRs to stimulate root development, flowering, and fruit setting.',
    link: '/products',
  },
  {
    icon: '🛡️',
    title: 'Bio Pesticides',
    desc: 'Eco-safe biological pest control solutions that protect crops without harming soil microbiome.',
    link: '/products',
  },
  {
    icon: '🌾',
    title: 'Seaweed Extracts',
    desc: 'Cold-processed seaweed concentrates packed with cytokinins, betaines and alginic acids.',
    link: '/products',
  },
];

const Home = () => {
  const { t } = useLanguage();
  const [content, setContent] = useState(DEFAULT_HOME_CONTENT);
  const sliderRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5001'
      : '';

    const loadHomeContent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/home-content`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.aboutTitle) {
            setContent(prev => ({ ...prev, ...data }));
            return;
          }
        }
      } catch (err) {
        // Quietly failover to LocalStorage fallback
      }

      try {
        const localContent = JSON.parse(localStorage.getItem('achintyah_home_content') || '{}');
        if (isMounted && localContent && localContent.aboutTitle) {
          setContent(prev => ({ ...prev, ...localContent }));
        }
      } catch (e) {}
    };

    loadHomeContent();
    return () => { isMounted = false; };
  }, []);

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section-new">
        <div className="hero-bg-wrapper">
          <img src="/hero_farmer_bg.png" alt="Achintyah Farmer Field" className="hero-bg-img" />
          <div className="hero-bg-overlay"></div>
        </div>

        <div className="hero-container-new">
          <div className="hero-left-content">
            <span className="hero-green-label">MAHARASHTRA'S GREEN FUTURE</span>
            <h1 className="hero-new-title">
              Nurturing Soil.<br />
              Growing<br />
              Tomorrow.
            </h1>
            <p className="hero-new-subtitle">
              Achintyah Agrogreentech Pvt Ltd delivers cutting-edge bio-agricultural inputs, organic solutions, and sustainable green technology to empower Indian farmers.
            </p>
            <div className="hero-new-actions">
              <Link to="/products" className="btn-gold-pill">
                Explore Products <span>→</span>
              </Link>
              <Link to="/about" className="btn-outline-pill">
                About Us
              </Link>
            </div>
          </div>
        </div>

        {/* Curved Wave & Feature Badges Bar */}
        <div className="hero-bottom-wave-bar">
          <svg className="wave-svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,40 C320,100 420,10 720,50 C1020,90 1200,20 1440,60 L1440,120 L0,120 Z" fill="#0d3b1e"></path>
          </svg>
          <div className="hero-badges-container">
            <div className="container hero-badges-grid">
              <div className="hero-badge-item">
                <div className="hbi-icon">🌿</div>
                <div className="hbi-text">
                  <strong>Organic Certified</strong>
                  <span>100% Organic & Safe</span>
                </div>
              </div>
              <div className="hero-badge-item">
                <div className="hbi-icon">🛡️</div>
                <div className="hbi-text">
                  <strong>ISO Compliant</strong>
                  <span>International Standards</span>
                </div>
              </div>
              <div className="hero-badge-item">
                <div className="hbi-icon">🇮🇳</div>
                <div className="hbi-text">
                  <strong>Made in India</strong>
                  <span>Proudly Indian</span>
                </div>
              </div>
              <div className="hero-badge-item">
                <div className="hbi-icon">🧪</div>
                <div className="hbi-text">
                  <strong>Scientifically Advanced</strong>
                  <span>Research Backed Products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products / Features - Single Line Grid Slider */}
      <section className="section features-section leaf-bg">
        <div className="container">
          <div className="features-header-flex">
            <div>
              <span className="section-label">What We Offer</span>
              <h2 className="section-title">Our Product Range</h2>
            </div>
            {/* Horizontal Scroll Navigation Controls */}
            <div className="slider-arrows">
              <button
                className="slider-arrow-btn"
                onClick={() => scrollSlider('left')}
                title="Scroll Left"
                aria-label="Previous Products"
              >
                ‹
              </button>
              <button
                className="slider-arrow-btn"
                onClick={() => scrollSlider('right')}
                title="Scroll Right"
                aria-label="Next Products"
              >
                ›
              </button>
            </div>
          </div>

          <div className="features-single-row" ref={sliderRef}>
            {features.map((f, i) => (
              <Link to={f.link} key={i} className="feature-card feature-card-single">
                <div className="feature-card-top">
                  <div className="feature-icon">{f.icon}</div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
                <span className="feature-link">View Products →</span>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/products" className="btn-primary">
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* About Us Banner - Live Editable */}
      <section className="section about-home-section">
        <div className="container about-home-grid">
          {/* Left Text Block */}
          <div className="about-home-text">
            <h2 className="about-home-title">{content.aboutTitle}</h2>
            <p className="about-home-desc">{content.aboutDesc}</p>
            <div className="about-home-checks">
              {content.check1 && <div className="check-item"><span className="check-icon">✓</span> {content.check1}</div>}
              {content.check2 && <div className="check-item"><span className="check-icon">✓</span> {content.check2}</div>}
              {content.check3 && <div className="check-item"><span className="check-icon">✓</span> {content.check3}</div>}
              {content.check4 && <div className="check-item"><span className="check-icon">✓</span> {content.check4}</div>}
            </div>
            <Link to="/about" className="btn-primary btn-about-home">
              Know More About Us <span>→</span>
            </Link>
          </div>

          {/* Right Visual Collage with Badge */}
          <div className="about-home-visual">
            <div className="ah-main-img-box">
              <img
                src={formatImageUrl(content.mainImg) || DEFAULT_HOME_CONTENT.mainImg}
                alt="Achintyah Agrogreentech Facility"
                className="ah-img ah-img-main"
                onError={(e) => { e.target.src = DEFAULT_HOME_CONTENT.mainImg; }}
              />
            </div>
            <div className="ah-side-imgs">
              <div className="ah-side-img-box">
                <img
                  src={formatImageUrl(content.sideImg1) || DEFAULT_HOME_CONTENT.sideImg1}
                  alt="Agricultural R&D Lab"
                  className="ah-img ah-img-side"
                  onError={(e) => { e.target.src = DEFAULT_HOME_CONTENT.sideImg1; }}
                />
              </div>
              <div className="ah-side-img-box">
                <img
                  src={formatImageUrl(content.sideImg2) || DEFAULT_HOME_CONTENT.sideImg2}
                  alt="Product Storage Facility"
                  className="ah-img ah-img-side"
                  onError={(e) => { e.target.src = DEFAULT_HOME_CONTENT.sideImg2; }}
                />
              </div>
            </div>
            {/* Overlapping Badge */}
            <div className="ah-badge">
              <span className="ah-badge-num">{content.badgeNum || '10+'}</span>
              <span className="ah-badge-txt">{content.badgeTxt || 'Years of Excellence'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container cta-inner">
          <div className="cta-text">
            <h2>Ready to Transform Your Farm?</h2>
            <p>Get in touch with our expert team for product recommendations and free agronomic consultation.</p>
          </div>
          <div className="cta-actions">
            <Link to="/contact" className="btn-gold">Contact Us Today →</Link>
            <Link to="/products" className="btn-outline cta-btn-outline">View Products</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
