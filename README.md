# Achintyah Agrogreentech Pvt. Ltd. — Enterprise Website & Admin Panel

A modern, responsive multi-page web application and administrative management system built for **Achintyah Agrogreentech Pvt. Ltd.**

---

## 📁 Project Architecture

```
achintyah-agrogreentech/
├── public/                     # Public static assets & deployment rewrites
├── server/                     # Node.js + Express backend API & JSON store
│   ├── server.js               # Express server endpoints
│   ├── db.json / data.json     # Persistent data storage
│   └── middleware/             # Auth & RBAC security middleware
├── src/
│   ├── assets/                 # Brand logos and images
│   ├── components/             # Reusable UI components (Navbar, Footer, LanguageSelector)
│   ├── context/                # AuthContext & LanguageContext providers
│   ├── data/                   # Default product catalog data
│   ├── locales/                # Multi-language translation dictionaries
│   ├── pages/                  # Main page views (Home, About, Products, Services, Contact, Admin, Login)
│   └── utils/                  # Image utilities & Google Drive link formatters
├── vercel.json                 # Vercel SPA routing deployment configuration
└── package.json
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Application (Frontend + Backend Server)
- **To run the full stack (Frontend & Backend API Server):**
  ```bash
  npm run dev
  ```
- **To run Frontend only:**
  ```bash
  npm start
  ```
- **To run Backend Server only:**
  ```bash
  npm run server
  ```

Open your browser at `http://localhost:3000`.

---

## 🔑 Administrative Control Panel

Access the Admin Panel at `/admin` or click **🔐 Login** in the header navigation:

- **Admin Login**: `admin` / `admin123`
- **Features**:
  - 📬 **Quotation Requests**: Manage customer queries with status tracking (`🔴 New` ➔ `🟡 In Progress` ➔ `🟢 Resolved`), filtering, and 1-click email reply.
  - 📦 **Product Catalog**: Add, edit, or delete products with automatic image previews and category filters.
  - 📍 **Office & Content Management**: Live updates for Registered Office address, Certifications, and Expert Team.
  - 🖼️ **Google Drive Link Support**: Paste standard Google Drive share URLs into image fields to auto-convert into live web embeds.

---

## 🏗️ Production Build & Deployment

To generate an optimized production bundle:
```bash
npm run build
```
Deploy the generated `build/` folder to your preferred hosting environment (Vercel, Netlify, CPanel, AWS, etc.).

---

*Developed for Achintyah Agrogreentech Pvt. Ltd.*

# green-agro
