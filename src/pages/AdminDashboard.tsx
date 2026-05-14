import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Package, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '../types';
import ImageUploader from '../components/ImageUploader';
import { Category, refreshCategories, refreshProducts } from '../hooks/useProducts';
import {
  adminCreateCategory,
  adminCreateProduct,
  adminDeleteCategory,
  adminDeleteProduct,
  adminDeleteUser,
  adminFetchOrders,
  adminFetchProducts,
  adminFetchUsers,
  adminLogin,
  adminSeedProducts,
  adminUpdateOrderStatus,
  adminUpdateProduct,
  adminUpdateStock,
  adminUpdateVisibility,
  fetchCategories,
} from '../services/api';

const FALLBACK_CATEGORIES = ['Minimal Jhumkas', 'Pearl Fusion', 'Indo-European Necklaces', 'Modern Kundan', 'Festival Sets', 'Accessories'];
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const emptyForm = {
  name: '',
  price: '',
  originalPrice: '',
  images: [] as string[],
  category: 'Minimal Jhumkas',
  description: '',
  material: '',
  origin: '',
  stockQuantity: '10',
  rating: '4.5',
  reviewCount: '0',
  isNew: false,
  isBestseller: false,
  isActive: true,
};

type FormData = typeof emptyForm;

const normalizeProduct = (product: Product): Product => ({
  ...product,
  id: product._id || product.id,
});

