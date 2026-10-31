import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db, storage } from '../firebase';
import { defaultProducts } from '../data/defaultProducts';

const PRODUCTS_COLLECTION = 'products';

/**
 * Client-side canvas image compressor.
 * Compresses any user image down to maximum 1200px dimension and ~75% quality.
 * Shrinks 5MB-10MB mobile camera photos down to < 100KB WebP/JPEG.
 */
export const compressImage = (file, maxDimension = 1200, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to JPEG if browser doesn't support WebP export
              canvas.toBlob(
                (fallbackBlob) => {
                  if (!fallbackBlob) return reject(new Error('Canvas compression failed'));
                  const base64 = canvas.toDataURL('image/jpeg', quality);
                  resolve({ blob: fallbackBlob, base64, ext: 'jpg', mime: 'image/jpeg' });
                },
                'image/jpeg',
                quality
              );
              return;
            }
            const base64 = canvas.toDataURL(mimeType, quality);
            resolve({ blob, base64, ext: 'webp', mime: mimeType });
          },
          mimeType,
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a product image directly to Firebase Storage with automatic compression.
 * Falls back to Express server or lightweight WebP Base64 if storage is not yet configured.
 */
export const uploadProductImage = async (file, userToken = null, apiBase = '') => {
  if (!file) throw new Error('No image file selected');

  // 1. Compress image client-side first
  const { blob, base64, ext } = await compressImage(file, 1200, 0.75);
  const cleanBaseName = file.name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  const uniqueName = `prod_${Date.now()}_${cleanBaseName}.${ext}`;

  // 2. Try Firebase Storage directly
  try {
    const storageRef = ref(storage, `products/${uniqueName}`);
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: blob.type || 'image/webp',
      cacheControl: 'public, max-age=31536000'
    });
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return { url: downloadUrl, source: 'firebase-storage' };
  } catch (storageErr) {
    console.warn('[Firebase Storage Notice]:', storageErr.code, storageErr.message);

    // 3. Fallback: Try backend Express server if accessible
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/upload-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
          },
          body: JSON.stringify({
            imageBase64: base64,
            filename: uniqueName
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            return { url: data.url, source: 'express-server' };
          }
        }
      } catch (backendErr) {
        console.warn('[Backend Upload Notice]:', backendErr.message);
      }
    }

    // 4. Fallback: Return highly-compressed WebP Base64 (< 80KB)
    return { url: base64, source: 'compressed-base64', warning: storageErr.message };
  }
};

/**
 * Fetch all products from Cloud Firestore.
 * Falls back to Express API / defaultProducts if Firestore is empty or unauthorized.
 */
export const getProducts = async (apiBase = '') => {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(query(colRef));
    if (!snap.empty) {
      const list = [];
      snap.forEach(d => {
        const data = d.data();
        list.push({
          ...data,
          id: d.id,
          // ensure numerical ID or string ID is consistent
          displayId: data.id || d.id
        });
      });
      // Sort by creation time or ID
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || Number(a.id) || 0;
        const timeB = b.createdAt?.seconds || Number(b.id) || 0;
        return timeB - timeA;
      });
      return { products: list, source: 'firestore' };
    }
  } catch (err) {
    console.warn('[Firestore getProducts Notice]:', err.code || err.message);
  }

  // Fallback: Check backend Express server
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/products`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return { products: data, source: 'express' };
        }
      }
    } catch (e) {}
  }

  // Fallback: defaultProducts catalog
  return { products: [...defaultProducts], source: 'defaults' };
};

/**
 * Subscribes to real-time product updates in Cloud Firestore.
 * Automatically pushes new additions / edits to phones and laptops instantly.
 */
export const subscribeProducts = (onUpdate, onError) => {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = [];
          snapshot.forEach(d => {
            const data = d.data();
            list.push({
              ...data,
              id: d.id,
              displayId: data.id || d.id
            });
          });
          list.sort((a, b) => {
            const timeA = a.createdAt?.seconds || Number(a.id) || 0;
            const timeB = b.createdAt?.seconds || Number(b.id) || 0;
            return timeB - timeA;
          });
          onUpdate(list);
        } else {
          onUpdate([]);
        }
      },
      (error) => {
        console.warn('[Firestore subscribe notice]:', error.code, error.message);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Saves a product directly to Cloud Firestore.
 * Handles both creates and updates with atomic persistence.
 */
export const saveProduct = async (productData, isEdit = false, editingId = null) => {
  if (!productData || !productData.name || !productData.name.trim()) {
    throw new Error('Product name is required.');
  }

  const docId = isEdit && editingId ? String(editingId) : `prod_${Date.now()}`;
  const docRef = doc(db, PRODUCTS_COLLECTION, docId);

  const payload = {
    ...productData,
    id: docId,
    name: productData.name.trim(),
    category: productData.category ? productData.category.trim() : 'Bio Fertilizers',
    icon: productData.icon || '🌱',
    imageUrl: productData.imageUrl || '',
    tag: productData.tag ? productData.tag.trim() : '',
    desc: productData.desc ? productData.desc.trim() : '',
    benefit: productData.benefit ? productData.benefit.trim() : '',
    dose: productData.dose ? productData.dose.trim() : '',
    crops: productData.crops ? productData.crops.trim() : '',
    updatedAt: serverTimestamp(),
    ...(isEdit ? {} : { createdAt: serverTimestamp() })
  };

  await setDoc(docRef, payload, { merge: true });
  return { ...payload, id: docId };
};

/**
 * Deletes a product from Cloud Firestore.
 */
export const deleteProduct = async (productId) => {
  if (!productId) throw new Error('Product ID required for deletion');
  const docRef = doc(db, PRODUCTS_COLLECTION, String(productId));
  await deleteDoc(docRef);
  return true;
};

/**
 * Seeds initial catalog to Cloud Firestore with one click.
 */
export const seedInitialProductsToFirestore = async (productsToSeed = defaultProducts) => {
  const results = { count: 0, errors: [] };
  for (const p of productsToSeed) {
    try {
      const docId = `prod_${p.id || Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const docRef = doc(db, PRODUCTS_COLLECTION, docId);
      await setDoc(docRef, {
        ...p,
        id: docId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      results.count++;
    } catch (err) {
      results.errors.push(`${p.name}: ${err.message}`);
    }
  }
  return results;
};
