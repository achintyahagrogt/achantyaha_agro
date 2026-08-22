const fs = require('fs');
const path = require('path');
const writeFileAtomic = require('write-file-atomic');

const DATA_FILE = process.env.DATA_FILE_PATH || path.join(__dirname, 'data.json');

// Process-local memory cache to prevent constant synchronous disk reads
let dataCache = null;

function readData() {
  if (dataCache) {
    return dataCache;
  }

  try {
    if (!fs.existsSync(DATA_FILE)) {
      dataCache = { users: [], products: [], inquiries: [], snapshots: [] };
      return dataCache;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.inquiries) parsed.inquiries = [];
    if (!parsed.snapshots) parsed.snapshots = [];
    dataCache = parsed;
    return parsed;
  } catch (err) {
    console.error('Error reading data.json:', err.message);
    dataCache = { users: [], products: [], inquiries: [], snapshots: [] };
    return dataCache;
  }
}

function writeData(data) {
  dataCache = data;
  try {
    // Atomic file write prevents file corruption during crashes/partial writes
    writeFileAtomic.sync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing data.json:', err.message);
  }
}

function invalidateCache() {
  dataCache = null;
}

module.exports = {
  readData,
  writeData,
  invalidateCache,
  getProducts: () => readData().products || [],
  setProducts: (products) => {
    const data = readData();
    data.products = products;
    writeData(data);
  },
  getUsers: () => readData().users || [],
  setUsers: (users) => {
    const data = readData();
    data.users = users;
    writeData(data);
  },
  getInquiries: () => readData().inquiries || [],
  setInquiries: (inquiries) => {
    const data = readData();
    data.inquiries = inquiries;
    writeData(data);
  },
  getHomeContent: () => readData().homeContent || {},
  setHomeContent: (homeContent) => {
    const data = readData();
    data.homeContent = homeContent;
    writeData(data);
  },
  getAboutContent: () => readData().aboutContent || {},
  setAboutContent: (aboutContent) => {
    const data = readData();
    data.aboutContent = aboutContent;
    writeData(data);
  },
  getServicesContent: () => readData().servicesContent || {},
  setServicesContent: (servicesContent) => {
    const data = readData();
    data.servicesContent = servicesContent;
    writeData(data);
  },
  getContactContent: () => readData().contactContent || {},
  setContactContent: (contactContent) => {
    const data = readData();
    data.contactContent = contactContent;
    writeData(data);
  },
  getSnapshots: () => readData().snapshots || [],
  setSnapshots: (snapshots) => {
    const data = readData();
    data.snapshots = snapshots;
    writeData(data);
  }
};
