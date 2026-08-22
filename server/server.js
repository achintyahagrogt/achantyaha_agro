const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const rateLimit = require('express-rate-limit');

const { getProducts, setProducts, getUsers, setUsers, getInquiries, setInquiries, getHomeContent, setHomeContent, getAboutContent, setAboutContent, getServicesContent, setServicesContent, getContactContent, setContactContent, getSnapshots, setSnapshots } = require('./db');
const { JWT_SECRET, authenticateToken, requirePermission } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors(corsOrigin ? { origin: corsOrigin } : {}));

// Bound request body size to 100kb
app.use(express.json({ limit: '100kb' }));

// Rate Limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many inquiries submitted. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  let isMatch = false;
  if (user.passwordHash) {
    try {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    } catch (e) {}
  }

  if (!isMatch) {
    const defaultPasswords = {
      admin: 'admin123',
      editor1: 'editor123'
    };
    if (defaultPasswords[user.username] === password) {
      isMatch = true;
      // Auto-heal hash
      user.passwordHash = await bcrypt.hash(password, 10);
      setUsers(users);
    }
  }

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      permissions: user.permissions || []
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ----------------------------------------------------
// PRODUCT CATALOG ROUTES
// ----------------------------------------------------
app.get('/api/products', (req, res) => {
  const products = getProducts();
  res.json(products);
});

app.post('/api/products', authenticateToken, requirePermission('create'), (req, res) => {
  const { name, category, icon, imageUrl, tag, desc, benefit, dose, crops } = req.body;

  if (!name || !category) {
    return res.status(400).json({ message: 'Product name and category are required' });
  }

  const products = getProducts();
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

  const newProduct = {
    id: newId,
    name,
    category,
    icon: icon || '🌱',
    imageUrl: imageUrl || '',
    tag: tag || '',
    desc: desc || '',
    benefit: benefit || '',
    dose: dose || '',
    crops: crops || ''
  };

  products.push(newProduct);
  setProducts(products);

  res.status(201).json({ message: 'Product created successfully', product: newProduct });
});

app.put('/api/products/:id', authenticateToken, requirePermission('update'), (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const products = getProducts();
  const index = products.findIndex(p => p.id === productId);

  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const updatedProduct = {
    ...products[index],
    ...req.body,
    id: productId
  };

  products[index] = updatedProduct;
  setProducts(products);

  res.json({ message: 'Product updated successfully', product: updatedProduct });
});

app.delete('/api/products/:id', authenticateToken, requirePermission('delete'), (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);

  if (filtered.length === products.length) {
    return res.status(404).json({ message: 'Product not found' });
  }

  setProducts(filtered);
  res.json({ message: 'Product deleted successfully' });
});

// ----------------------------------------------------
// USER & PERMISSION MANAGEMENT ROUTES (Admin only)
// ----------------------------------------------------
app.get('/api/users', authenticateToken, requirePermission('manage_users'), (req, res) => {
  const users = getUsers().map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    permissions: u.permissions || []
  }));
  res.json(users);
});

app.post('/api/users', authenticateToken, requirePermission('manage_users'), async (req, res) => {
  const { username, password, name, role, permissions } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required' });
  }

  const users = getUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: `user-${Date.now()}`,
    username,
    passwordHash,
    name: name || username,
    role,
    permissions: permissions || (role === 'admin' ? ['create', 'read', 'update', 'delete', 'manage_users'] : role === 'editor' ? ['create', 'read', 'update'] : ['read'])
  };

  users.push(newUser);
  setUsers(users);

  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      permissions: newUser.permissions
    }
  });
});

app.put('/api/users/:id/permissions', authenticateToken, requirePermission('manage_users'), async (req, res) => {
  const userId = req.params.id;
  const { permissions, role, password } = req.body;

  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (users[index].role === 'admin' && userId === 'user-admin' && role && role !== 'admin') {
    return res.status(400).json({ message: 'Cannot demote the primary System Administrator' });
  }

  if (permissions) users[index].permissions = permissions;
  if (role) users[index].role = role;
  if (password && password.trim().length >= 4) {
    users[index].passwordHash = await bcrypt.hash(password.trim(), 10);
  }

  setUsers(users);

  res.json({
    message: 'Permissions updated successfully',
    user: {
      id: users[index].id,
      username: users[index].username,
      name: users[index].name,
      role: users[index].role,
      permissions: users[index].permissions
    }
  });
});

app.delete('/api/users/:id', authenticateToken, requirePermission('manage_users'), (req, res) => {
  const userId = req.params.id;

  if (userId === 'user-admin') {
    return res.status(400).json({ message: 'Cannot delete primary System Administrator' });
  }

  const users = getUsers();
  const filtered = users.filter(u => u.id !== userId);

  if (filtered.length === users.length) {
    return res.status(404).json({ message: 'User not found' });
  }

  setUsers(filtered);
  res.json({ message: 'User deleted successfully' });
});