const AdminDashboard: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@indera.it');
  const [adminPassword, setAdminPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | number | null>(null);
  const [accountDeleteConfirm, setAccountDeleteConfirm] = useState<string | null>(null);

  const categoryNames = useMemo(() => {
    const names = categories.length ? categories.map((category) => category.name) : FALLBACK_CATEGORIES;
    return [...new Set(names)];
  }, [categories]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [productsResult, ordersResult, usersResult, categoriesResult] = await Promise.allSettled([
        adminFetchProducts({ limit: '100' }),
        adminFetchOrders({ limit: '25' }),
        adminFetchUsers({ limit: '50' }),
        fetchCategories(),
      ]);

      if (productsResult.status === 'fulfilled') {
        if (productsResult.value.success) setProducts(productsResult.value.products.map(normalizeProduct));
        else toast.error(`Products: ${productsResult.value.message || 'Could not load'}`);
      } else {
        toast.error(`Products API error: ${productsResult.reason?.message || 'Network error'}`);
      }

      if (ordersResult.status === 'fulfilled') {
        if (ordersResult.value.success) setOrders(ordersResult.value.orders || []);
        else toast.error(`Orders: ${ordersResult.value.message || 'Could not load'}`);
      } else {
        toast.error(`Orders API error: ${ordersResult.reason?.message || 'Network error'}`);
      }

      if (usersResult.status === 'fulfilled') {
        if (usersResult.value.success) setUsers(usersResult.value.users || []);
        else toast.error(`Users: ${usersResult.value.message || 'Could not load'}`);
      } else {
        toast.error(`Users API error: ${usersResult.reason?.message || 'Network error'}`);
      }

      if (categoriesResult.status === 'fulfilled') {
        if (categoriesResult.value.success) setCategories(categoriesResult.value.categories || []);
      }
    } catch (error: any) {
      toast.error(`Admin API error: ${error?.message || 'Could not connect'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('indera_admin_auth') === 'true') {
      setAuthenticated(true);
      loadAdminData();
    }
  }, []);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthLoading(true);
    try {
      const response = await adminLogin(adminEmail.trim(), adminPassword);
      if (response.success && response.adminKey) {
        sessionStorage.setItem('indera_admin_key', response.adminKey);
        sessionStorage.setItem('indera_admin_auth', 'true');
        setAuthenticated(true);
        toast.success('Welcome to admin');
        loadAdminData();
      } else {
        toast.error(response.message || 'Invalid admin login');
      }
    } catch (err: any) {
      toast.error(`Cannot reach server: ${err?.message || 'Check that the backend is running on port 5000'}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...emptyForm, category: categoryNames[0] || emptyForm.category });
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      price: String(product.price),
      originalPrice: String(product.originalPrice || ''),
      images: product.images?.length ? product.images : [product.image],
      category: product.category,
      description: product.description,
      material: product.material,
      origin: product.origin,
      stockQuantity: String((product as any).stockQuantity ?? (product.inStock ? 10 : 0)),
      rating: String(product.rating),
      reviewCount: String(product.reviewCount),
      isNew: product.isNew || false,
      isBestseller: product.isBestseller || false,
      isActive: product.isActive !== false,
    });
    setShowModal(true);
  };

  const productPayload = () => {
    const images = form.images.map((image) => image.trim()).filter(Boolean);
    const primaryImage = images[0];
    return {
      name: form.name,
      brand: 'INDERA',
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      image: primaryImage,
      images,
      category: form.category,
      description: form.description,
      material: form.material,
      origin: form.origin,
      stockQuantity: Number(form.stockQuantity),
      rating: Number(form.rating),
      reviewCount: Number(form.reviewCount),
      inStock: Number(form.stockQuantity) > 0,
      isActive: form.isActive,
      isNew: form.isNew,
      isBestseller: form.isBestseller,
      isFeatured: form.isNew || form.isBestseller,
    };
  };

  const refreshPublicPages = () => {
    refreshProducts();
    refreshCategories();
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = productPayload();
    if (!payload.name || !payload.price || !payload.image || !payload.description || !payload.material || !payload.origin) {
      toast.error('Fill all required fields and add at least one image');
      return;
    }

    try {
      const response = editProduct
        ? await adminUpdateProduct(String(editProduct.id), payload)
        : await adminCreateProduct(payload);

      if (!response.success) {
        toast.error(response.message || 'Could not save product');
        return;
      }

      toast.success(editProduct ? 'Product updated' : 'Product added');
      setShowModal(false);
      refreshPublicPages();
      await loadAdminData();
    } catch {
      toast.error('Could not save product');
    }
  };

  const handleDelete = async (id: string | number) => {
    const response = await adminDeleteProduct(String(id));
    if (response.success) {
      toast.success('Product hidden');
      setDeleteConfirm(null);
      refreshPublicPages();
      await loadAdminData();
    } else {
      toast.error(response.message || 'Could not hide product');
    }
  };

  const toggleStock = async (product: Product) => {
    const response = await adminUpdateStock(String(product.id), product.inStock ? 0 : 10);
    if (response.success) {
      refreshPublicPages();
      await loadAdminData();
    } else {
      toast.error(response.message || 'Could not update stock');
    }
  };

  const toggleVisibility = async (product: Product) => {
    const next = product.isActive === false;
    const response = await adminUpdateVisibility(String(product.id), next);
    if (response.success) {
      toast.success(next ? 'Product visible' : 'Product hidden');
      refreshPublicPages();
      await loadAdminData();
    } else {
      toast.error(response.message || 'Could not update visibility');
    }
  };

  const handleSeed = async () => {
    const response = await adminSeedProducts();
    if (response.success) {
      toast.success('Starter products added');
      refreshPublicPages();
      await loadAdminData();
    } else {
      toast.error(response.message || 'Could not seed products');
    }
  };

  const handleAddCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await adminCreateCategory({ name: newCategory, image: newCategoryImage || undefined });
    if (response.success) {
      toast.success('Category added');
      setNewCategory('');
      setNewCategoryImage('');
      refreshCategories();
      await loadAdminData();
    } else {
      toast.error(response.message || 'Could not add category');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!category._id) {
      toast.error('Seed categories first before deleting');
      return;
    }
    const response = await adminDeleteCategory(category._id);
    if (response.success) {
      toast.success('Category deleted');
      refreshCategories();
      await loadAdminData();
    } else {
      toast.error(response.message || 'Could not delete category');
    }
  };

  const handleOrderStatus = async (id: string, status: string) => {
    const response = await adminUpdateOrderStatus(id, status);
    if (response.success) {
      toast.success('Order updated');
      await loadAdminData();
    } else {
      toast.error(response.message || 'Could not update order');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    const response = await adminDeleteUser(id);
    if (response.success) {
      toast.success('Account deleted');
      setAccountDeleteConfirm(null);
      await loadAdminData();
    } else {
      toast.error(response.message || 'Could not delete account');
    }
  };

  const filtered = useMemo(() => products.filter((product) => {
    const matchSearch = !search || product.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || product.category === filterCat;
    return matchSearch && matchCat;
  }), [products, search, filterCat]);

  const stats = {
    total: products.length,
    visible: products.filter((product) => product.isActive !== false).length,
    hidden: products.filter((product) => product.isActive === false).length,
    orders: orders.length,
    accounts: users.length,
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="font-serif text-3xl font-light tracking-[0.2em] text-ivory">ADMIN</span>
            <p className="text-gold-400 text-[10px] tracking-[0.3em] uppercase font-sans mt-1">Products and Orders</p>
          </div>
          <div className="glass-dark rounded-sm p-8" style={{ border: '1px solid rgba(201,168,76,0.15)' }}>
            <h2 className="font-serif text-ivory text-xl font-light mb-6">Admin Sign In</h2>
            <form onSubmit={handleAuth}>
              <input
                type="email"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                placeholder="admin@indera.it"
                className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors mb-4"
              />
              <input
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                placeholder="Password"
                className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors mb-4"
              />
              <button type="submit" disabled={authLoading} className="btn-gold w-full py-3 disabled:opacity-50">
                {authLoading ? 'Signing in...' : 'Enter Dashboard'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian pt-20">
      <div className="bg-charcoal border-b border-ivory/5 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-gold-400 text-[10px] tracking-[0.4em] uppercase font-sans mb-1">Admin Panel</p>
            <h1 className="font-serif text-ivory text-3xl font-light">Products, Categories, Orders</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={loadAdminData} className="btn-outline py-3 px-5" disabled={loading}>Refresh</button>
            <button onClick={handleSeed} className="btn-outline py-3 px-5">Seed Products</button>
            <button onClick={openAdd} className="btn-gold flex items-center gap-2 py-3 px-6">
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Products', value: stats.total, icon: Package, color: 'text-gold-400' },
            { label: 'Visible', value: stats.visible, icon: Eye, color: 'text-green-400' },
            { label: 'Hidden', value: stats.hidden, icon: EyeOff, color: 'text-terracotta' },
            { label: 'Recent Orders', value: stats.orders, icon: Package, color: 'text-blue-400' },
            { label: 'Accounts', value: stats.accounts, icon: Package, color: 'text-purple-300' },
          ].map((stat) => (
            <div key={stat.label} className="glass-dark rounded-sm p-5" style={{ border: '1px solid rgba(201,168,76,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-ivory/40 text-[10px] tracking-widest uppercase font-sans">{stat.label}</p>
                <stat.icon size={16} className={stat.color} />
              </div>
              <p className={`font-serif text-3xl font-light ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <section className="glass-dark rounded-sm p-5 mb-8" style={{ border: '1px solid rgba(201,168,76,0.1)' }}>
          <h2 className="font-serif text-ivory text-2xl font-light mb-4">Categories</h2>
          <form onSubmit={handleAddCategory} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-3 mb-4">
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="New category name"
              className="bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/40"
            />
            <input
              value={newCategoryImage}
              onChange={(event) => setNewCategoryImage(event.target.value)}
              placeholder="Category image URL optional"
              className="bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/40"
            />
            <button type="submit" className="btn-gold px-5">Add Category</button>
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category.name} className="inline-flex items-center gap-2 border border-ivory/10 px-3 py-2 text-xs text-ivory/60">
                {category.name}
                <button onClick={() => handleDeleteCategory(category)} className="text-terracotta hover:text-ivory" aria-label={`Delete ${category.name}`}>
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 pl-10 pr-4 py-3 text-sm font-sans outline-none focus:border-gold-400/40 transition-colors"
            />
          </div>
          <select
            value={filterCat}
            onChange={(event) => setFilterCat(event.target.value)}
            className="bg-transparent border border-ivory/10 text-ivory/60 px-4 py-3 text-xs font-sans outline-none focus:border-gold-400/40 cursor-pointer"
          >
            <option value="" className="bg-obsidian">All Categories</option>
            {categoryNames.map((category) => <option key={category} value={category} className="bg-obsidian">{category}</option>)}
          </select>
        </div>

        <div className="glass-dark rounded-sm overflow-hidden mb-10" style={{ border: '1px solid rgba(201,168,76,0.1)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ivory/5">
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Product</th>
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Category</th>
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Price</th>
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Controls</th>
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={String(product.id)} className={`border-b border-ivory/5 hover:bg-ivory/[0.02] transition-colors ${product.isActive === false ? 'opacity-45' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-sm flex-shrink-0" />
                        <div>
                          <p className="text-ivory font-sans text-sm">{product.name}</p>
                          <p className="text-ivory/30 text-[10px] font-sans">{product.origin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ivory/50 text-xs font-sans">{product.category}</td>
                    <td className="px-5 py-4">
                      <p className="text-ivory font-serif text-lg font-light">EUR {product.price}</p>
                      {product.originalPrice && <p className="text-ivory/30 text-xs line-through">EUR {product.originalPrice}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => toggleVisibility(product)} className={`text-[9px] tracking-widest uppercase font-sans px-3 py-1.5 border transition-all ${
                          product.isActive !== false ? 'border-green-400/30 text-green-400' : 'border-terracotta/30 text-terracotta'
                        }`}>
                          {product.isActive !== false ? 'Visible' : 'Hidden'}
                        </button>
                        <button onClick={() => toggleStock(product)} className={`text-[9px] tracking-widest uppercase font-sans px-3 py-1.5 border transition-all ${
                          product.inStock ? 'border-green-400/30 text-green-400' : 'border-terracotta/30 text-terracotta'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(product)} className="p-2 border border-ivory/10 text-ivory/40 hover:text-gold-400 hover:border-gold-400/30 transition-all rounded-sm">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(product.id)} className="p-2 border border-ivory/10 text-ivory/40 hover:text-terracotta hover:border-terracotta/30 transition-all rounded-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="font-serif text-ivory text-3xl font-light mb-4">Customer Accounts</h2>
        <div className="glass-dark rounded-sm overflow-hidden mb-10" style={{ border: '1px solid rgba(201,168,76,0.1)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ivory/5">
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Customer</th>
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Contact</th>
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Verified</th>
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Created</th>
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account._id} className="border-b border-ivory/5">
                    <td className="px-5 py-4">
                      <p className="text-ivory text-sm font-sans">{account.firstName} {account.lastName}</p>
                      <p className="text-ivory/30 text-[10px]">{account.role}</p>
                    </td>
                    <td className="px-5 py-4 text-ivory/60 text-xs font-sans">
                      {account.email}
                      <p className="text-ivory/30">{account.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[9px] tracking-widest uppercase font-sans px-3 py-1.5 border ${
                        account.emailVerified ? 'border-green-400/30 text-green-400' : 'border-terracotta/30 text-terracotta'
                      }`}>
                        {account.emailVerified ? 'Email Verified' : 'Pending Email'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ivory/40 text-xs font-sans">
                      {account.createdAt ? new Date(account.createdAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setAccountDeleteConfirm(account._id)}
                        className="p-2 border border-ivory/10 text-ivory/40 hover:text-terracotta hover:border-terracotta/30 transition-all rounded-sm"
                        aria-label={`Delete account ${account.email}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && <p className="text-ivory/30 text-center py-10 font-serif text-xl">No accounts yet</p>}
        </div>

        <h2 className="font-serif text-ivory text-3xl font-light mb-4">Orders</h2>
        <div className="space-y-4">
          {orders.length === 0 && (
            <div className="glass-dark rounded-sm p-10 text-center" style={{ border: '1px solid rgba(201,168,76,0.1)' }}>
              <p className="text-ivory/30 font-serif text-xl">No orders yet</p>
            </div>
          )}
          {orders.map((order) => (
            <div key={order._id} className="glass-dark rounded-sm overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.1)' }}>
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-ivory/5 bg-ivory/[0.02]">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-gold-400 font-sans text-xs tracking-widest uppercase">{order.orderNumber}</p>
                    <p className="text-ivory/30 text-[10px] font-sans mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`text-[9px] tracking-widest uppercase font-sans px-3 py-1.5 border ${
                    order.status === 'delivered' ? 'border-green-400/30 text-green-400' :
                    order.status === 'cancelled' ? 'border-terracotta/30 text-terracotta' :
                    order.status === 'shipped' ? 'border-blue-400/30 text-blue-400' :
                    'border-gold-400/30 text-gold-400'
                  }`}>{order.status}</span>
                </div>
                <select
                  value={order.status}
                  onChange={(event) => handleOrderStatus(order._id, event.target.value)}
                  className="bg-obsidian border border-ivory/10 text-ivory/70 px-3 py-2 text-xs uppercase font-sans"
                >
                  {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>

              <div className="grid lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-ivory/5">
                {/* Customer Details */}
                <div className="px-6 py-5">
                  <p className="text-[10px] tracking-widest uppercase font-sans text-ivory/30 mb-3">Customer</p>
                  <p className="text-ivory font-sans text-sm font-medium">{order.customer?.firstName} {order.customer?.lastName}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-ivory/50 text-xs font-sans flex items-center gap-2">
                      <span className="text-gold-500/60">✉</span> {order.customer?.email || '—'}
                    </p>
                    <p className="text-ivory/50 text-xs font-sans flex items-center gap-2">
                      <span className="text-gold-500/60">✆</span> {order.customer?.phone || '—'}
                    </p>
                  </div>
                  {order.shippingAddress && (
                    <div className="mt-4">
                      <p className="text-[10px] tracking-widest uppercase font-sans text-ivory/30 mb-2">Shipping Address</p>
                      <p className="text-ivory/60 text-xs font-sans leading-relaxed">
                        {order.shippingAddress.address}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.zipCode}<br />
                        {order.shippingAddress.country}
                      </p>
                    </div>
                  )}
                  {order.payment && (
                    <div className="mt-4">
                      <p className="text-[10px] tracking-widest uppercase font-sans text-ivory/30 mb-1">Payment</p>
                      <span className={`text-[9px] tracking-widest uppercase font-sans px-2 py-1 border ${
                        order.payment.status === 'completed' ? 'border-green-400/30 text-green-400' : 'border-gold-400/30 text-gold-400'
                      }`}>{order.payment.status} · {order.payment.method}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="px-6 py-5">
                  <p className="text-[10px] tracking-widest uppercase font-sans text-ivory/30 mb-3">Items ({order.items?.length || 0})</p>
                  <div className="space-y-3">
                    {(order.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-sm flex-shrink-0 opacity-80" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-ivory text-xs font-sans truncate">{item.name}</p>
                          <p className="text-ivory/30 text-[10px] font-sans">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-gold-400 font-sans text-xs flex-shrink-0">EUR {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="px-6 py-5">
                  <p className="text-[10px] tracking-widest uppercase font-sans text-ivory/30 mb-3">Pricing</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-sans">
                      <span className="text-ivory/40">Subtotal</span>
                      <span className="text-ivory/70">EUR {order.pricing?.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-sans">
                      <span className="text-ivory/40">Shipping</span>
                      <span className="text-ivory/70">EUR {order.pricing?.shipping?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-sans">
                      <span className="text-ivory/40">Tax</span>
                      <span className="text-ivory/70">EUR {order.pricing?.tax?.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-ivory/10 pt-2 mt-2 flex justify-between">
                      <span className="text-ivory/60 text-xs font-sans uppercase tracking-wider">Total</span>
                      <span className="text-gold-400 font-serif text-lg font-light">EUR {order.pricing?.total?.toFixed(2)}</span>
                    </div>
                  </div>
                  {order.trackingNumber && (
                    <div className="mt-4">
                      <p className="text-[10px] tracking-widest uppercase font-sans text-ivory/30 mb-1">Tracking</p>
                      <p className="text-ivory/60 text-xs font-sans font-mono">{order.trackingNumber}</p>
                    </div>
                  )}
                  {order.notes && (
                    <div className="mt-4">
                      <p className="text-[10px] tracking-widest uppercase font-sans text-ivory/30 mb-1">Notes</p>
                      <p className="text-ivory/50 text-xs font-sans italic">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <ProductModal
          form={form}
          setForm={setForm}
          editProduct={editProduct}
          categories={categoryNames}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-obsidian/90 backdrop-blur">
          <div className="glass-dark rounded-sm p-8 max-w-sm w-full text-center" style={{ border: '1px solid rgba(196,113,74,0.3)' }}>
            <Trash2 size={32} className="mx-auto mb-4 text-terracotta" />
            <h3 className="font-serif text-ivory text-2xl font-light mb-2">Hide Product?</h3>
            <p className="text-ivory/40 text-sm font-sans mb-8">This removes it from the public shop. You can show it again with the visibility button.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 bg-terracotta text-ivory text-xs tracking-widest uppercase font-sans hover:bg-terracotta/80 transition-colors">Hide</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-outline py-3">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {accountDeleteConfirm !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-obsidian/90 backdrop-blur">
          <div className="glass-dark rounded-sm p-8 max-w-sm w-full text-center" style={{ border: '1px solid rgba(196,113,74,0.3)' }}>
            <Trash2 size={32} className="mx-auto mb-4 text-terracotta" />
            <h3 className="font-serif text-ivory text-2xl font-light mb-2">Delete Account?</h3>
            <p className="text-ivory/40 text-sm font-sans mb-8">This permanently removes the customer account from MongoDB. Existing orders stay in the admin order history.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDeleteAccount(accountDeleteConfirm)} className="flex-1 py-3 bg-terracotta text-ivory text-xs tracking-widest uppercase font-sans hover:bg-terracotta/80 transition-colors">Delete</button>
              <button onClick={() => setAccountDeleteConfirm(null)} className="flex-1 btn-outline py-3">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProductModalProps {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  editProduct: Product | null;
  categories: string[];
  onClose: () => void;
  onSave: (event: React.FormEvent) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ form, setForm, editProduct, categories, onClose, onSave }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8 bg-obsidian/90 backdrop-blur">
    <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-dark rounded-sm" style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-ivory/5">
        <h2 className="font-serif text-ivory text-2xl font-light">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
        <button onClick={onClose} className="text-ivory/30 hover:text-ivory transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={onSave} className="p-6 space-y-5">
        <div>
          <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-3">Product Images</label>
          <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} maxImages={6} />
        </div>
        <Field label="Product Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Price" type="number" value={form.price} onChange={(value) => setForm({ ...form, price: value })} required />
          <Field label="Original Price" type="number" value={form.originalPrice} onChange={(value) => setForm({ ...form, originalPrice: value })} />
        </div>
        <div>
          <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Category</label>
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full bg-obsidian border border-ivory/10 text-ivory px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50">
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Material" value={form.material} onChange={(value) => setForm({ ...form, material: value })} required />
          <Field label="Origin" value={form.origin} onChange={(value) => setForm({ ...form, origin: value })} required />
        </div>
        <TextArea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} required />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Stock Quantity" type="number" value={form.stockQuantity} onChange={(value) => setForm({ ...form, stockQuantity: value })} />
          <Field label="Rating" type="number" value={form.rating} onChange={(value) => setForm({ ...form, rating: value })} />
          <Field label="Review Count" type="number" value={form.reviewCount} onChange={(value) => setForm({ ...form, reviewCount: value })} />
        </div>
        <div className="flex flex-wrap gap-6">
          <Toggle label="Visible on site" checked={form.isActive} onChange={() => setForm({ ...form, isActive: !form.isActive })} />
          <Toggle label="New Arrival" checked={form.isNew} onChange={() => setForm({ ...form, isNew: !form.isNew })} />
          <Toggle label="Bestseller" checked={form.isBestseller} onChange={() => setForm({ ...form, isBestseller: !form.isBestseller })} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-gold flex-1 py-4 flex items-center justify-center gap-2">
            <Save size={15} />
            {editProduct ? 'Save Changes' : 'Add Product'}
          </button>
          <button type="button" onClick={onClose} className="btn-outline px-8 py-4">Cancel</button>
        </div>
      </form>
    </div>
  </div>
);

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, type = 'text', required }) => (
  <div>
    <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">{label}</label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors"
    />
  </div>
);

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({ label, value, onChange, required }) => (
  <div>
    <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">{label}</label>
    <textarea
      required={required}
      rows={3}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors resize-none"
    />
  </div>
);

const Toggle: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <button type="button" onClick={onChange} className="flex items-center gap-3">
    <span className={`w-10 h-5 rounded-full transition-all duration-300 relative ${checked ? 'bg-gold-400' : 'bg-ivory/10'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${checked ? 'left-5' : 'left-0.5'}`} />
    </span>
    <span className="text-xs tracking-widest uppercase font-sans text-ivory/50">{label}</span>
  </button>
);

export default AdminDashboard;
