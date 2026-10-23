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
 * and any categories present in products.
 */
export const getAllCategories = (extraProducts = []) => {
  const catSet = new Set(DEFAULT_CATEGORIES);

  // 1. Stored custom categories
  try {
    const saved = localStorage.getItem('achintyah_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed.forEach(c => {
          if (c && typeof c === 'string' && c.trim()) {
            catSet.add(c.trim());
          }
        });
      }
    }
  } catch (e) {}

  // 2. Categories from products passed in
  if (Array.isArray(extraProducts)) {
    extraProducts.forEach(p => {
      if (p && p.category && typeof p.category === 'string' && p.category.trim()) {
        catSet.add(p.category.trim());
      }
    });
  }

  // 3. Categories from products in localStorage
  try {
    const localProds = JSON.parse(localStorage.getItem('achintyah_products') || '[]');
    if (Array.isArray(localProds)) {
      localProds.forEach(p => {
        if (p && p.category && typeof p.category === 'string' && p.category.trim()) {
          catSet.add(p.category.trim());
        }
      });
    }
  } catch (e) {}

  return Array.from(catSet);
};

/**
 * Save a new category to storage and notify any listening components
 */
export const saveNewCategory = (categoryName) => {
  if (!categoryName || typeof categoryName !== 'string') return;
  const trimmed = categoryName.trim();
  if (!trimmed) return;

  const current = getAllCategories();
  if (!current.includes(trimmed)) {
    current.push(trimmed);
  }

  try {
    localStorage.setItem('achintyah_categories', JSON.stringify(current));
    window.dispatchEvent(new Event('achintyah_categories_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {}
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
