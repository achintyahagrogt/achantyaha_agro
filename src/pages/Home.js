import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { formatImageUrl } from '../utils/imageUtils';
import './Home.css';

export const DEFAULT_HERO_SLIDES = [
  {
    id: "slide-1",
    imageUrl: "/hero_farmer_bg.png",
    tag: "MAHARASHTRA'S GREEN FUTURE",
    title: "Nurturing Soil.\nGrowing Tomorrow.",
    subtitle: "Achintyah Agrogreentech Pvt Ltd delivers cutting-edge bio-agricultural inputs, organic solutions, and sustainable green technology to empower Indian farmers.",
    btnText: "Explore Products",
    btnLink: "/products",
    secondaryBtnText: "About Us",
    secondaryBtnLink: "/about"
  },
  {
    id: "slide-2",
    imageUrl: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1600&auto=format&fit=crop&q=80",
    tag: "100% ORGANIC & SAFE BIO-INPUTS",
    title: "Advanced Bio-Fertilizers.\nMaximum Soil Vitality.",
    subtitle: "Multi-strain bio-inoculants and organic nutrients engineered to restore depleted soil microbiomes, enhance root growth, and maximize yield potential.",
    btnText: "View Bio Fertilizers",
    btnLink: "/products",
    secondaryBtnText: "Our Services",
    secondaryBtnLink: "/services"
  },
  {
    id: "slide-3",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop&q=80",
    tag: "SCIENTIFICALLY FORMULATED",
    title: "High-Purity Micronutrients.\nRapid Crop Absorption.",
    subtitle: "Chelated micronutrient compounds and specialized water-soluble blends that prevent deficiencies and dramatically boost crop quality.",
    btnText: "Explore Micronutrients",
    btnLink: "/products",
    secondaryBtnText: "Contact Advisory",
    secondaryBtnLink: "/contact"
  },
  {
    id: "slide-4",
    imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&auto=format&fit=crop&q=80",
    tag: "FARMER-CENTRIC INNOVATION",
    title: "Sustainable Agriculture.\nProsperous Tomorrow.",
    subtitle: "Partnering with progressive farmers, dealers, and FPOs across India with proven agronomic field guidance and premium agricultural formulations.",
    btnText: "Partner With Us",
    btnLink: "/contact",
    secondaryBtnText: "Learn About Us",
    secondaryBtnLink: "/about"
  }
];

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
  sideImg2: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80",
  heroSlideInterval: 3,
  heroSlides: DEFAULT_HERO_SLIDES
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

const renderHeroTitle = (title) => {
  if (!title) {
    return (
      <>
        Nurturing Soil.<br />
        Growing<br />
        Tomorrow.
      </>
    );
  }
  const lines = title.split('\n');
  return lines.map((line, idx) => (
    <React.Fragment key={idx}>
      {line}
      {idx < lines.length - 1 && <br />}
    </React.Fragment>
  ));
};

const Home = () => {
  const { t } = useLanguage();
  const [content, setContent] = useState(DEFAULT_HOME_CONTENT);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);
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
          if (isMounted && data) {
            setContent(prev => ({
              ...prev,
              ...data,
              heroSlides: Array.isArray(data.heroSlides) && data.heroSlides.length > 0
                ? data.heroSlides
                : (prev.heroSlides || DEFAULT_HERO_SLIDES)
            }));
            return;
          }
        }
      } catch (err) {
        // Quietly failover to LocalStorage fallback
      }

      try {
        const localContent = JSON.parse(localStorage.getItem('achintyah_home_content') || '{}');
        if (isMounted && localContent) {
          setContent(prev => ({
            ...prev,
            ...localContent,
            heroSlides: Array.isArray(localContent.heroSlides) && localContent.heroSlides.length > 0
              ? localContent.heroSlides
              : (prev.heroSlides || DEFAULT_HERO_SLIDES)
          }));
        }
      } catch (e) { }
    };

    loadHomeContent();
    return () => { isMounted = false; };
  }, []);

  const heroSlides = Array.isArray(content.heroSlides) && content.heroSlides.length > 0
    ? content.heroSlides
    : DEFAULT_HERO_SLIDES;

  const slideIntervalSec = Number(content.heroSlideInterval) || 3;

  // Auto-slide every 3 seconds (configurable by admin)
  useEffect(() => {
    if (isPaused || heroSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, slideIntervalSec * 1000);

    return () => clearInterval(timer);
  }, [isPaused, heroSlides.length, slideIntervalSec, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (idx) => {
    setCurrentSlide(idx);
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartXRef.current = null;
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="home">
      {/* Hero Section with Auto-sliding Background Images */}
      <section
        className="hero-section-new"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Achintyah Hero Slideshow"
      >
        {/* Background Images Carousel */}
        <div className="hero-slides-wrapper">
          {heroSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            const imgSrc = typeof slide === 'string' ? slide : (slide.imageUrl || slide.url);
            return (
              <div
                key={slide.id || idx}
                className={`hero-slide ${isActive ? 'active' : ''}`}
                aria-hidden={!isActive}
              >
                <div className="hero-bg-wrapper">
                  <img
                    src={formatImageUrl(imgSrc) || '/hero_farmer_bg.png'}
                    alt={`Hero Slide ${idx + 1}`}
                    className="hero-bg-img"
                    onError={(e) => { e.target.src = '/hero_farmer_bg.png'; }}
                  />
                </div>
              </div>
            );
          })}
          {/* Transparent soft gradient overlay for crystal-clear image visibility */}
          <div className="hero-bg-overlay"></div>
        </div>

        {/* Main Hero Content - Only the Main Text Appears */}
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

        {/* Prev / Next Slider Arrows */}
        {heroSlides.length > 1 && (
          <>
            <button
              className="hero-slider-nav prev"
              onClick={prevSlide}
              aria-label="Previous Hero Slide"
              title="Previous Slide"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className="hero-slider-nav next"
              onClick={nextSlide}
              aria-label="Next Hero Slide"
              title="Next Slide"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Clean, attractive pagination dots (NO 01/04 and NO paused indicator) */}
            <div className="hero-slider-pagination">
              {heroSlides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  className={`hero-slider-dot ${dotIdx === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(dotIdx)}
                  aria-label={`Slide ${dotIdx + 1} of ${heroSlides.length}`}
                  title={`Slide ${dotIdx + 1}`}
                >
                  <span
                    className="dot-fill"
                    key={`${dotIdx}-${currentSlide}`}
                    style={dotIdx === currentSlide && !isPaused ? { animationDuration: `${slideIntervalSec}s` } : {}}
                  />
                </button>
              ))}
            </div>
          </>
        )}

        {/* Curved Wave & Feature Badges Bar */}
        <div className="hero-bottom-wave-bar">
          <svg className="wave-svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#52b788" />
                <stop offset="32%" stopColor="#40916c" />
                <stop offset="68%" stopColor="#2d6a4f" />
                <stop offset="100%" stopColor="#1b4332" />
              </linearGradient>
            </defs>
            <path d="M0,40 C320,100 420,10 720,50 C1020,90 1200,20 1440,60 L1440,120 L0,120 Z" fill="url(#heroWaveGradient)"></path>
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
