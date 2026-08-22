import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatImageUrl } from '../utils/imageUtils';
import './About.css';

const DEFAULT_ABOUT_CONTENT = {
  officeTitle: "Achintyah Agrogreentech Pvt. Ltd.",
  officeAddress: "204, Mauli CHS, Plot No. D-22,\nSector 20, Nerul, Navi Mumbai,\nMaharashtra, India - 400706",
  officeTag1: "CIN Registered",
  officeTag2: "MCA Compliant",
  certifications: [
    { id: 1, icon: '🏅', title: 'ISO 9001:2015', desc: 'Quality Management System Certified', imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80' },
    { id: 2, icon: '🌿', title: 'FCO Approved', desc: 'Fertilizer Control Order Compliant', imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500&auto=format&fit=crop&q=80' },
    { id: 3, icon: '🏭', title: 'GMP Certified', desc: 'Good Manufacturing Practices', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80' },
    { id: 4, icon: '📋', title: 'MCA Registered', desc: 'Ministry of Corporate Affairs, India', imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&auto=format&fit=crop&q=80' }
  ],
  team: [
    { id: 1, name: 'Director', role: 'Management & Strategy', initial: 'D', color: '#1a472a', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80' },
    { id: 2, name: 'Agronomy Head', role: 'Crop Science & Advisory', initial: 'H', color: '#40916c', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80' },
    { id: 3, name: 'R&D Lead', role: 'Product Formulation', initial: 'R', color: '#c8962c', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80' },
    { id: 4, name: 'Operations Head', role: 'Supply Chain & Logistics', initial: 'O', color: '#5c4033', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80' }
  ]
};

const About = () => {
  const [content, setContent] = useState(DEFAULT_ABOUT_CONTENT);

  useEffect(() => {
    let isMounted = true;
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5001'
      : '';

    const fetchAboutContent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/about-content`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && (data.officeTitle || data.certifications)) {
            setContent(prev => ({ ...prev, ...data }));
          }
        }
      } catch (err) {
        // Quietly failover to DEFAULT_ABOUT_CONTENT
      }
    };

    fetchAboutContent();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="about-page">
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <span>About Us</span>
          </div>
          <div className="page-hero-content">
            <h1>About Achintyah Agrogreentech</h1>
            <p>A Maharashtra-born company dedicated to pioneering sustainable green agricultural technology across India.</p>
          </div>
        </div>
      </section>

      {/* Mission Vision */}
      <section className="section mv-section">
        <div className="container mv-grid">
          <div className="mv-card mv-mission">
            <div className="mv-icon">🎯</div>
            <h3>Our Mission</h3>
            <p>To empower every Indian farmer with affordable, high-quality, eco-friendly agricultural inputs that enhance productivity while preserving soil health and the natural environment for future generations.</p>
          </div>
          <div className="mv-card mv-vision">
            <div className="mv-icon">🔭</div>
            <h3>Our Vision</h3>
            <p>To become India's most trusted green agro-technology company, driving a sustainable farming revolution that balances economic growth with ecological responsibility across rural India.</p>
          </div>
          <div className="mv-card mv-values">
            <div className="mv-icon">💎</div>
            <h3>Our Values</h3>
            <ul className="values-list">
              <li>🌱 Sustainability First</li>
              <li>🔬 Innovation Driven</li>
              <li>🤝 Farmer-Centric</li>
              <li>✅ Uncompromising Quality</li>
              <li>🌍 Environmental Stewardship</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Company Story & Registered Office */}
      <section className="section story-section">
        <div className="container story-grid">
          <div className="story-text">
            <span className="section-label">Our Story</span>
            <h2 className="section-title">Born from a Farmer's Need</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '20px' }}>
              Achintyah Agrogreentech Pvt Ltd was born from a simple but powerful observation — that
              Indian farmers were spending heavily on chemical inputs that were degrading their soils
              year after year, with diminishing returns and increasing health risks.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '20px' }}>
              Our founders, rooted in Maharashtra's agricultural heartland, set out to create a company
              that would bridge the gap between cutting-edge biotechnology and the practical needs of
              the farmer in the field. Registered in Panvel, Maharashtra, we operate with a deep
              understanding of the Konkan and Deccan agro-climatic zones.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '32px' }}>
              Today, Achintyah Agrogreentech supplies premium bio-fertilizers, micronutrients, water-soluble
              fertilizers, plant growth regulators, and organic inputs to farmers across India — all
              manufactured to the highest quality standards and priced fairly to ensure accessibility.
            </p>
            <div className="story-highlights">
              <div className="story-highlight">
                <span className="sh-num">145+</span>
                <span className="sh-label">Product SKUs</span>
              </div>
              <div className="story-highlight">
                <span className="sh-num">15+</span>
                <span className="sh-label">States Covered</span>
              </div>
              <div className="story-highlight">
                <span className="sh-num">1000+</span>
                <span className="sh-label">Farmers Served</span>
              </div>
            </div>
          </div>
          <div className="story-visual">
            <div className="story-main-card">
              <div className="smc-header">
                <span>Registered Office</span>
              </div>
              <div className="smc-body">
                <div className="smc-icon">📍</div>
                <h4>{content.officeTitle || "Achintyah Agrogreentech Pvt. Ltd."}</h4>
                <p style={{ whiteSpace: 'pre-line' }}>
                  {content.officeAddress || "204, Mauli CHS, Plot No. D-22,\nSector 20, Nerul, Navi Mumbai,\nMaharashtra, India - 400706"}
                </p>
                <div className="smc-tags">
                  {content.officeTag1 && <span className="tag">{content.officeTag1}</span>}
                  {content.officeTag2 && <span className="tag">{content.officeTag2}</span>}
                </div>
              </div>
            </div>
            <div className="story-side-cards">
              <div className="story-side-card">
                <span>🏭</span>
                <div>
                  <strong>Manufacturing</strong>
                  <span>GMP Certified Facility</span>
                </div>
              </div>
              <div className="story-side-card">
                <span>🌿</span>
                <div>
                  <strong>Products</strong>
                  <span>100% Eco-Safe Formulas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications & Compliance */}
      <section className="section cert-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <span className="section-label">Quality Assurance</span>
            <h2 className="section-title">Our Certifications & Compliance</h2>
          </div>
          <div className="cert-grid">
            {(content.certifications || DEFAULT_ABOUT_CONTENT.certifications).map((c, i) => (
              <div className="cert-card" key={c.id || i}>
                {c.imageUrl ? (
                  <div className="cert-img-box">
                    <img src={formatImageUrl(c.imageUrl)} alt={c.title} className="cert-img" />
                  </div>
                ) : (
                  <div className="cert-icon">{c.icon || '🏅'}</div>
                )}
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Team */}
      <section className="section team-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <span className="section-label">The People Behind</span>
            <h2 className="section-title">Our Expert Team</h2>
            <p className="section-subtitle" style={{ margin: '0 auto', textAlign: 'center' }}>
              A blend of agricultural science, business acumen, and passion for sustainable farming
            </p>
          </div>
          <div className="team-grid">
            {(content.team || DEFAULT_ABOUT_CONTENT.team).map((member, i) => (
              <div className="team-card" key={member.id || i}>
                {member.imageUrl ? (
                  <div className="team-photo-avatar">
                    <img src={formatImageUrl(member.imageUrl)} alt={member.name} />
                  </div>
                ) : (
                  <div className="team-avatar" style={{ background: member.color || '#1a472a' }}>
                    {member.initial || member.name.charAt(0)}
                  </div>
                )}
                <h4>{member.name}</h4>
                <span className="team-role">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2>Partner With Us</h2>
          <p>Join thousands of farmers and agri-dealers who trust Achintyah Agrogreentech for their green input needs.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '32px' }}>
            <Link to="/contact" className="btn-primary">Get In Touch →</Link>
            <Link to="/products" className="btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>Our Products</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
