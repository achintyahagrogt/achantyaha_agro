import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { defaultProducts } from '../data/defaultProducts';
import { formatImageUrl } from '../utils/imageUtils';
import './Admin.css';

const ALL_PERMISSIONS = ['create', 'read', 'update', 'delete', 'manage_users'];
const EMOJI_PALETTE = ['🌿', '🌊', '🔬', '💧', '🌱', '🛡️', '⚗️', '🌍', '🌻', '🧪', '🌾', '⚡', '🥭', '🍇', '🌽'];

const Admin = () => {
  const { user, token, logout, hasPermission, API_BASE } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('inquiries');
  const [products, setProducts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Search & Filter State
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', category: 'Bio Fertilizers', icon: '🌿', imageUrl: '', tag: '', desc: '', benefit: '', dose: '', crops: ''
  });

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '', password: '', name: '', role: 'editor', permissions: ['create', 'read', 'update']
  });

  // Snapshots State
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  // Home Page Form State
  const [homeForm, setHomeForm] = useState({
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
  });

  // About Page Form State
  const [aboutForm, setAboutForm] = useState({
    officeTitle: "Achintyah Agrogreentech Pvt. Ltd.",
    officeAddress: "204, Mauli CHS, Plot No. D-22,\nSector 20, Nerul, Navi Mumbai,\nMaharashtra, India - 400706",
    officeTag1: "Registered Company",
    officeTag2: "Quality Compliant",
    certifications: [
      { id: 1, icon: '🏅', title: 'ISO 9001:2015', desc: 'Quality Management System Certified', imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80' },
      { id: 2, icon: '🌿', title: 'Quality Approved', desc: 'Fertilizer Control & Safety Compliant', imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500&auto=format&fit=crop&q=80' },
      { id: 3, icon: '🏭', title: 'GMP Certified', desc: 'Good Manufacturing Practices', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80' },
      { id: 4, icon: '📋', title: 'Government Registered', desc: 'Ministry of Corporate Affairs Registered', imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&auto=format&fit=crop&q=80' }
    ],
    team: [
      { id: 1, name: 'Director', role: 'Management & Strategy', initial: 'D', color: '#1a472a', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80' },
      { id: 2, name: 'Agronomy Head', role: 'Crop Science & Advisory', initial: 'H', color: '#40916c', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80' },
      { id: 3, name: 'R&D Lead', role: 'Product Formulation', initial: 'R', color: '#c8962c', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80' },
      { id: 4, name: 'Operations Head', role: 'Supply Chain & Logistics', initial: 'O', color: '#5c4033', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80' }
    ]
  });

  // Services Page Form State
  const [servicesForm, setServicesForm] = useState({
    heroTitle: "Professional Agricultural Services",
    heroSub: "Empowering farmers with expert advisory, customized soil health solutions, and high-yield farming support.",
    services: [
      {
        id: 1,
        icon: "🌾",
        title: "Crop Nutrition Advisory",
        desc: "Customized crop nutrition programs based on soil test reports, crop variety, water quality, and target yield.",
        featuresStr: "Soil & water analysis interpretation, Crop-stage nutrition scheduling, Deficiency correction, Yield improvement strategy"
      },
      {
        id: 2,
        icon: "🔬",
        title: "Product Technical Support",
        desc: "Technical guidance on product selection, dose calibration, compatibility testing, and application methods.",
        featuresStr: "Dose & dilution guidance, Spray schedule planning, Compatibility charts, Field trial support"
      },
      {
        id: 3,
        icon: "🚜",
        title: "Dealer & Distributor Support",
        desc: "Partnership programs with agri-dealers, distributors, and FPOs across India with preferential pricing.",
        featuresStr: "Dealer training programs, Promotional support, Demo trial kits, Bulk order discounts"
      },
      {
        id: 4,
        icon: "📊",
        title: "Farm-to-Market Consulting",
        desc: "Helping farmers plan production to meet market quality requirements, residue-free protocols, and export standards.",
        featuresStr: "Residue-free farming protocol, GlobalGAP support, Export quality planning, Market linkage guidance"
      }
    ]
  });

  // Contact Info Form State
  const [contactForm, setContactForm] = useState({
    phonePrimary: "+91 98765 43210",
    phoneSecondary: "+91 98765 43211",
    emailPrimary: "info@achintyah.com",
    emailSupport: "support@achintyah.com",
    officeAddress: "204, Mauli CHS, Plot No. D-22,\nSector 20, Nerul, Navi Mumbai,\nMaharashtra, India - 400706",
    workingHours: "Monday – Saturday: 9:00 AM – 6:30 PM (Sunday Closed)",
    mapEmbedUrl: "https://maps.google.com/?q=Nerul+Navi+Mumbai"
  });

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch Products
  const fetchProducts = async () => {
    let list = [];
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          list = data;
        }
      }
    } catch (err) {
      console.warn('Backend products fetch offline fallback:', err);
    }

    if (list.length === 0) {
      list = [...defaultProducts];
    }

    // Filter out test items
    list = list.filter(p => p.name && p.name !== 'XYZ' && p.name !== 'Abc');

    try {
      const localProds = JSON.parse(localStorage.getItem('achintyah_products') || '[]');
      localProds.forEach(lp => {
        if (lp.name === 'XYZ' || lp.name === 'Abc') return;
        const idx = list.findIndex(p => p.id === lp.id);
        if (idx !== -1) {
          list[idx] = lp;
        } else {
          list.push(lp);
        }
      });
    } catch (e) {}

    setProducts(list);
  };

  // Fetch Users (Admin only)
  const fetchUsers = async () => {
    if (!hasPermission('manage_users')) return;
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Fetch Inquiries
  const fetchInquiries = async () => {
    let apiInquiries = [];
    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        apiInquiries = await res.json();
      }
    } catch (err) {
      console.warn('Backend inquiries fetch offline/fallback:', err);
    }

    let localInquiries = [];
    try {
      localInquiries = JSON.parse(localStorage.getItem('achintyah_inquiries') || '[]');
    } catch (err) {
      console.warn('LocalStorage read error:', err);
    }

    const combined = [...localInquiries];
    apiInquiries.forEach(apiItem => {
      if (!combined.some(item => item.id === apiItem.id || (item.email === apiItem.email && item.message === apiItem.message))) {
        combined.push(apiItem);
      }
    });

    setInquiries(combined);
  };

  // Fetch Home Content
  const fetchHomeContent = async () => {
    try {
      const res = await fetch(`${API_BASE}/home-content`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.aboutTitle) {
          setHomeForm(prev => ({ ...prev, ...data }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch home content:', err);
    }
  };

  // Fetch About Content
  const fetchAboutContent = async () => {
    try {
      const res = await fetch(`${API_BASE}/about-content`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.officeTitle || data.certifications)) {
          setAboutForm(prev => ({ ...prev, ...data }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch about content:', err);
    }
  };

  // Fetch Services Content
  const fetchServicesContent = async () => {
    try {
      const res = await fetch(`${API_BASE}/services-content`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.heroTitle || data.services)) {
          setServicesForm(prev => ({ ...prev, ...data }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch services content:', err);
    }
  };

  // Fetch Contact Content
  const fetchContactContent = async () => {
    try {
      const res = await fetch(`${API_BASE}/contact-content`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.phonePrimary || data.officeAddress)) {
          setContactForm(prev => ({ ...prev, ...data }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch contact content:', err);
    }
  };

  // Fetch Snapshots
  const fetchSnapshots = async () => {
    let list = [];
    try {
      const res = await fetch(`${API_BASE}/snapshots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        list = await res.json();
      }
    } catch (err) {
      console.warn('Backend snapshot fetch offline fallback:', err);
    }

    try {
      const localSnaps = JSON.parse(localStorage.getItem('achintyah_snapshots') || '[]');
      localSnaps.forEach(ls => {
        if (!list.some(s => s.id === ls.id)) {
          list.push(ls);
        }
      });
    } catch (e) {}

    setSnapshots(list);
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchProducts(),
        fetchUsers(),
        fetchInquiries(),
        fetchHomeContent(),
        fetchAboutContent(),
        fetchServicesContent(),
        fetchContactContent(),
        fetchSnapshots()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  // Save Handlers
  const handleHomeSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const formattedForm = {
      ...homeForm,
      mainImg: formatImageUrl(homeForm.mainImg),
      sideImg1: formatImageUrl(homeForm.sideImg1),
      sideImg2: formatImageUrl(homeForm.sideImg2)
    };
    try {
      localStorage.setItem('achintyah_home_content', JSON.stringify(formattedForm));
      const res = await fetch(`${API_BASE}/home-content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formattedForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('✅ Homepage content saved successfully!');
    } catch (err) {
      setMessage(`Error saving home content: ${err.message}`);
    }
  };

  const handleAboutSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const formattedForm = {
      ...aboutForm,
      certifications: (aboutForm.certifications || []).map(c => ({ ...c, imageUrl: formatImageUrl(c.imageUrl) })),
      team: (aboutForm.team || []).map(m => ({ ...m, imageUrl: formatImageUrl(m.imageUrl) }))
    };
    try {
      localStorage.setItem('achintyah_about_content', JSON.stringify(formattedForm));
      const res = await fetch(`${API_BASE}/about-content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formattedForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('✅ About Us content saved successfully!');
    } catch (err) {
      setMessage(`Error saving about content: ${err.message}`);
    }
  };

  const handleServicesSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      localStorage.setItem('achintyah_services_content', JSON.stringify(servicesForm));
      const res = await fetch(`${API_BASE}/services-content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(servicesForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('✅ Services page content saved successfully!');
    } catch (err) {
      setMessage(`Error saving services content: ${err.message}`);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      localStorage.setItem('achintyah_contact_content', JSON.stringify(contactForm));
      const res = await fetch(`${API_BASE}/contact-content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(contactForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('✅ Contact details saved successfully!');
    } catch (err) {
      setMessage(`Error saving contact details: ${err.message}`);
    }
  };

  // Product submit handler
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const formattedProductForm = {
      ...productForm,
      imageUrl: formatImageUrl(productForm.imageUrl)
    };

    const isEdit = !!editingProduct;
    const url = isEdit ? `${API_BASE}/products/${editingProduct.id}` : `${API_BASE}/products`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formattedProductForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Save to LocalStorage fallback as well
      const local = JSON.parse(localStorage.getItem('achintyah_products') || '[]');
      if (isEdit) {
        const idx = local.findIndex(p => p.id === editingProduct.id);
        if (idx !== -1) local[idx] = { ...editingProduct, ...formattedProductForm };
        else local.push({ ...editingProduct, ...formattedProductForm });
      } else {
        local.push(data.product || { id: Date.now(), ...formattedProductForm });
      }
      localStorage.setItem('achintyah_products', JSON.stringify(local));

      setMessage(isEdit ? '✅ Product updated successfully!' : '✅ New product added successfully!');
      setProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product from the catalog?')) return;
    setMessage('');

    try {
      const localProds = JSON.parse(localStorage.getItem('achintyah_products') || '[]');
      const updated = localProds.filter(p => p.id !== id);
      localStorage.setItem('achintyah_products', JSON.stringify(updated));
    } catch (err) {}

    try {
      await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {}

    setMessage('✅ Product removed successfully!');
    fetchProducts();
  };

  // Status toggle handler for Customer Inquiries
  const handleStatusChange = async (id, newStatus) => {
    try {
      const local = JSON.parse(localStorage.getItem('achintyah_inquiries') || '[]');
      const idx = local.findIndex(i => i.id === id);
      if (idx !== -1) {
        local[idx].status = newStatus;
        localStorage.setItem('achintyah_inquiries', JSON.stringify(local));
      }
    } catch (e) {}

    try {
      await fetch(`${API_BASE}/inquiries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {}

    fetchInquiries();
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer inquiry?')) return;
    setMessage('');

    try {
      const local = JSON.parse(localStorage.getItem('achintyah_inquiries') || '[]');
      const updated = local.filter(i => i.id !== id);
      localStorage.setItem('achintyah_inquiries', JSON.stringify(updated));
    } catch (e) {}

    try {
      await fetch(`${API_BASE}/inquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {}

    setMessage('✅ Inquiry deleted successfully!');
    fetchInquiries();
  };

  // Services item handlers
  const handleAddServiceItem = () => {
    const newSvc = {
      id: Date.now(),
      icon: '🌾',
      title: 'New Agri Service',
      desc: 'Explain what this service offers to farmers...',
      featuresStr: 'Feature 1, Feature 2, Feature 3'
    };
    setServicesForm(prev => ({
      ...prev,
      services: [...(prev.services || []), newSvc]
    }));
  };

  const handleDeleteServiceItem = (index) => {
    setServicesForm(prev => ({
      ...prev,
      services: (prev.services || []).filter((_, i) => i !== index)
    }));
  };

  const handleServiceItemChange = (index, field, value) => {
    setServicesForm(prev => {
      const updated = [...(prev.services || [])];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'featuresStr') {
        updated[index].features = value.split(',').map(s => s.trim()).filter(Boolean);
      }
      return { ...prev, services: updated };
    });
  };

  // About Page Certifications & Team Handlers
  const handleAddCertification = () => {
    const newCert = {
      id: Date.now(),
      icon: '🏅',
      title: 'Quality Certification',
      desc: 'Certification description',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80'
    };
    setAboutForm(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCert]
    }));
  };

  const handleDeleteCertification = (index) => {
    setAboutForm(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddTeamMember = () => {
    const newMember = {
      id: Date.now(),
      name: 'Team Executive',
      role: 'Department Role',
      initial: 'E',
      color: '#1a472a',
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80'
    };
    setAboutForm(prev => ({
      ...prev,
      team: [...(prev.team || []), newMember]
    }));
  };

  const handleDeleteTeamMember = (index) => {
    setAboutForm(prev => ({
      ...prev,
      team: (prev.team || []).filter((_, i) => i !== index)
    }));
  };

  // Snapshot handlers
  const handleCreateSnapshot = async (e) => {
    e.preventDefault();
    setSnapshotLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/snapshots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: snapshotName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage('✅ Website backup saved successfully!');
      setSnapshotModalOpen(false);
      setSnapshotName('');
      fetchSnapshots();
    } catch (err) {
      setMessage(`Snapshot error: ${err.message}`);
    } finally {
      setSnapshotLoading(false);
    }
  };

  const handleRestoreSnapshot = async (snap) => {
    if (!window.confirm(`Are you sure you want to restore website content to backup "${snap.name}"?`)) return;
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/snapshots/${snap.id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(`✅ Website restored successfully to backup: "${snap.name}"`);
      fetchProducts();
      fetchInquiries();
      fetchHomeContent();
      fetchAboutContent();
      fetchServicesContent();
      fetchContactContent();
    } catch (err) {
      setMessage(`Restore error: ${err.message}`);
    }
  };

  const handleExportSnapshot = (snap) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snap, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Achintyah_Backup_${snap.name.replace(/[^a-z0-9]/gi, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSnapshot = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && parsed.data) {
            if (window.confirm(`Import backup "${parsed.name || 'File'}" and restore content?`)) {
              if (parsed.data.products) setProducts(parsed.data.products);
              if (parsed.data.homeContent) setHomeForm(parsed.data.homeContent);
              if (parsed.data.aboutContent) setAboutForm(parsed.data.aboutContent);
              if (parsed.data.servicesContent) setServicesForm(parsed.data.servicesContent);
              if (parsed.data.contactContent) setContactForm(parsed.data.contactContent);
              setMessage('✅ Backup file imported and applied successfully!');
            }
          } else {
            alert('Invalid backup file format');
          }
        } catch (err) {
          alert('Failed to read backup file');
        }
      };
    }
  };

  const handleDeleteSnapshot = async (id) => {
    if (!window.confirm('Delete this backup entry?')) return;
    try {
      await fetch(`${API_BASE}/snapshots/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSnapshots();
    } catch (e) {}
  };

  // User handlers
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage('✅ New staff account added successfully!');
      setUserModalOpen(false);
      setUserForm({ username: '', password: '', name: '', role: 'editor', permissions: ['create', 'read', 'update'] });
      fetchUsers();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff account?')) return;
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage('✅ Staff account deleted successfully!');
      fetchUsers();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  if (!user) return null;

  // Filtered lists
  const filteredInquiries = inquiries.filter(inq => {
    const matchesStatus = inquiryStatusFilter === 'All' || inq.status === inquiryStatusFilter;
    const matchesSearch = !inquirySearch || 
      (inq.name && inq.name.toLowerCase().includes(inquirySearch.toLowerCase())) ||
      (inq.email && inq.email.toLowerCase().includes(inquirySearch.toLowerCase())) ||
      (inq.subject && inq.subject.toLowerCase().includes(inquirySearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const filteredProducts = products.filter(p => {
    const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const matchesSearch = !productSearch || (p.name && p.name.toLowerCase().includes(productSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="admin-container">
      {/* Header bar */}
      <div className="admin-header">
        <div className="admin-title-box">
          <h1>Website Management Dashboard</h1>
          <p className="admin-sub">Easily update website pages, product catalog, contact information, and customer messages</p>
        </div>
        <div className="user-badge-group">
          <Link to="/" className="btn-sm btn-edit" style={{ textDecoration: 'none', padding: '8px 14px', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>🌐 View Live Website</Link>
          <span className="user-name-tag">Logged in: <strong>{user.name}</strong></span>
          <span className={`role-pill role-${user.role}`}>{user.role === 'admin' ? 'Full Admin' : 'Content Editor'}</span>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </div>

      {message && <div className="permission-warning" style={{ background: '#eef7f0', color: '#166534', border: '1px solid #bbf7d0', padding: '12px 18px', borderRadius: '8px', marginBottom: '18px' }}>{message}</div>}

      {/* Role permission info banner */}
      {user.role !== 'admin' && (
        <div className="permission-warning">
          <strong>Staff Account Level ({user.role.toUpperCase()})</strong>: 
          {user.role === 'editor' && ' You can add and edit products and page content. Deleting items and managing staff accounts is reserved for full Admins.'}
          {user.role === 'viewer' && ' You have read-only view access.'}
        </div>
      )}

      {/* DASHBOARD STATS BAR */}
      <div className="admin-stats-grid">
        <div className="stat-card" onClick={() => setActiveTab('inquiries')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">📬</div>
          <div>
            <div className="stat-val">{inquiries.length}</div>
            <div className="stat-label">Customer Messages ({inquiries.filter(i => i.status === 'New' || !i.status).length} New)</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('products')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">📦</div>
          <div>
            <div className="stat-val">{products.length}</div>
            <div className="stat-label">Active Catalog Products</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('aboutContent')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">📍</div>
          <div>
            <div className="stat-val">{(aboutForm.certifications || []).length} / {(aboutForm.team || []).length}</div>
            <div className="stat-label">Certifications & Team Members</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div>
            <div className="stat-val" style={{ color: '#16a34a', fontSize: '18px' }}>System Active</div>
            <div className="stat-label">Website & Contact Server Online</div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          📬 Customer Messages ({inquiries.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Manage Products ({products.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'homeContent' ? 'active' : ''}`}
          onClick={() => setActiveTab('homeContent')}
        >
          🏡 Edit Home Page
        </button>
        <button
          className={`tab-btn ${activeTab === 'aboutContent' ? 'active' : ''}`}
          onClick={() => setActiveTab('aboutContent')}
        >
          ℹ️ Edit About Us Page
        </button>
        <button
          className={`tab-btn ${activeTab === 'servicesContent' ? 'active' : ''}`}
          onClick={() => setActiveTab('servicesContent')}
        >
          🛠️ Edit Services Page
        </button>
        <button
          className={`tab-btn ${activeTab === 'contactContent' ? 'active' : ''}`}
          onClick={() => setActiveTab('contactContent')}
        >
          📞 Edit Contact Info
        </button>
        <button
          className={`tab-btn ${activeTab === 'snapshots' ? 'active' : ''}`}
          onClick={() => setActiveTab('snapshots')}
        >
          💾 Save & Restore Backup ({snapshots.length})
        </button>
        {hasPermission('manage_users') && (
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Staff Accounts ({usersList.length})
          </button>
        )}
      </div>

      {/* 1. CUSTOMER MESSAGES TAB */}
      {activeTab === 'inquiries' && (
        <div className="admin-card">
          <div className="card-top-bar">
            <div>
              <h2 className="card-title">Customer Quotation Requests & Messages</h2>
              <p className="card-subtitle-plain">View and manage inquiries submitted by website visitors through the contact form.</p>
            </div>
            <button className="btn-sm btn-edit" onClick={fetchInquiries}>🔄 Refresh Messages</button>
          </div>

          <div style={{ display: 'flex', gap: '16px', margin: '16px 0', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by customer name, email, or subject..."
              value={inquirySearch}
              onChange={e => setInquirySearch(e.target.value)}
              style={{ flex: 1, minWidth: '220px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
            <select
              value={inquiryStatusFilter}
              onChange={e => setInquiryStatusFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Customer Name</th>
                <th>Contact Phone / Email</th>
                <th>Subject</th>
                <th>Message Details</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No messages match your filter criteria.</td>
                </tr>
              ) : (
                filteredInquiries.map(inq => (
                  <tr key={inq.id}>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{inq.date || 'Recent'}</td>
                    <td><strong>{inq.name}</strong></td>
                    <td>
                      <div>📞 {inq.phone || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#2563eb' }}>✉️ {inq.email}</div>
                    </td>
                    <td><span className="perm-badge active">{inq.subject || 'General'}</span></td>
                    <td style={{ maxWidth: '280px', fontSize: '13px' }}>{inq.message}</td>
                    <td>
                      <select
                        value={inq.status || 'New'}
                        onChange={e => handleStatusChange(inq.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '600',
                          fontSize: '12px',
                          background: (inq.status === 'Contacted' ? '#dbeafe' : (inq.status === 'Closed' ? '#f1f5f9' : '#fef3c7')),
                          color: (inq.status === 'Contacted' ? '#1e40af' : (inq.status === 'Closed' ? '#475569' : '#92400e')),
                          border: 'none'
                        }}
                      >
                        <option value="New">🟡 New</option>
                        <option value="Contacted">🔵 Contacted</option>
                        <option value="Closed">⚪ Closed</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn-sm btn-delete"
                        onClick={() => handleDeleteInquiry(inq.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. MANAGE PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="admin-card">
          <div className="card-top-bar">
            <div>
              <h2 className="card-title">Manage Product Catalog</h2>
              <p className="card-subtitle-plain">Add, edit, or remove agricultural products displayed in the website catalog.</p>
            </div>
            <button
              className="btn-add"
              disabled={!hasPermission('create')}
              onClick={() => {
                setEditingProduct(null);
                setProductForm({ name: '', category: 'Bio Fertilizers', icon: '🌿', imageUrl: '', tag: '', desc: '', benefit: '', dose: '', crops: '' });
                setProductModalOpen(true);
              }}
            >
              ➕ Add New Product
            </button>
          </div>

          <div style={{ display: 'flex', gap: '16px', margin: '16px 0', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search product by name..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              style={{ flex: 1, minWidth: '220px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
            <select
              value={productCategoryFilter}
              onChange={e => setProductCategoryFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <option value="All">All Categories</option>
              <option value="Bio Fertilizers">Bio Fertilizers</option>
              <option value="Micronutrients">Micronutrients</option>
              <option value="Water Soluble">Water Soluble</option>
              <option value="Organic Inputs">Organic Inputs</option>
              <option value="Growth Regulators">Growth Regulators</option>
              <option value="Bio Pesticides">Bio Pesticides</option>
            </select>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Icon</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Tag Badge</th>
                <th>Farmer Benefit</th>
                <th>Recommended Dose</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="table-thumb" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span className="no-img-badge">No Image</span>
                    )}
                  </td>
                  <td><span className="emoji-display">{p.icon || '🌱'}</span></td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category}</td>
                  <td>{p.tag ? <span className="perm-badge active">{p.tag}</span> : '-'}</td>
                  <td>{p.benefit || '-'}</td>
                  <td style={{ fontSize: '13px' }}>{p.dose || '-'}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn-sm btn-edit"
                        disabled={!hasPermission('update')}
                        onClick={() => {
                          setEditingProduct(p);
                          setProductForm({ ...p, imageUrl: p.imageUrl || '' });
                          setProductModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-sm btn-delete"
                        disabled={!hasPermission('delete')}
                        onClick={() => handleDeleteProduct(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. EDIT HOME PAGE TAB */}
      {activeTab === 'homeContent' && (
        <div className="admin-card">
          <div className="card-top-bar">
            <div>
              <h2 className="card-title">Edit Home Page Content</h2>
              <p className="card-subtitle-plain">Update text titles, description paragraphs, bullet points, and banner photos displayed on the main home page.</p>
            </div>
          </div>

          <form onSubmit={handleHomeSubmit} className="form-grid" style={{ marginTop: '20px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Home Section Main Heading</label>
              <input
                type="text"
                value={homeForm.aboutTitle}
                onChange={(e) => setHomeForm({ ...homeForm, aboutTitle: e.target.value })}
                placeholder="e.g. About Achintyah Agrogreentech Pvt. Ltd."
                required
              />
              <span className="field-help">Main headline displayed at the top of the introductory home page section.</span>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Company Introduction Paragraph</label>
              <textarea
                rows="3"
                value={homeForm.aboutDesc}
                onChange={(e) => setHomeForm({ ...homeForm, aboutDesc: e.target.value })}
                placeholder="Description paragraph displayed on home page..."
                required
              />
              <span className="field-help">Main overview paragraph describing your mission to visitors.</span>
            </div>

            <div className="form-group">
              <label>Highlight Bullet #1</label>
              <input
                type="text"
                value={homeForm.check1}
                onChange={(e) => setHomeForm({ ...homeForm, check1: e.target.value })}
                placeholder="Quality Assurance"
              />
              <span className="field-help">First checkmark highlight point.</span>
            </div>

            <div className="form-group">
              <label>Highlight Bullet #2</label>
              <input
                type="text"
                value={homeForm.check2}
                onChange={(e) => setHomeForm({ ...homeForm, check2: e.target.value })}
                placeholder="Timely Delivery"
              />
              <span className="field-help">Second checkmark highlight point.</span>
            </div>

            <div className="form-group">
              <label>Highlight Bullet #3</label>
              <input
                type="text"
                value={homeForm.check3}
                onChange={(e) => setHomeForm({ ...homeForm, check3: e.target.value })}
                placeholder="Expert Technical Support"
              />
              <span className="field-help">Third checkmark highlight point.</span>
            </div>

            <div className="form-group">
              <label>Highlight Bullet #4</label>
              <input
                type="text"
                value={homeForm.check4}
                onChange={(e) => setHomeForm({ ...homeForm, check4: e.target.value })}
                placeholder="Farmer-Centric Approach"
              />
              <span className="field-help">Fourth checkmark highlight point.</span>
            </div>

            <div className="form-group">
              <label>Floating Badge Number / Highlight</label>
              <input
                type="text"
                value={homeForm.badgeNum}
                onChange={(e) => setHomeForm({ ...homeForm, badgeNum: e.target.value })}
                placeholder="10+"
              />
              <span className="field-help">Short text inside floating badge (e.g. 10+ or 100%).</span>
            </div>

            <div className="form-group">
              <label>Floating Badge Text</label>
              <input
                type="text"
                value={homeForm.badgeTxt}
                onChange={(e) => setHomeForm({ ...homeForm, badgeTxt: e.target.value })}
                placeholder="Years of Excellence"
              />
              <span className="field-help">Label text inside floating badge (e.g. Years of Excellence).</span>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Main Home Banner Photo Link (URL)</label>
              <input
                type="text"
                value={homeForm.mainImg}
                onChange={(e) => setHomeForm({ ...homeForm, mainImg: e.target.value })}
                placeholder="Paste photo web address..."
              />
              <span className="field-help">Main facility or field photo shown on the home page.</span>
              {homeForm.mainImg && (
                <div className="image-preview-box" style={{ marginTop: '10px' }}>
                  <img src={formatImageUrl(homeForm.mainImg)} alt="Main Banner Preview" className="img-preview" style={{ width: '140px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                </div>
              )}
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '16px', marginTop: '16px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={!hasPermission('update')}
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                💾 Save Home Page Content
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. EDIT ABOUT US PAGE TAB */}
      {activeTab === 'aboutContent' && (
        <div className="admin-card">
          <div className="card-top-bar">
            <div>
              <h2 className="card-title">Edit About Us Page</h2>
              <p className="card-subtitle-plain">Update registered office info, company quality certifications, and key leadership team members.</p>
            </div>
          </div>

          <form onSubmit={handleAboutSubmit} className="form-grid" style={{ marginTop: '20px' }}>
            <div className="full-width" style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginTop: '10px' }}>
              <h3 style={{ color: 'var(--forest)', fontSize: '16px', fontWeight: '700' }}>📍 Registered Office Info</h3>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Company Office Title</label>
              <input
                type="text"
                value={aboutForm.officeTitle || ''}
                onChange={(e) => setAboutForm({ ...aboutForm, officeTitle: e.target.value })}
                placeholder="Achintyah Agrogreentech Pvt. Ltd."
              />
              <span className="field-help">Official company title displayed on the About page.</span>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Registered Office Address</label>
              <textarea
                rows="3"
                value={aboutForm.officeAddress || ''}
                onChange={(e) => setAboutForm({ ...aboutForm, officeAddress: e.target.value })}
                placeholder="204, Mauli CHS, Plot No. D-22, Sector 20, Nerul..."
              />
              <span className="field-help">Official office address (line breaks supported).</span>
            </div>

            <div className="form-group">
              <label>Badge Tag #1</label>
              <input
                type="text"
                value={aboutForm.officeTag1 || ''}
                onChange={(e) => setAboutForm({ ...aboutForm, officeTag1: e.target.value })}
                placeholder="Registered Company"
              />
            </div>

            <div className="form-group">
              <label>Badge Tag #2</label>
              <input
                type="text"
                value={aboutForm.officeTag2 || ''}
                onChange={(e) => setAboutForm({ ...aboutForm, officeTag2: e.target.value })}
                placeholder="Quality Compliant"
              />
            </div>

            {/* Certifications Section */}
            <div className="full-width" style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--forest)', fontSize: '16px', fontWeight: '700' }}>🏅 Quality & Standards Certifications</h3>
              <button type="button" className="btn-sm btn-edit" onClick={handleAddCertification}>➕ Add Certification</button>
            </div>

            {(aboutForm.certifications || []).map((cert, idx) => (
              <div key={idx} className="full-width" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>Certification #{idx + 1}</strong>
                  <button type="button" className="btn-sm btn-delete" onClick={() => handleDeleteCertification(idx)}>Delete</button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Icon Emoji</label>
                    <input
                      type="text"
                      value={cert.icon || '🏅'}
                      onChange={(e) => {
                        const updated = [...aboutForm.certifications];
                        updated[idx].icon = e.target.value;
                        setAboutForm({ ...aboutForm, certifications: updated });
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Title</label>
                    <input
                      type="text"
                      value={cert.title || ''}
                      onChange={(e) => {
                        const updated = [...aboutForm.certifications];
                        updated[idx].title = e.target.value;
                        setAboutForm({ ...aboutForm, certifications: updated });
                      }}
                      placeholder="e.g. ISO 9001:2015"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 3' }}>
                    <label>Short Description</label>
                    <input
                      type="text"
                      value={cert.desc || ''}
                      onChange={(e) => {
                        const updated = [...aboutForm.certifications];
                        updated[idx].desc = e.target.value;
                        setAboutForm({ ...aboutForm, certifications: updated });
                      }}
                      placeholder="Quality Management Certified"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Team Section */}
            <div className="full-width" style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--forest)', fontSize: '16px', fontWeight: '700' }}>👥 Key Leadership & Team Members</h3>
              <button type="button" className="btn-sm btn-edit" onClick={handleAddTeamMember}>➕ Add Team Member</button>
            </div>

            {(aboutForm.team || []).map((mem, idx) => (
              <div key={idx} className="full-width" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>Team Member #{idx + 1}</strong>
                  <button type="button" className="btn-sm btn-delete" onClick={() => handleDeleteTeamMember(idx)}>Delete</button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Title / Name</label>
                    <input
                      type="text"
                      value={mem.name || ''}
                      onChange={(e) => {
                        const updated = [...aboutForm.team];
                        updated[idx].name = e.target.value;
                        setAboutForm({ ...aboutForm, team: updated });
                      }}
                      placeholder="Director"
                    />
                  </div>
                  <div className="form-group">
                    <label>Role / Department</label>
                    <input
                      type="text"
                      value={mem.role || ''}
                      onChange={(e) => {
                        const updated = [...aboutForm.team];
                        updated[idx].role = e.target.value;
                        setAboutForm({ ...aboutForm, team: updated });
                      }}
                      placeholder="Management & Strategy"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Photo URL Link</label>
                    <input
                      type="text"
                      value={mem.imageUrl || ''}
                      onChange={(e) => {
                        const updated = [...aboutForm.team];
                        updated[idx].imageUrl = e.target.value;
                        setAboutForm({ ...aboutForm, team: updated });
                      }}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '16px', marginTop: '16px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={!hasPermission('update')}
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                💾 Save About Us Page Content
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. EDIT SERVICES PAGE TAB */}
      {activeTab === 'servicesContent' && (
        <div className="admin-card">
          <div className="card-top-bar">
            <div>
              <h2 className="card-title">Edit Services Page</h2>
              <p className="card-subtitle-plain">Update the header titles and list of agricultural services offered to farmers and dealers.</p>
            </div>
          </div>

          <form onSubmit={handleServicesSubmit} className="form-grid" style={{ marginTop: '20px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Services Page Header Title</label>
              <input
                type="text"
                value={servicesForm.heroTitle || ''}
                onChange={(e) => setServicesForm({ ...servicesForm, heroTitle: e.target.value })}
                placeholder="e.g. Professional Agricultural Services"
              />
              <span className="field-help">Main title displayed at the top of the Services page.</span>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Services Page Sub-heading</label>
              <textarea
                rows="2"
                value={servicesForm.heroSub || ''}
                onChange={(e) => setServicesForm({ ...servicesForm, heroSub: e.target.value })}
                placeholder="Brief intro paragraph..."
              />
              <span className="field-help">Short overview paragraph placed directly below the title.</span>
            </div>

            <div className="full-width" style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--forest)', fontSize: '16px', fontWeight: '700' }}>🌾 Offered Services Cards</h3>
              <button type="button" className="btn-sm btn-edit" onClick={handleAddServiceItem}>➕ Add New Service Card</button>
            </div>

            {(servicesForm.services || []).map((svc, idx) => (
              <div key={idx} className="full-width" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <strong>Service Card #{idx + 1}</strong>
                  <button type="button" className="btn-sm btn-delete" onClick={() => handleDeleteServiceItem(idx)}>Delete Service</button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Icon Emoji</label>
                    <input
                      type="text"
                      value={svc.icon || '🌾'}
                      onChange={(e) => handleServiceItemChange(idx, 'icon', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Service Title</label>
                    <input
                      type="text"
                      value={svc.title || ''}
                      onChange={(e) => handleServiceItemChange(idx, 'title', e.target.value)}
                      placeholder="e.g. Crop Nutrition Advisory"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 3' }}>
                    <label>Description Paragraph</label>
                    <textarea
                      rows="2"
                      value={svc.desc || ''}
                      onChange={(e) => handleServiceItemChange(idx, 'desc', e.target.value)}
                      placeholder="Explain what this service offers..."
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 3' }}>
                    <label>Bullet Point Features (Separated by commas)</label>
                    <input
                      type="text"
                      value={Array.isArray(svc.features) ? svc.features.join(', ') : (svc.featuresStr || '')}
                      onChange={(e) => handleServiceItemChange(idx, 'featuresStr', e.target.value)}
                      placeholder="e.g. Soil & water analysis, Stage nutrition, Yield improvement"
                    />
                    <span className="field-help">Separate key points with commas.</span>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '16px', marginTop: '16px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={!hasPermission('update')}
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                💾 Save Services Page Content
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. EDIT CONTACT INFO TAB */}
      {activeTab === 'contactContent' && (
        <div className="admin-card">
          <div className="card-top-bar">
            <div>
              <h2 className="card-title">Edit Contact Information</h2>
              <p className="card-subtitle-plain">Update phone numbers, email addresses, office address, and business working hours shown on the Contact page.</p>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="form-grid" style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Primary Phone / WhatsApp Number</label>
              <input
                type="text"
                value={contactForm.phonePrimary || ''}
                onChange={(e) => setContactForm({ ...contactForm, phonePrimary: e.target.value })}
                placeholder="+91 98765 43210"
              />
              <span className="field-help">Main phone number displayed on the Contact page and WhatsApp chat button.</span>
            </div>

            <div className="form-group">
              <label>Secondary Phone Number (Optional)</label>
              <input
                type="text"
                value={contactForm.phoneSecondary || ''}
                onChange={(e) => setContactForm({ ...contactForm, phoneSecondary: e.target.value })}
                placeholder="+91 98765 43211"
              />
              <span className="field-help">Alternative contact line.</span>
            </div>

            <div className="form-group">
              <label>Primary Business Email</label>
              <input
                type="email"
                value={contactForm.emailPrimary || ''}
                onChange={(e) => setContactForm({ ...contactForm, emailPrimary: e.target.value })}
                placeholder="info@achintyah.com"
              />
              <span className="field-help">Main email address for customer inquiries.</span>
            </div>

            <div className="form-group">
              <label>Support Email (Optional)</label>
              <input
                type="email"
                value={contactForm.emailSupport || ''}
                onChange={(e) => setContactForm({ ...contactForm, emailSupport: e.target.value })}
                placeholder="support@achintyah.com"
              />
              <span className="field-help">Secondary email for technical support.</span>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Registered Office Address</label>
              <textarea
                rows="3"
                value={contactForm.officeAddress || ''}
                onChange={(e) => setContactForm({ ...contactForm, officeAddress: e.target.value })}
                placeholder="204, Mauli CHS, Plot No. D-22, Sector 20, Nerul..."
              />
              <span className="field-help">Complete office address shown on the Contact & About pages.</span>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Business Working Hours</label>
              <input
                type="text"
                value={contactForm.workingHours || ''}
                onChange={(e) => setContactForm({ ...contactForm, workingHours: e.target.value })}
                placeholder="Monday – Saturday: 9:00 AM – 6:30 PM (Sunday Closed)"
              />
              <span className="field-help">Days and hours when customer service is active.</span>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '16px', marginTop: '16px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={!hasPermission('update')}
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                💾 Save Contact Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. SAVE & RESTORE BACKUP TAB */}
      {activeTab === 'snapshots' && (
        <div className="admin-card">
          <div className="card-top-bar">
            <div>
              <h2 className="card-title">💾 Website Backups & Restore</h2>
              <p className="card-subtitle-plain">Save full backup copies of products, messages, and page content. Restore anytime if needed.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label className="btn-sm btn-outline" style={{ cursor: 'pointer', margin: 0, display: 'inline-flex', alignItems: 'center' }}>
                📥 Import Backup File
                <input type="file" accept=".json" onChange={handleImportSnapshot} style={{ display: 'none' }} />
              </label>
              <button className="btn-sm btn-create" onClick={() => setSnapshotModalOpen(true)}>
                ➕ Create New Backup
              </button>
            </div>
          </div>

          {snapshots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>💾</div>
              <h3 style={{ fontSize: '1.3rem', color: '#1a472a', marginBottom: '8px' }}>No Backups Saved Yet</h3>
              <p style={{ maxWidth: '450px', margin: '0 auto 20px auto' }}>
                Save a backup copy before making large content updates so you can restore with a single click.
              </p>
              <button className="btn-primary" onClick={() => setSnapshotModalOpen(true)}>
                Create First Backup →
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {snapshots.map(snap => (
                <div key={snap.id} style={{
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h3 style={{ margin: 0, color: '#1a472a', fontSize: '1.15rem', fontWeight: 700 }}>{snap.name}</h3>
                      <span style={{ fontSize: '0.75rem', background: '#eef7f0', color: '#2e7d32', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 }}>
                        {snap.createdBy || 'Admin'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🕒 Saved:</span>
                      <strong>{snap.timestamp}</strong>
                    </div>
                    {snap.summary && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                        <span className="tag tag-green">🌱 {snap.summary.productsCount || 0} Products</span>
                        <span className="tag tag-blue">📬 {snap.summary.inquiriesCount || 0} Inquiries</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      className="btn-sm btn-edit"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => handleRestoreSnapshot(snap)}
                    >
                      ↺ Restore Website
                    </button>
                    <button
                      className="btn-sm btn-outline"
                      title="Download backup file"
                      onClick={() => handleExportSnapshot(snap)}
                    >
                      💾 Download
                    </button>
                    <button
                      className="btn-sm btn-del"
                      title="Delete Backup"
                      onClick={() => handleDeleteSnapshot(snap.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. STAFF ACCOUNTS TAB */}
      {activeTab === 'users' && hasPermission('manage_users') && (
        <div className="admin-card">
          <div className="card-top-bar">
            <div>
              <h2 className="card-title">Admin & Staff Accounts</h2>
              <p className="card-subtitle-plain">Manage login credentials for staff members who update the website.</p>
            </div>
            <button className="btn-add" onClick={() => setUserModalOpen(true)}>
              ➕ Add New Staff Account
            </button>
          </div>

          <table className="data-table" style={{ marginTop: '16px' }}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Access Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.name}</td>
                  <td>
                    <span className={`role-pill role-${u.role}`}>
                      {u.role === 'admin' ? 'Full Admin' : 'Content Editor'}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button className="btn-sm btn-delete" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PRODUCT ADD/EDIT MODAL */}
      {productModalOpen && (
        <div className="modal-overlay" onClick={() => setProductModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <button className="modal-close" onClick={() => setProductModalOpen(false)}>✕</button>
            <h2 className="modal-title">{editingProduct ? '✏️ Edit Product Details' : '➕ Add New Product'}</h2>
            <p className="card-subtitle-plain" style={{ marginBottom: '16px' }}>Fill in the details below to publish or update this product in the catalog.</p>

            <form onSubmit={handleProductSubmit} className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Achintyah Bio-NPK Consortia"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
                <span className="field-help">Product title shown in catalog cards.</span>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={productForm.category}
                  onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <option value="Bio Fertilizers">Bio Fertilizers</option>
                  <option value="Micronutrients">Micronutrients</option>
                  <option value="Water Soluble">Water Soluble</option>
                  <option value="Organic Inputs">Organic Inputs</option>
                  <option value="Growth Regulators">Growth Regulators</option>
                  <option value="Bio Pesticides">Bio Pesticides</option>
                </select>
              </div>

              <div className="form-group">
                <label>Icon Emoji</label>
                <select
                  value={productForm.icon || '🌿'}
                  onChange={e => setProductForm({ ...productForm, icon: e.target.value })}
                >
                  {EMOJI_PALETTE.map(emo => (
                    <option key={emo} value={emo}>{emo}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Photo Web Link (URL)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or Google Drive link"
                  value={productForm.imageUrl || ''}
                  onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                />
                <span className="field-help">Paste photo link to display image in catalog cards.</span>
              </div>

              <div className="form-group">
                <label>Highlight Tag Badge (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Bestseller, New, Organic"
                  value={productForm.tag || ''}
                  onChange={e => setProductForm({ ...productForm, tag: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Recommended Dosage</label>
                <input
                  type="text"
                  placeholder="e.g. 3–5 kg/acre"
                  value={productForm.dose || ''}
                  onChange={e => setProductForm({ ...productForm, dose: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Target Crops</label>
                <input
                  type="text"
                  placeholder="e.g. All field crops, Vegetables, Grapes"
                  value={productForm.crops || ''}
                  onChange={e => setProductForm({ ...productForm, crops: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Key Farmer Benefit</label>
                <input
                  type="text"
                  placeholder="e.g. Improves soil fertility & crop yield"
                  value={productForm.benefit || ''}
                  onChange={e => setProductForm({ ...productForm, benefit: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Detailed Product Description</label>
                <textarea
                  rows="3"
                  placeholder="Explain formulation, features, and benefits..."
                  value={productForm.desc || ''}
                  onChange={e => setProductForm({ ...productForm, desc: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn-logout" onClick={() => setProductModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-add">
                  {editingProduct ? '💾 Save Product Changes' : '➕ Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BACKUP MODAL */}
      {snapshotModalOpen && (
        <div className="modal-overlay" onClick={() => setSnapshotModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="modal-close" onClick={() => setSnapshotModalOpen(false)}>✕</button>
            <h2 className="modal-title">💾 Save Website Backup</h2>
            <p className="card-subtitle-plain" style={{ marginBottom: '16px' }}>
              Create a full backup snapshot of product catalog, customer messages, and page content.
            </p>

            <form onSubmit={handleCreateSnapshot}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Backup Name / Title (Optional)</label>
                <input
                  type="text"
                  placeholder={`e.g. Backup ${new Date().toLocaleDateString()}`}
                  value={snapshotName}
                  onChange={e => setSnapshotName(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-logout" onClick={() => setSnapshotModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-add" disabled={snapshotLoading}>
                  {snapshotLoading ? 'Saving Backup...' : '💾 Save Backup Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {userModalOpen && (
        <div className="modal-overlay" onClick={() => setUserModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="modal-close" onClick={() => setUserModalOpen(false)}>✕</button>
            <h2 className="modal-title">👥 Add Staff Account</h2>
            <form onSubmit={handleUserSubmit} className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="username"
                  value={userForm.username}
                  onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={userForm.password}
                  onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Account Role</label>
                <select
                  value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="editor">Content Editor (Can add and update site content)</option>
                  <option value="admin">Full Admin (Full access including account management)</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn-logout" onClick={() => setUserModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-add">Create Staff Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
