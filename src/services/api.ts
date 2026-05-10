const API_URL = import.meta.env.VITE_API_URL || '/api';
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'indera-admin-secret-2024';

const adminHeaders = {
  'Content-Type': 'application/json',
  'x-admin-key': ADMIN_KEY,
};

// ── Public ─────────────────────────────────────────────────────

export const fetchProducts = async (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/products${qs ? `?${qs}` : ''}`);
  return res.json();
};

export const fetchProductById = async (id: string) => {
  const res = await fetch(`${API_URL}/products/${id}`);
  return res.json();
};

export const fetchCategories = async () => {
  const res = await fetch(`${API_URL}/categories`);
  return res.json();
};

// ── Admin ──────────────────────────────────────────────────────

export const adminFetchProducts = async (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/admin/products${qs ? `?${qs}` : ''}`, { headers: adminHeaders });
  return res.json();
};

export const adminFetchStats = async () => {
  const res = await fetch(`${API_URL}/admin/products/stats`, { headers: adminHeaders });
  return res.json();
};

export const adminCreateProduct = async (data: Record<string, unknown>) => {
  const res = await fetch(`${API_URL}/admin/products`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(data),
  });
  return res.json();
};

export const adminUpdateProduct = async (id: string, data: Record<string, unknown>) => {
  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify(data),
  });
  return res.json();
};

export const adminDeleteProduct = async (id: string) => {
  const res = await fetch(`${API_URL}/admin/products/${id}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  return res.json();
};

export const adminUpdateStock = async (id: string, stockQuantity: number) => {
  const res = await fetch(`${API_URL}/admin/products/${id}/stock`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ stockQuantity }),
  });
  return res.json();
};

export const adminUpdateVisibility = async (id: string, isActive: boolean) => {
  const res = await fetch(`${API_URL}/admin/products/${id}/visibility`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ isActive }),
  });
  return res.json();
};

export const adminCreateCategory = async (data: { name: string; image?: string }) => {
  const res = await fetch(`${API_URL}/admin/categories`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(data),
  });
  return res.json();
};

export const adminDeleteCategory = async (id: string) => {
  const res = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: adminHeaders,
  });
  return res.json();
};

export const adminSeedProducts = async () => {
  const res = await fetch(`${API_URL}/admin/seed`, {
    method: 'POST',
    headers: adminHeaders,
  });
  return res.json();
};

export const adminFetchOrders = async (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/orders${qs ? `?${qs}` : ''}`, { headers: adminHeaders });
  return res.json();
};

export const adminFetchOrderStats = async () => {
  const res = await fetch(`${API_URL}/orders/stats`, { headers: adminHeaders });
  return res.json();
};

export const adminUpdateOrderStatus = async (id: string, status: string) => {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({ status }),
  });
  return res.json();
};