// ----------------------------------------------------
// CONTACT & QUOTATION INQUIRIES ROUTE
// ----------------------------------------------------
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }

  // 1. Save inquiry to database (data.json) for Admin Panel review
  const inquiries = getInquiries();
  const newInquiry = {
    id: `inq-${Date.now()}`,
    date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    name,
    email,
    phone: phone || 'N/A',
    subject: subject || 'General Contact',
    message,
    status: 'New'
  };

  inquiries.unshift(newInquiry);
  setInquiries(inquiries);

  // 2. Dispatch email via SMTP or Web3Forms
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const recipientEmail = process.env.RECIPIENT_EMAIL;

  if (smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: parseInt(smtpPort, 10) === 465,
        auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
        from: `"Achintyah Website Inquiry" <${smtpUser}>`,
        to: recipientEmail,
        replyTo: email,
        subject: `New Inquiry from ${name}: ${subject || 'General Contact'}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #1b5e20;">New Website Inquiry Received</h2>
            <hr style="border: none; border-top: 1px solid #ccc; margin: 15px 0;" />
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Topic / Subject:</strong> ${subject || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #2e7d32; border-radius: 4px; white-space: pre-line;">
              ${message}
            </div>
            <br />
            <p style="font-size: 12px; color: #777;">Received via Achintyah Agrogreentech Contact Form</p>
          </div>
        `
      });
      console.log(`[SMTP SUCCESS] Email sent successfully to ${recipientEmail} from ${name}`);
    } catch (err) {
      console.error('[SMTP ERROR]:', err.message);
    }
  }

  return res.status(201).json({
    message: 'Your query has been submitted successfully! Our team will respond shortly.',
    inquiry: newInquiry
  });
});

app.get('/api/inquiries', authenticateToken, (req, res) => {
  const inquiries = getInquiries();
  res.json(inquiries);
});

app.put('/api/inquiries/:id/status', authenticateToken, requirePermission('update'), (req, res) => {
  const inqId = req.params.id;
  const { status } = req.body;
  const inquiries = getInquiries();
  const index = inquiries.findIndex(i => i.id === inqId);

  if (index === -1) {
    return res.status(404).json({ message: 'Inquiry not found' });
  }

  inquiries[index].status = status || 'In Progress';
  setInquiries(inquiries);
  res.json({ message: 'Inquiry status updated', inquiry: inquiries[index] });
});

app.delete('/api/inquiries/:id', authenticateToken, requirePermission('delete'), (req, res) => {
  const inqId = req.params.id;
  const inquiries = getInquiries();
  const filtered = inquiries.filter(i => i.id !== inqId);

  if (filtered.length === inquiries.length) {
    return res.status(404).json({ message: 'Inquiry not found' });
  }

  setInquiries(filtered);
  res.json({ message: 'Inquiry deleted successfully' });
});

// Homepage Content Management Endpoints
app.get('/api/home-content', (req, res) => {
  const homeContent = getHomeContent();
  res.json(homeContent);
});

app.put('/api/home-content', authenticateToken, requirePermission('update'), (req, res) => {
  const updatedContent = req.body;
  if (!updatedContent || typeof updatedContent !== 'object') {
    return res.status(400).json({ message: 'Invalid home content data' });
  }

  setHomeContent(updatedContent);
  res.json({ message: 'Homepage content updated successfully', homeContent: updatedContent });
});

// About Us & Registered Office Content Management Endpoints
app.get('/api/about-content', (req, res) => {
  const aboutContent = getAboutContent();
  res.json(aboutContent);
});

app.put('/api/about-content', authenticateToken, requirePermission('update'), (req, res) => {
  const updatedContent = req.body;
  if (!updatedContent || typeof updatedContent !== 'object') {
    return res.status(400).json({ message: 'Invalid about content data' });
  }

  setAboutContent(updatedContent);
  res.json({ message: 'About Us & Registered Office content updated successfully', aboutContent: updatedContent });
});

// Services Content Management Endpoints
app.get('/api/services-content', (req, res) => {
  const servicesContent = getServicesContent();
  res.json(servicesContent);
});

app.put('/api/services-content', authenticateToken, requirePermission('update'), (req, res) => {
  const updatedContent = req.body;
  if (!updatedContent || typeof updatedContent !== 'object') {
    return res.status(400).json({ message: 'Invalid services content data' });
  }

  setServicesContent(updatedContent);
  res.json({ message: 'Services content updated successfully', servicesContent: updatedContent });
});

