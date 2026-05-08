import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Search, Package, TrendingUp, Eye, EyeOff, Save } from 'lucide-react';
import { Product } from '../types';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import { getStoredProducts, saveStoredProducts } from '../hooks/useProducts';

const CATEGORIES = ['Minimal Jhumkas', 'Pearl Fusion', 'Indo-European Necklaces', 'Modern Kundan', 'Festival Sets', 'Accessories'];

const emptyForm = {
  name: '',
  price: '',
  originalPrice: '',
  image: '',
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
  inStock: true,
};

type FormData = typeof emptyForm;

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [keyInput, setKeyInput] = useState('');

  // Load products from localStorage or default
  useEffect(() => {
    setProducts(getStoredProducts());
    const savedKey = sessionStorage.getItem('indera_admin_auth');
    if (savedKey === 'true') setAuthenticated(true);
  }, []);

  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    saveStoredProducts(updated);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput === 'indera2024' || keyInput === (import.meta.env.VITE_ADMIN_KEY || 'indera-admin-secret-2024')) {
      setAuthenticated(true);
      sessionStorage.setItem('indera_admin_auth', 'true');
      toast.success('Welcome to INDÉRA Admin');
    } else {
      toast.error('Invalid admin key');
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      price: String(p.price),
      originalPrice: String(p.originalPrice || ''),
      image: p.image,
      images: p.images || [p.image],
      category: p.category,
      description: p.description,
      material: p.material,
      origin: p.origin,
      stockQuantity: '10',
      rating: String(p.rating),
      reviewCount: String(p.reviewCount),
      isNew: p.isNew || false,
      isBestseller: p.isBestseller || false,
      inStock: p.inStock,
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.images.length || !form.description) {
      toast.error('Please fill all required fields and add at least one image');
      return;
    }

    const productData: Product = {
      id: editProduct ? editProduct.id : Date.now(),
      name: form.name,
      brand: 'INDÉRA',
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      image: form.images[0],
      images: form.images,
      category: form.category as Product['category'],
      description: form.description,
      material: form.material,
      origin: form.origin,
      rating: Number(form.rating),
      reviewCount: Number(form.reviewCount),
      inStock: form.inStock,
      isNew: form.isNew,
      isBestseller: form.isBestseller,
    };

    if (editProduct) {
      saveProducts(products.map(p => p.id === editProduct.id ? productData : p));
      toast.success('Product updated');
    } else {
      saveProducts([...products, productData]);
      toast.success('Product added');
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    saveProducts(products.filter(p => p.id !== id));
    setDeleteConfirm(null);
    toast.success('Product deleted');
  };

  const toggleStock = (id: number) => {
    saveProducts(products.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    categories: [...new Set(products.map(p => p.category))].length,
  };

  // ── Auth Gate ──
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm relative z-10">
          <div className="text-center mb-8">
            <span className="font-serif text-3xl font-light tracking-[0.2em] text-ivory">INDÉRA</span>
            <p className="text-gold-400 text-[10px] tracking-[0.3em] uppercase font-sans mt-1">Admin Panel</p>
          </div>
          <div className="glass-dark rounded-sm p-8" style={{ border: '1px solid rgba(201,168,76,0.15)' }}>
            <h2 className="font-serif text-ivory text-xl font-light mb-6">Enter Admin Key</h2>
            <form onSubmit={handleAuth}>
              <input
                type="password"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder="Admin key"
                className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors mb-4"
              />
              <button type="submit" className="btn-gold w-full py-3">Enter Dashboard</button>
            </form>
            <p className="text-ivory/20 text-[10px] font-sans mt-4 text-center">Default key: indera2024</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian pt-20">
      {/* Header */}
      <div className="bg-charcoal border-b border-ivory/5 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-gold-400 text-[10px] tracking-[0.4em] uppercase font-sans mb-1">Admin Panel</p>
            <h1 className="font-serif text-ivory text-3xl font-light">Product Management</h1>
          </div>
          <button onClick={openAdd} className="btn-gold flex items-center gap-2 py-3 px-6">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: stats.total, icon: Package, color: 'text-gold-400' },
            { label: 'In Stock', value: stats.inStock, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Out of Stock', value: stats.outOfStock, icon: EyeOff, color: 'text-terracotta' },
            { label: 'Categories', value: stats.categories, icon: Eye, color: 'text-blue-400' },
          ].map((s) => (
            <div key={s.label} className="glass-dark rounded-sm p-5" style={{ border: '1px solid rgba(201,168,76,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-ivory/40 text-[10px] tracking-widest uppercase font-sans">{s.label}</p>
                <s.icon size={16} className={s.color} />
              </div>
              <p className={`font-serif text-3xl font-light ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/30" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 pl-10 pr-4 py-3 text-sm font-sans outline-none focus:border-gold-400/40 transition-colors"
            />
          </div>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="bg-transparent border border-ivory/10 text-ivory/60 px-4 py-3 text-xs font-sans outline-none focus:border-gold-400/40 cursor-pointer"
          >
            <option value="" className="bg-obsidian">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-obsidian">{c}</option>)}
          </select>
        </div>

        {/* Products Table */}
        <div className="glass-dark rounded-sm overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.1)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ivory/5">
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Product</th>
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Category</th>
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Price</th>
                  <th className="text-left px-5 py-4 text-[10px] tracking-widests uppercase font-sans text-ivory/30">Status</th>
                  <th className="text-left px-5 py-4 text-[10px] tracking-widest uppercase font-sans text-ivory/30">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-ivory/5 hover:bg-ivory/2 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-sm flex-shrink-0" />
                        <div>
                          <p className="text-ivory font-sans text-sm">{p.name}</p>
                          <p className="text-ivory/30 text-[10px] font-sans">{p.origin}</p>
                          <div className="flex gap-1 mt-1">
                            {p.isBestseller && <span className="text-[8px] bg-gold-400/20 text-gold-400 px-1.5 py-0.5 tracking-wider uppercase">Bestseller</span>}
                            {p.isNew && <span className="text-[8px] bg-blue-400/20 text-blue-400 px-1.5 py-0.5 tracking-wider uppercase">New</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-ivory/50 text-xs font-sans">{p.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-ivory font-serif text-lg font-light">€{p.price}</p>
                      {p.originalPrice && <p className="text-ivory/30 text-xs line-through">€{p.originalPrice}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleStock(p.id)} className={`text-[9px] tracking-widest uppercase font-sans px-3 py-1.5 border transition-all ${
                        p.inStock
                          ? 'border-green-400/30 text-green-400 hover:bg-green-400/10'
                          : 'border-terracotta/30 text-terracotta hover:bg-terracotta/10'
                      }`}>
                        {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)}
                          className="p-2 border border-ivory/10 text-ivory/40 hover:text-gold-400 hover:border-gold-400/30 transition-all rounded-sm">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(p.id)}
                          className="p-2 border border-ivory/10 text-ivory/40 hover:text-terracotta hover:border-terracotta/30 transition-all rounded-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Package size={40} className="mx-auto mb-4 text-ivory/10" />
              <p className="font-serif text-ivory/30 text-xl font-light">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8"
            style={{ background: 'rgba(13,13,13,0.9)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-dark rounded-sm"
              style={{ border: '1px solid rgba(201,168,76,0.2)' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-ivory/5">
                <h2 className="font-serif text-ivory text-2xl font-light">
                  {editProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-ivory/30 hover:text-ivory transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSave} className="p-6 space-y-5">

                {/* Images */}
                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-3">
                    Product Images <span className="text-terracotta">*</span>
                  </label>
                  <ImageUploader
                    images={form.images}
                    onChange={(imgs) => setForm({ ...form, images: imgs, image: imgs[0] || '' })}
                    maxImages={6}
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">
                    Product Name <span className="text-terracotta">*</span>
                  </label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                    placeholder="e.g. Chandni Minimal Jhumkas"
                    className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-obsidian border border-ivory/10 text-ivory px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Price Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">
                      Price (€) <span className="text-terracotta">*</span>
                    </label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required
                      placeholder="189"
                      className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Original Price (€)</label>
                    <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                      placeholder="250 (optional)"
                      className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                  </div>
                </div>

                {/* Material & Origin */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Material</label>
                    <input value={form.material} onChange={e => setForm({ ...form, material: e.target.value })}
                      placeholder="22K Gold Plated Silver"
                      className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">Origin</label>
                    <input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })}
                      placeholder="Jaipur, Rajasthan"
                      className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] tracking-widest uppercase font-sans text-ivory/40 mb-2">
                    Description <span className="text-terracotta">*</span>
                  </label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3}
                    placeholder="Describe the product..."
                    className="w-full bg-transparent border border-ivory/10 text-ivory placeholder-ivory/20 px-4 py-3 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors resize-none" />
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6 pt-2">
                  {[
                    { label: 'In Stock', key: 'inStock' },
                    { label: 'New Arrival', key: 'isNew' },
                    { label: 'Bestseller', key: 'isBestseller' },
                  ].map(({ label, key }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setForm({ ...form, [key]: !form[key as keyof FormData] })}
                        className={`w-10 h-5 rounded-full transition-all duration-300 relative ${
                          form[key as keyof FormData] ? 'bg-gold-400' : 'bg-ivory/10'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                          form[key as keyof FormData] ? 'left-5' : 'left-0.5'
                        }`} />
                      </div>
                      <span className="text-xs tracking-widest uppercase font-sans text-ivory/50">{label}</span>
                    </label>
                  ))}
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-gold flex-1 py-4 flex items-center justify-center gap-2">
                    <Save size={15} />
                    {editProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline px-8 py-4">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ── */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center px-4"
            style={{ background: 'rgba(13,13,13,0.9)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark rounded-sm p-8 max-w-sm w-full text-center"
              style={{ border: '1px solid rgba(196,113,74,0.3)' }}
            >
              <Trash2 size={32} className="mx-auto mb-4 text-terracotta" />
              <h3 className="font-serif text-ivory text-2xl font-light mb-2">Delete Product?</h3>
              <p className="text-ivory/40 text-sm font-sans mb-8">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 bg-terracotta text-ivory text-xs tracking-widest uppercase font-sans hover:bg-terracotta/80 transition-colors">
                  Delete
                </button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-outline py-3">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
