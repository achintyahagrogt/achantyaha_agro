export const DEFAULT_CATEGORY_DATA = [
  {
    title: 'Bio Fertilizers',
    icon: '🌿',
    desc: 'Premium bio-fertilizers enriched with nitrogen fixers and phosphate solubilizers for enhanced crop nutrition.'
  },
  {
    title: 'Micronutrients',
    icon: '🔬',
    desc: 'Precisely formulated micronutrient blends – Zinc, Boron, Calcium, Manganese – for optimal plant health.'
  },
  {
    title: 'Water Soluble',
    icon: '💧',
    desc: 'High-purity WSF for fertigation and foliar applications with rapid absorption and zero residue.'
  },
  {
    title: 'Growth Regulators',
    icon: '🌱',
    desc: 'Scientifically developed PGRs to stimulate root development, flowering, and fruit setting.'
  },
  {
    title: 'Organic Inputs',
    icon: '🌾',
    desc: 'Natural organic certified compounds that enrich soil biology and plant vigor.'
  },
  {
    title: 'Bio Pesticides',
    icon: '🛡️',
    desc: 'Eco-safe biological pest control solutions that protect crops without harming soil microbiome.'
  }
];

export const DEFAULT_CATEGORIES = DEFAULT_CATEGORY_DATA.map(c => c.title);

/**
 * Gets all available categories, combining defaults, custom stored categories,
 * and any categories present in products, while respecting deleted categories.
 */
export const getAllCategories = (extraProducts = []) => {
  let deletedList = [];
  try {
    const rawDeleted = localStorage.getItem('achintyah_deleted_categories');
    if (rawDeleted) {
      deletedList = JSON.parse(rawDeleted).map(c => (typeof c === 'string' ? c.trim().toLowerCase() : ''));
    }
  } catch (e) {}

  const catSet = new Set();
  DEFAULT_CATEGORIES.forEach(c => {
    if (!deletedList.includes(c.toLowerCase())) {
      catSet.add(c);
    }
  });

  // 1. Stored custom categories
  try {
    const saved = localStorage.getItem('achintyah_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed.forEach(c => {
          if (c && typeof c === 'string' && c.trim() && !deletedList.includes(c.trim().toLowerCase())) {
            catSet.add(c.trim());
          }
        });
      }
    }
  } catch (e) {}

  // 2. Categories from products passed in
  if (Array.isArray(extraProducts)) {
    extraProducts.forEach(p => {
      if (p && p.category && typeof p.category === 'string' && p.category.trim() && !deletedList.includes(p.category.trim().toLowerCase())) {
        catSet.add(p.category.trim());
      }
    });
  }

  // 3. Categories from products in localStorage
  try {
    const localProds = JSON.parse(localStorage.getItem('achintyah_products') || '[]');
    if (Array.isArray(localProds)) {
      localProds.forEach(p => {
        if (p && p.category && typeof p.category === 'string' && p.category.trim() && !deletedList.includes(p.category.trim().toLowerCase())) {
          catSet.add(p.category.trim());
        }
      });
    }
  } catch (e) {}

  const result = Array.from(catSet);
  if (result.length === 0) {
    result.push('Bio Fertilizers');
  }
  return result;
};

/**
 * Save a new category to storage and notify any listening components
 */
export const saveNewCategory = (categoryName) => {
  if (!categoryName || typeof categoryName !== 'string') return;
  const trimmed = categoryName.trim();
  if (!trimmed) return;

  // 1. Remove from deleted categories list if previously deleted
  try {
    const rawDeleted = localStorage.getItem('achintyah_deleted_categories');
    if (rawDeleted) {
      const deleted = JSON.parse(rawDeleted);
      if (Array.isArray(deleted)) {
        const filtered = deleted.filter(c => typeof c === 'string' && c.trim().toLowerCase() !== trimmed.toLowerCase());
        localStorage.setItem('achintyah_deleted_categories', JSON.stringify(filtered));
      }
    }
  } catch (e) {}

  // 2. Add to custom categories
  const current = getAllCategories();
  if (!current.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) {
    current.push(trimmed);
  }

  try {
    localStorage.setItem('achintyah_categories', JSON.stringify(current));
    window.dispatchEvent(new Event('achintyah_categories_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}
};

/**
 * Delete a category from available categories and reassign affected products
 */
export const deleteCategory = (categoryName) => {
  if (!categoryName || typeof categoryName !== 'string') return;
  const target = categoryName.trim();
  if (!target) return;

  // 1. Add to deleted categories list
  try {
    const rawDeleted = localStorage.getItem('achintyah_deleted_categories');
    const deleted = rawDeleted ? JSON.parse(rawDeleted) : [];
    if (!deleted.map(c => (typeof c === 'string' ? c.trim().toLowerCase() : '')).includes(target.toLowerCase())) {
      deleted.push(target);
      localStorage.setItem('achintyah_deleted_categories', JSON.stringify(deleted));
    }
  } catch (e) {}

  // 2. Remove from custom categories list
  try {
    const rawCustom = localStorage.getItem('achintyah_categories');
    if (rawCustom) {
      const custom = JSON.parse(rawCustom);
      if (Array.isArray(custom)) {
        const filtered = custom.filter(c => typeof c === 'string' && c.trim().toLowerCase() !== target.toLowerCase());
        localStorage.setItem('achintyah_categories', JSON.stringify(filtered));
      }
    }
  } catch (e) {}

  // 3. Reassign any products in localStorage using this category to a remaining category
  const remaining = getAllCategories().filter(c => c.toLowerCase() !== target.toLowerCase());
  const fallbackCat = remaining[0] || 'Bio Fertilizers';

  try {
    const rawProds = localStorage.getItem('achintyah_products');
    if (rawProds) {
      const prods = JSON.parse(rawProds);
      let changed = false;
      prods.forEach(p => {
        if (p.category && p.category.trim().toLowerCase() === target.toLowerCase()) {
          p.category = fallbackCat;
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('achintyah_products', JSON.stringify(prods));
      }
    }
  } catch (e) {}

  window.dispatchEvent(new Event('achintyah_categories_updated'));
  window.dispatchEvent(new Event('achintyah_products_updated'));
  window.dispatchEvent(new Event('storage'));
};

/**
 * Get display metadata (icon, description) for a category
 */
export const getCategoryMeta = (categoryName) => {
  const found = DEFAULT_CATEGORY_DATA.find(
    c => c.title.toLowerCase() === (categoryName || '').toLowerCase()
  );
  if (found) return found;

  return {
    title: categoryName,
    icon: '🌱',
    desc: `High-quality ${categoryName} formulations engineered for superior crop nutrition, protection, and yield.`
  };
};

