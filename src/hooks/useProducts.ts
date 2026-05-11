import { useState, useEffect } from 'react';
import { Product } from '../types';
import { products as defaultProducts, categories as defaultCategories } from '../data/products';
import { fetchCategories, fetchProducts } from '../services/api';

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

export const refreshProducts = () => {
  window.dispatchEvent(new Event('indera_products_updated'));
};

export const refreshCategories = () => {
  window.dispatchEvent(new Event('indera_categories_updated'));
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(getStoredProducts);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const data = await fetchProducts({ limit: '100' });
        if (active && data.success && Array.isArray(data.products)) {
          const liveProducts = data.products.map(normalizeProduct).filter((product: Product) => product.isActive !== false && !product.hidden);
          setProducts(liveProducts);
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(liveProducts));
          return;
        }
      } catch {}
      if (active) setProducts(getStoredProducts());
    };

    loadProducts();
    window.addEventListener('indera_products_updated', loadProducts);
    window.addEventListener('storage', loadProducts);
    return () => {
      active = false;
      window.removeEventListener('indera_products_updated', loadProducts);
      window.removeEventListener('storage', loadProducts);
    };
  }, []);

  return products;
};

export interface Category {
  _id?: string;
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
    let active = true;

    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        if (active && data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCats(data.categories);
          return;
        }
      } catch {}
      if (active) setCats(getStoredCategories());
    };

    loadCategories();
    window.addEventListener('indera_categories_updated', loadCategories);
    window.addEventListener('storage', loadCategories);
    return () => {
      active = false;
      window.removeEventListener('indera_categories_updated', loadCategories);
      window.removeEventListener('storage', loadCategories);
    };
  }, []);
  return cats;
};
