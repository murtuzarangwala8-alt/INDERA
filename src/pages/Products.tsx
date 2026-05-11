import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useCategories, useProducts } from '../hooks/useProducts';
import { FilterState } from '../types';

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    priceRange: [0, 2000],
    inStock: false,
    search: searchParams.get('search') || '',
    sortBy: 'popularity',
  });
  const [showFilters, setShowFilters] = useState(false);
  const categories = useCategories();

  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const q = searchParams.get('search') || '';
    setFilters((f) => ({ ...f, category: cat, search: q }));
  }, [searchParams]);

  const products = useProducts();
  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchCat = !filters.category || p.category === filters.category;
      const matchSearch = !filters.search || p.name.toLowerCase().includes(filters.search.toLowerCase()) || p.category.toLowerCase().includes(filters.search.toLowerCase());
      const matchStock = !filters.inStock || p.inStock;
      const matchPrice = p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1];
      return p.isActive !== false && !p.hidden && matchCat && matchSearch && matchStock && matchPrice;
    });
    if (filters.sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (filters.sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (filters.sortBy === 'popularity') result.sort((a, b) => b.rating - a.rating);
    if (filters.sortBy === 'newest') result.sort((a, b) => Number(b.id) - Number(a.id));
    return result;
  }, [filters, products]);

  return (
    <div className="min-h-screen bg-ivory pt-24">
      {/* Page Header */}
      <div className="bg-obsidian py-20 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-gold-400 text-[10px] tracking-[0.4em] uppercase font-sans mb-4">INDÉRA</p>
          <h1 className="font-serif text-ivory text-5xl font-light">
            {filters.category || 'All Collections'}
          </h1>
          <p className="text-ivory/40 font-sans text-sm mt-3">
            {filtered.length} piece{filtered.length !== 1 ? 's' : ''}
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap mb-8 overflow-x-auto scrollbar-hide">
          {['All', ...categories.map((category) => category.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilters((f) => ({ ...f, category: cat === 'All' ? '' : cat }))}
              className={`px-5 py-2 text-[10px] tracking-[0.2em] uppercase font-sans whitespace-nowrap transition-all duration-300 ${
                (cat === 'All' && !filters.category) || filters.category === cat
                  ? 'bg-obsidian text-gold-400 border border-gold-400/30'
                  : 'bg-transparent text-obsidian/50 border border-obsidian/15 hover:border-gold-400/40 hover:text-obsidian'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian/30" />
            <input
              type="text"
              placeholder="Search jewelry..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 bg-transparent border border-obsidian/15 text-obsidian placeholder-obsidian/30 text-sm font-sans outline-none focus:border-gold-400/50 transition-colors"
            />
            {filters.search && (
              <button onClick={() => setFilters((f) => ({ ...f, search: '' }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-obsidian/30 hover:text-obsidian">
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as FilterState['sortBy'] }))}
            className="px-4 py-3 bg-transparent border border-obsidian/15 text-obsidian text-xs tracking-widest uppercase font-sans outline-none focus:border-gold-400/50 cursor-pointer"
          >
            <option value="popularity">Sort: Popularity</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 border text-xs tracking-widest uppercase font-sans transition-all ${
              showFilters ? 'bg-obsidian text-gold-400 border-obsidian' : 'border-obsidian/15 text-obsidian/60 hover:border-gold-400/40'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="border border-obsidian/10 p-6 flex flex-wrap gap-8 bg-sand/20">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters((f) => ({ ...f, inStock: e.target.checked }))}
                    className="w-4 h-4 accent-gold-500"
                  />
                  <span className="text-xs tracking-widest uppercase font-sans text-obsidian/60">In Stock Only</span>
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-xs tracking-widest uppercase font-sans text-obsidian/60">Max Price: €{filters.priceRange[1]}</span>
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={50}
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters((f) => ({ ...f, priceRange: [0, Number(e.target.value)] }))}
                    className="w-32 accent-gold-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="font-serif text-obsidian/40 text-2xl font-light">No pieces found.</p>
            <button
              onClick={() => setFilters((f) => ({ ...f, category: '', search: '', inStock: false }))}
              className="mt-6 btn-outline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
