
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

import { db } from '../firebase';

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

const CATEGORIES_COLLECTION = 'categories';
const PRODUCTS_COLLECTION = 'products';

const normalize = value => String(value || '').trim().toLowerCase();

const categoryId = name => encodeURIComponent(normalize(name));

const notifyCategoryUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('achintyah_categories_updated'));
  }
};

export const getAllCategories = (extraProducts = []) => {
  const categories = new Map();

  DEFAULT_CATEGORIES.forEach(name => {
    categories.set(normalize(name), name);
  });

  // Temporary legacy fallback for older browser data.
  // Firestore subscription will provide the shared category list.
  try {
    const saved = JSON.parse(
      localStorage.getItem('achintyah_categories') || '[]'
    );

    if (Array.isArray(saved)) {
      saved.forEach(name => {
        if (typeof name === 'string' && name.trim()) {
          categories.set(normalize(name), name.trim());
        }
      });
    }
  } catch (error) {}

  if (Array.isArray(extraProducts)) {
    extraProducts.forEach(product => {
      if (product?.category?.trim()) {
        categories.set(
          normalize(product.category),
          product.category.trim()
        );
      }
    });
  }

  return Array.from(categories.values());
};

/**
 * Real-time shared category list from Firestore.
 * Documents with active:false are deletion records (tombstones).
 */
export const subscribeCategories = (callback, extraProducts = []) => {
  return onSnapshot(
    collection(db, CATEGORIES_COLLECTION),
    snapshot => {
      const active = new Map();
      const deleted = new Set();

      snapshot.forEach(categoryDoc => {
        const data = categoryDoc.data();
        const name = String(data.name || '').trim();

        if (!name) return;

        if (data.active === false) {
          deleted.add(normalize(name));
        } else {
          active.set(normalize(name), name);
        }
      });

      const categories = new Map();

      DEFAULT_CATEGORIES.forEach(name => {
        if (!deleted.has(normalize(name))) {
          categories.set(normalize(name), name);
        }
      });

      active.forEach((name, key) => {
        if (!deleted.has(key)) {
          categories.set(key, name);
        }
      });

      if (Array.isArray(extraProducts)) {
        extraProducts.forEach(product => {
          const name = product?.category?.trim();
          if (name && !deleted.has(normalize(name))) {
            categories.set(normalize(name), name);
          }
        });
      }

      callback(Array.from(categories.values()));
    },
    error => {
      console.error('Category subscription error:', error);
      callback(getAllCategories(extraProducts));
    }
  );
};

/**
 * Add or reactivate a category in Firestore.
 */
export const saveNewCategory = async categoryName => {
  if (typeof categoryName !== 'string' || !categoryName.trim()) {
    throw new Error('Please enter a valid category name.');
  }

  const name = categoryName.trim();

  await setDoc(
    doc(db, CATEGORIES_COLLECTION, categoryId(name)),
    {
      name,
      active: true,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  notifyCategoryUpdate();
  return name;
};

/**
 * Delete a category globally and reassign its existing products.
 */
export const deleteCategory = async categoryName => {
  if (typeof categoryName !== 'string' || !categoryName.trim()) {
    throw new Error('Invalid category name.');
  }

  const target = categoryName.trim();
  const targetKey = normalize(target);

  const categorySnapshot = await getDocs(
    collection(db, CATEGORIES_COLLECTION)
  );

  const deletedNames = new Set();

  categorySnapshot.forEach(categoryDoc => {
    const data = categoryDoc.data();
    if (data.active === false && data.name) {
      deletedNames.add(normalize(data.name));
    }
  });

  deletedNames.add(targetKey);

  const remaining = [
    ...DEFAULT_CATEGORIES,
    ...categorySnapshot.docs
      .filter(item => item.data().active !== false)
      .map(item => item.data().name)
  ].filter(name => name && !deletedNames.has(normalize(name)));

  const fallbackCategory = remaining[0] || 'Bio Fertilizers';

  // Reassign products in Firestore before marking the category deleted.
  const productSnapshot = await getDocs(
    collection(db, PRODUCTS_COLLECTION)
  );

  const updates = productSnapshot.docs
    .filter(productDoc => {
      const product = productDoc.data();
      return normalize(product.category) === targetKey;
    })
    .map(productDoc =>
      updateDoc(productDoc.ref, {
        category: fallbackCategory,
        updatedAt: serverTimestamp()
      })
    );

  await Promise.all(updates);

  // Keep a deletion record so default categories do not reappear.
  await setDoc(
    doc(db, CATEGORIES_COLLECTION, categoryId(target)),
    {
      name: target,
      active: false,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  notifyCategoryUpdate();

  return {
    deletedCategory: target,
    reassignedProducts: updates.length,
    fallbackCategory
  };
};

export const getCategoryMeta = categoryName => {
  const found = DEFAULT_CATEGORY_DATA.find(
    category => normalize(category.title) === normalize(categoryName)
  );

  if (found) return found;

  return {
    title: categoryName,
    icon: '🌱',
    desc: `High-quality ${categoryName} formulations engineered for superior crop nutrition, protection, and yield.`
  };
};
