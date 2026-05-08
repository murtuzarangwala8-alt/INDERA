import { useState, useEffect } from 'react';
import { Product } from '../types';
import { products as defaultProducts, categories as defaultCategories } from '../data/products';

const PRODUCTS_KEY = 'indera_products';
const CATEGORIES_KEY = 'indera_categories';

// ── Products ──────────────────────────────────────────────────

export const getStoredProducts = (): Product[] => {
  try {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultProducts;
};

export const saveStoredProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event('indera_products_updated'));
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  useEffect(() => {
    const sync = () => setProducts(getStoredProducts());
    window.addEventListener('indera_products_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('indera_products_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return products;
};

// ── Categories ────────────────────────────────────────────────

export interface Category {
  name: string;
  image: string;
  count?: number;
}

export const getStoredCategories = (): Category[] => {
  try {
    const saved = localStorage.getItem(CATEGORIES_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultCategories;
};

export const saveStoredCategories = (cats: Category[]) => {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  window.dispatchEvent(new Event('indera_categories_updated'));
};

export const useCategories = () => {
  const [cats, setCats] = useState<Category[]>(getStoredCategories);
  useEffect(() => {
    const sync = () => setCats(getStoredCategories());
    window.addEventListener('indera_categories_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('indera_categories_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return cats;
};
