import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { defaultProducts } from '../data/defaultProducts';
import { formatImageUrl } from '../utils/imageUtils';
import './Products.css';

const categories = ['All', 'Bio Fertilizers', 'Micronutrients', 'Water Soluble', 'Growth Regulators', 'Bio Pesticides', 'Organic Inputs'];

const Products = () => {
  const [products, setProducts] = useState(defaultProducts);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const apiHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:5001' 
      : '';
    
    const loadProducts = async () => {
      let list = [];
      try {
        const res = await fetch(`${apiHost}/api/products`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            list = data;
          }
        }
      } catch (err) {
        console.warn('Backend API unreachable or offline, using fallback catalog:', err.message);
      }

      if (list.length === 0) {
        list = [...defaultProducts];
      }

      // Merge custom/edited products saved in LocalStorage fallback
      try {
        const localProds = JSON.parse(localStorage.getItem('achintyah_products') || '[]');
        localProds.forEach(lp => {
          const idx = list.findIndex(p => p.id === lp.id);
          if (idx !== -1) {
            list[idx] = lp;
          } else {
            list.push(lp);
          }
        });
      } catch (e) {}

      if (isMounted) {
        setProducts(list);
        setLoading(false);
      }
    };

    loadProducts();
    return () => { isMounted = false; };
  }, []);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
                        (p.desc && p.desc.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="products-page">
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <span>Products</span>
          </div>
          <div className="page-hero-content">
            <h1>Our Product Range</h1>
            <p>Premium bio-agricultural inputs formulated for Indian agro-climatic conditions — from bio fertilizers to specialty micronutrients.</p>
          </div>
        </div>
      </section>

      <section className="section products-section">
        <div className="container">
          {/* Search & Filter */}
          <div className="products-toolbar">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="category-filters">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="results-count">
            Showing <strong>{filtered.length}</strong> products
            {activeCategory !== 'All' && <span> in <em>{activeCategory}</em></span>}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="no-products">
              <h3>Loading live product catalog...</h3>
            </div>
          ) : filtered.length > 0 ? (
            <div className="products-grid">
              {filtered.map(product => (
                <div className="product-card" key={product.id} onClick={() => setSelected(product)}>
                  {/* Image & Floating Emoji Header */}
                  <div className="product-image-container">
                    {product.imageUrl ? (
                      <img
                        src={formatImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="product-card-img"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div className="product-card-img-fallback" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                      <span className="fallback-emoji">{product.icon || '🌱'}</span>
                    </div>

                    {/* Floating Emoji Badge */}
                    <div className="floating-emoji-badge">{product.icon || '🌱'}</div>

                    {/* Product Tag */}
                    {product.tag && (
                      <span className={`product-tag ${product.tag === 'Bestseller' ? 'tag-gold' : product.tag === 'New' ? 'tag-blue' : 'tag-green'}`}>
                        {product.tag}
                      </span>
                    )}
                  </div>

                  <div className="product-card-body">
                    <div className="product-cat-badge">{product.category}</div>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.desc}</p>
                    <div className="product-meta">
                      <div className="product-meta-item">
                        <span className="meta-label">Benefit</span>
                        <span className="meta-value">{product.benefit || 'N/A'}</span>
                      </div>
                      <div className="product-meta-item">
                        <span className="meta-label">Dose</span>
                        <span className="meta-value">{product.dose || 'N/A'}</span>
                      </div>
                    </div>
                    <button className="product-cta">View Details →</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <div className="np-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try a different search term or category.</p>
              <button className="btn-primary" onClick={() => { setSearch(''); setActiveCategory('All'); }}>Clear Filters</button>
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>

            {selected.imageUrl ? (
              <div className="modal-image-header">
                <img src={selected.imageUrl} alt={selected.name} className="modal-header-img" />
                <span className="modal-floating-emoji">{selected.icon || '🌱'}</span>
              </div>
            ) : (
              <div className="modal-icon">{selected.icon || '🌱'}</div>
            )}

            <div className="modal-cat">{selected.category}</div>
            <h2 className="modal-title">{selected.name}</h2>
            <p className="modal-desc">{selected.desc}</p>
            <div className="modal-details">
              <div className="modal-detail"><span>✅ Benefit</span><strong>{selected.benefit || 'N/A'}</strong></div>
              <div className="modal-detail"><span>💧 Dose</span><strong>{selected.dose || 'N/A'}</strong></div>
              <div className="modal-detail"><span>🌾 Crops</span><strong>{selected.crops || 'N/A'}</strong></div>
            </div>
            <div className="modal-actions">
              <Link to="/contact" className="btn-primary" onClick={() => setSelected(null)}>Enquire Now →</Link>
              <button className="btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
