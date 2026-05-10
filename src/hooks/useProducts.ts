import { useState, useEffect } from 'react';
import { Product } from '../types';
import { products as defaultProducts, categories as defaultCategories } from '../data/products';
import { fetchProducts } from '../services/api';

const PRODUCTS_KEY = 'indera_products';
const CATEGORIES_KEY = 'indera_categories';

const normalizeProduct = (product: Product): Product => ({
  ...product,
  id: product._id || product.id,
});

export const getStoredProducts = (): Product[] => {
  try {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (saved) return JSON.parse(saved).map(normalizeProduct);
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
    let active = true;

    const loadProducts = async () => {
      try {
        const data = await fetchProducts({ limit: '100' });
        if (active && data.success && Array.isArray(data.products)) {
          setProducts(data.products.map(normalizeProduct));
        }
      } catch {
        if (active) setProducts(getStoredProducts());
      }
    };

    const sync = () => setProducts(getStoredProducts());

    loadProducts();
    window.addEventListener('indera_products_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      active = false;
      window.removeEventListener('indera_products_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return products;
};

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
