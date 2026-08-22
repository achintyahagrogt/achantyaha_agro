import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Services.css';

const defaultServices = [
  {
    icon: '🌾',
    title: 'Crop Nutrition Advisory',
    desc: 'Our team of certified agronomists provides customized crop nutrition programs based on soil test reports, crop variety, water quality, and target yield. We analyse your farm data and prescribe the optimal fertilizer schedule for the entire growing season.',
    features: ['Soil & water analysis interpretation', 'Crop-stage nutrition scheduling', 'Deficiency diagnosis & correction', 'Yield improvement strategy'],
  },
  {
    icon: '🔬',
    title: 'Product Technical Support',
    desc: 'We provide comprehensive technical guidance on product selection, dose calibration, compatibility testing, and application methods. Our experts ensure you get the maximum return on every input you use from our product range.',
    features: ['Dose & dilution guidance', 'Spray schedule planning', 'Compatibility charts', 'Field demonstration support'],
  },
  {
    icon: '🚜',
    title: 'Dealer & Distributor Support',
    desc: 'We partner with agri-dealers, distributors, and Farmer Producer Organisations (FPOs) across India. Our dealer support programme includes training, promotional materials, demo kits, and preferential pricing for bulk orders.',
    features: ['Dealer training programmes', 'Co-branded promotional support', 'Demo trial kits', 'Bulk order discounts'],
  },
  {
    icon: '📊',
    title: 'Farm-to-Market Consulting',
    desc: 'Beyond inputs, we assist progressive farmers in planning their production to meet market quality requirements including export-grade produce, residue-free certification, and traceability documentation.',
    features: ['Residue-free farming protocol', 'GlobalGAP pre-audit support', 'Export quality planning', 'Market linkage guidance'],
  },
  {
    icon: '🎓',
    title: 'Farmer Training & Workshops',
    desc: 'We conduct field-level training workshops, farmer meet programmes, and demonstration plots to educate farming communities on sustainable practices, IPM, soil health management, and new crop technologies.',
    features: ['Village-level demo plots', 'Kisan mela participation', 'Digital agri-training', 'Certificate training programs'],
  },
  {
    icon: '🌐',
    title: 'Digital Agri-Extension',
    desc: 'Leveraging digital tools, we offer remote crop advisory, product usage videos, and online consultation services to reach farmers in remote areas who may not have easy access to field agronomists.',
    features: ['WhatsApp advisory service', 'YouTube crop tutorials', 'Online consultation booking', 'Multi-language content'],
  },
];

const process = [
  { step: '01', title: 'Enquiry', desc: 'Reach out to us by phone, email, or our online form with your query.' },
  { step: '02', title: 'Assessment', desc: 'Our agronomy team reviews your crop details, soil type, and specific challenge.' },
  { step: '03', title: 'Recommendation', desc: 'We prepare a customised product & nutrition plan tailored to your farm.' },
  { step: '04', title: 'Delivery', desc: 'Products are dispatched swiftly to your location through our logistics network.' },
  { step: '05', title: 'Follow-up', desc: 'Our team follows up to review results and provide any further guidance.' },
];

const Services = () => {
  const [heroTitle, setHeroTitle] = useState('Our Services');
  const [heroSub, setHeroSub] = useState('Beyond products — we are your end-to-end agri-technology partner, from field advisory to market linkage.');
  const [servicesList, setServicesList] = useState(defaultServices);

  useEffect(() => {
    let isMounted = true;
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5001'
      : '';

    const fetchServicesContent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/services-content`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            if (data.heroTitle) setHeroTitle(data.heroTitle);
            if (data.heroSub) setHeroSub(data.heroSub);
            if (Array.isArray(data.services) && data.services.length > 0) {
              setServicesList(data.services);
            }
          }
        }
      } catch (err) {
        // Fallback to defaults
      }
    };

    fetchServicesContent();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="services-page">
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Services</span>
          </div>
          <div className="page-hero-content">
            <h1>{heroTitle}</h1>
            <p>{heroSub}</p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section services-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-label">What We Do</span>
            <h2 className="section-title">Comprehensive Agri Services</h2>
            <p className="section-subtitle" style={{ margin: '0 auto', textAlign: 'center' }}>
              We go beyond selling products — our experts work alongside you to ensure success at every stage of your farming journey.
            </p>
          </div>
          <div className="services-grid">
            {servicesList.map((svc, i) => (
              <div className="service-card" key={svc.id || i}>
                <div className="svc-header">
                  <div className="svc-icon">{svc.icon || '🌾'}</div>
                  <h3 className="svc-title">{svc.title}</h3>
                </div>
                <p className="svc-desc">{svc.desc}</p>
                {Array.isArray(svc.features) && svc.features.length > 0 && (
                  <ul className="svc-features">
                    {svc.features.map((f, j) => (
                      <li key={j}>
                        <span className="svc-check">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/contact" className="svc-cta">Enquire →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section process-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-label">How It Works</span>
            <h2 className="section-title">Our Simple 5-Step Process</h2>
          </div>
          <div className="process-steps">
            {process.map((step, i) => (
              <div className="process-step" key={i}>
                <div className="ps-number">{step.step}</div>
                <div className="ps-content">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
                {i < process.length - 1 && <div className="ps-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="section coverage-section">
        <div className="container coverage-grid">
          <div className="coverage-text">
            <span className="section-label">Our Reach</span>
            <h2 className="section-title">Serving Farmers Across India</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '28px' }}>
              From our registered office in Karanjade, Panvel, Maharashtra, we extend our services and products to farmers,
              dealers, and agri-businesses across all major agricultural states in India. Our network of
              distributors and field agronomists ensures last-mile connectivity.
            </p>
            <div className="coverage-states">
              {['Maharashtra', 'Karnataka', 'Gujarat', 'Andhra Pradesh', 'Telangana', 'Madhya Pradesh', 'Rajasthan', 'Punjab', 'Uttar Pradesh', 'Tamil Nadu'].map(state => (
                <span className="state-tag" key={state}>📍 {state}</span>
              ))}
            </div>
          </div>
          <div className="coverage-stats">
            <div className="cs-item">
              <span className="cs-num">15+</span>
              <span className="cs-label">States Covered</span>
            </div>
            <div className="cs-item">
              <span className="cs-num">200+</span>
              <span className="cs-label">Dealer Partners</span>
            </div>
            <div className="cs-item">
              <span className="cs-num">1000+</span>
              <span className="cs-label">Farmers Served</span>
            </div>
            <div className="cs-item">
              <span className="cs-num">24hr</span>
              <span className="cs-label">Query Response</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="services-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Need Expert Agri Advice?</h2>
          <p>Talk to our agronomists today. Get personalised product and crop management recommendations at no cost.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
            <Link to="/contact" className="btn-gold">Talk to an Agronomist →</Link>
            <Link to="/products" className="btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>Browse Products</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