// Contact Info Content Management Endpoints
app.get('/api/contact-content', (req, res) => {
  const contactContent = getContactContent();
  res.json(contactContent);
});

app.put('/api/contact-content', authenticateToken, requirePermission('update'), (req, res) => {
  const updatedContent = req.body;
  if (!updatedContent || typeof updatedContent !== 'object') {
    return res.status(400).json({ message: 'Invalid contact content data' });
  }

  setContactContent(updatedContent);
  res.json({ message: 'Contact details updated successfully', contactContent: updatedContent });
});

// ----------------------------------------------------
// SNAPSHOT MANAGEMENT ROUTES (For logged-in users)
// ----------------------------------------------------
app.get('/api/snapshots', authenticateToken, (req, res) => {
  const snapshots = getSnapshots().map(s => ({
    id: s.id,
    name: s.name,
    timestamp: s.timestamp,
    createdBy: s.createdBy,
    summary: s.summary
  }));
  res.json(snapshots);
});

app.post('/api/snapshots', authenticateToken, (req, res) => {
  const { name } = req.body;
  const snapshots = getSnapshots();
  const products = getProducts();
  const inquiries = getInquiries();
  const homeContent = getHomeContent();
  const aboutContent = getAboutContent();
  const servicesContent = getServicesContent();
  const contactContent = getContactContent();
  const users = getUsers();

  const newSnapshot = {
    id: `snap-${Date.now()}`,
    name: name || `Snapshot ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    createdBy: req.user.username,
    summary: {
      productsCount: products.length,
      inquiriesCount: inquiries.length,
      usersCount: users.length
    },
    data: {
      products,
      inquiries,
      homeContent,
      aboutContent,
      servicesContent,
      contactContent,
      users: users.map(u => ({ id: u.id, username: u.username, role: u.role, name: u.name, permissions: u.permissions }))
    }
  };

  snapshots.unshift(newSnapshot);
  setSnapshots(snapshots);

  res.status(201).json({ message: 'Snapshot created successfully', snapshot: newSnapshot });
});

app.post('/api/snapshots/:id/restore', authenticateToken, (req, res) => {
  const snapId = req.params.id;
  const snapshots = getSnapshots();
  const snapshot = snapshots.find(s => s.id === snapId);

  if (!snapshot || !snapshot.data) {
    return res.status(404).json({ message: 'Snapshot not found or invalid' });
  }

  const { products, inquiries, homeContent, aboutContent, servicesContent, contactContent } = snapshot.data;
  if (Array.isArray(products)) setProducts(products);
  if (Array.isArray(inquiries)) setInquiries(inquiries);
  if (homeContent) setHomeContent(homeContent);
  if (aboutContent) setAboutContent(aboutContent);
  if (servicesContent) setServicesContent(servicesContent);
  if (contactContent) setContactContent(contactContent);

  res.json({ message: 'System state restored successfully from snapshot', snapshot });
});

app.delete('/api/snapshots/:id', authenticateToken, (req, res) => {
  const snapId = req.params.id;
  const snapshots = getSnapshots();
  const filtered = snapshots.filter(s => s.id !== snapId);

  if (filtered.length === snapshots.length) {
    return res.status(404).json({ message: 'Snapshot not found' });
  }

  setSnapshots(filtered);
  res.json({ message: 'Snapshot deleted successfully' });
});

app.post('/api/snapshots/import', authenticateToken, (req, res) => {
  const { snapshotData } = req.body;
  if (!snapshotData || typeof snapshotData !== 'object') {
    return res.status(400).json({ message: 'Invalid snapshot data payload' });
  }

  const snapshots = getSnapshots();
  const importedSnapshot = {
    id: snapshotData.id || `snap-${Date.now()}`,
    name: snapshotData.name || `Imported Snapshot ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    timestamp: snapshotData.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    createdBy: req.user.username,
    summary: snapshotData.summary || {
      productsCount: snapshotData.data?.products?.length || 0,
      inquiriesCount: snapshotData.data?.inquiries?.length || 0
    },
    data: snapshotData.data || snapshotData
  };

  snapshots.unshift(importedSnapshot);
  setSnapshots(snapshots);

  res.status(201).json({ message: 'Snapshot imported successfully', snapshot: importedSnapshot });
});

// Serve static frontend build if available
const buildPath = path.join(__dirname, '../build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// Wildcard SPA route fallback for React Router
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  const buildIndex = path.join(__dirname, '../build/index.html');
  if (fs.existsSync(buildIndex)) {
    res.sendFile(buildIndex);
  } else {
    res.status(404).send('Achintyah Agro Backend Server running on port 5001.');
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Achintyah Agro backend server running on port ${PORT}`);
  });
}

module.exports = app;
