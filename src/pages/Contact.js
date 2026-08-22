import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [apiError, setApiError] = useState('');
  const [officeAddress, setOfficeAddress] = useState("204, Mauli CHS, Plot No. D-22,\nSector 20, Nerul, Navi Mumbai,\nMaharashtra - 400706");
  const [contactDetails, setContactDetails] = useState({
    phonePrimary: "+91 98765 43210",
    phoneSecondary: "+91 98765 43211",
    emailPrimary: "info@achintyah.com",
    emailSupport: "support@achintyah.com",
    workingHours: "Monday – Saturday: 9:00 AM – 6:30 PM (Sunday Closed)",
    mapEmbedUrl: "https://maps.google.com/?q=Nerul+Navi+Mumbai"
  });

  useEffect(() => {
    let isMounted = true;
    const apiHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5001' 
      : '';

    const fetchContactAndAboutContent = async () => {
      try {
        const resAbout = await fetch(`${apiHost}/api/about-content`);
        if (resAbout.ok) {
          const dataAbout = await resAbout.json();
          if (isMounted && dataAbout && dataAbout.officeAddress) {
            setOfficeAddress(dataAbout.officeAddress);
          }
        }
      } catch (err) {}

      try {
        const resContact = await fetch(`${apiHost}/api/contact-content`);
        if (resContact.ok) {
          const dataContact = await resContact.json();
          if (isMounted && dataContact) {
            setContactDetails(prev => ({ ...prev, ...dataContact }));
            if (dataContact.officeAddress) {
              setOfficeAddress(dataContact.officeAddress);
            }
          }
        }
      } catch (err) {}
    };

    fetchContactAndAboutContent();
    return () => { isMounted = false; };
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required';
    if (!form.phone.trim() || form.phone.trim().length < 10) e.phone = 'Valid phone number is required';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSending(true);
    setApiError('');

    const newInquiry = {
      id: `inq-${Date.now()}`,
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || 'N/A',
      subject: form.subject || 'General Contact',
      message: form.message.trim(),
      status: 'New'
    };

    // 1. Save to Local Storage immediately for guaranteed Admin Panel visibility
    try {
      const existing = JSON.parse(localStorage.getItem('achintyah_inquiries') || '[]');
      existing.unshift(newInquiry);
      localStorage.setItem('achintyah_inquiries', JSON.stringify(existing));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    // 2. Post to Express Backend API database
    try {
      const apiHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5001' 
        : '';
      await fetch(`${apiHost}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } catch (err) {
      console.warn('Backend API submission error:', err);
    }

    // 3. Web3Forms Email Dispatch to info@achintyah.com inbox
    try {
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'fd3e7450-1044-4432-87d3-ecd1e84b51c1',
          subject: `New Inquiry from ${form.name}: ${form.subject || 'General Contact'}`,
          from_name: form.name,
          email: form.email,
          phone: form.phone,
          message: `Phone: ${form.phone}\nTopic: ${form.subject}\n\nMessage:\n${form.message}`
        })
      }).catch(e => console.warn('Web3Forms dispatch error:', e));
    } catch (e) {
      console.warn('Web3Forms dispatch error:', e);
    }

    setSubmitted(true);
    setSending(false);
  };

  return (
    <div className="contact-page">
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Contact Us</span>
          </div>
          <div className="page-hero-content">
            <h1>Get In Touch</h1>
            <p>We're here to help with product enquiries, dealer partnerships, crop advisory and general support.</p>
          </div>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container contact-grid">
          {/* Info Panel */}
          <div className="contact-info">
            <div className="ci-card">
              <h3>Contact Information</h3>
              <p className="ci-sub">Reach us through any of the channels below. Our team responds within 24 hours on business days.</p>

              <div className="ci-items">
                <div className="ci-item">
                  <div className="ci-icon">📍</div>
                  <div>
                    <strong>Registered Office</strong>
                    <span style={{ whiteSpace: 'pre-line' }}>{officeAddress}</span>
                  </div>
                </div>
                <div className="ci-item">
                  <div className="ci-icon">📞</div>
                  <div>
                    <strong>Phone / WhatsApp</strong>
                    <span>{contactDetails.phonePrimary || "+91 98765 43210"}</span>
                    {contactDetails.phoneSecondary && <span>{contactDetails.phoneSecondary}</span>}
                  </div>
                </div>
                <div className="ci-item">
                  <div className="ci-icon">✉️</div>
                  <div>
                    <strong>Email Support</strong>
                    <span>{contactDetails.emailPrimary || "info@achintyah.com"}</span>
                    {contactDetails.emailSupport && <span>{contactDetails.emailSupport}</span>}
                  </div>
                </div>
                <div className="ci-item">
                  <div className="ci-icon">🕐</div>
                  <div>
                    <strong>Business Hours</strong>
                    <span>{contactDetails.workingHours || "Monday – Saturday: 9:00 AM – 6:30 PM (Sunday Closed)"}</span>
                  </div>
                </div>
              </div>

              <div className="ci-social">
                <p>Reach us directly on WhatsApp</p>
                <div className="ci-social-links">
                  <a href={`https://wa.me/${(contactDetails.phonePrimary || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="ci-social-btn">💬 Chat on WhatsApp</a>
                </div>
              </div>
            </div>

            {/* Quick Contact Cards */}
            <div className="quick-contact-cards">
              <div className="qcc">
                <span>🌾</span>
                <div>
                  <strong>Crop Advisory</strong>
                  <p>Talk to our agronomist</p>
                </div>
              </div>
              <div className="qcc">
                <span>🤝</span>
                <div>
                  <strong>Dealer Enquiry</strong>
                  <p>Partnership opportunities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="contact-form-wrap">
            {submitted ? (
              <div className="success-state">
                <div className="success-icon">🎉</div>
                <h2>Thank You!</h2>
                <p>Your message has been received. Our team will get back to you within 24 business hours.</p>
                <div className="success-details">
                  <strong>Name:</strong> {form.name}<br />
                  <strong>Email:</strong> {form.email}<br />
                  <strong>Phone:</strong> {form.phone}
                </div>
                <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="contact-form-card">
                <h3>Send Us a Message</h3>
                <p className="form-sub">Fill in the form below and we'll respond promptly.</p>
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <div className="form-row">
                    <div className={`form-group ${errors.name ? 'error' : ''}`}>
                      <label>Full Name *</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
                      {errors.name && <span className="err-msg">{errors.name}</span>}
                    </div>
                    <div className={`form-group ${errors.phone ? 'error' : ''}`}>
                      <label>Phone Number *</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                      {errors.phone && <span className="err-msg">{errors.phone}</span>}
                    </div>
                  </div>
                  <div className={`form-group ${errors.email ? 'error' : ''}`}>
                    <label>Email Address *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
                    {errors.email && <span className="err-msg">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <select name="subject" value={form.subject} onChange={handleChange}>
                      <option value="">Select a topic</option>
                      <option value="product">Product Enquiry</option>
                      <option value="dealer">Dealer / Distributor Partnership</option>
                      <option value="advisory">Crop Advisory</option>
                      <option value="bulk">Bulk Order</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className={`form-group ${errors.message ? 'error' : ''}`}>
                    <label>Message *</label>
                    <textarea name="message" value={form.message} onChange={handleChange} placeholder="Describe your query, product interest, or crop details..." rows="5" />
                    {errors.message && <span className="err-msg">{errors.message}</span>}
                  </div>

                  {apiError && <div className="err-msg" style={{ marginBottom: '15px', display: 'block', fontSize: '14px' }}>{apiError}</div>}
                  <button type="submit" className="btn-primary submit-btn" disabled={sending}>
                    {sending ? 'Sending Message...' : 'Send Message →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
