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
    <div className="min-h-screen bg-ivory">
      {/* Editorial Page Header */}
      <div className="relative bg-[#0d0d0d] pt-28 sm:pt-32 pb-6 sm:pb-8 px-6 text-center overflow-hidden border-b border-gold-400/10">
        {/* Subtle Ambient Radial Gold Glow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(201,168,76,0.06) 0%, rgba(0,0,0,0) 80%)',
          }}
        />
        {/* Subtle Organic Film Grain Noise Texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          }}
        />

        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <span className="text-gold-400 text-[10px] tracking-[0.5em] uppercase font-sans block mb-3">
            Atelier Curations
          </span>
          <h1 className="font-serif text-ivory text-4xl sm:text-5xl lg:text-6xl font-light tracking-wide">
            {filters.category || 'All Collections'}
          </h1>
          <div className="w-10 h-[1px] bg-gold-400/30 mx-auto my-6" />
          <p className="text-ivory/50 font-sans text-xs tracking-widest uppercase">
            {filtered.length} masterwork{filtered.length !== 1 ? 's' : ''} available
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        {/* Category Pills (Elegant Horizontal Scroller) */}
        <div className="flex gap-2.5 pb-3 mb-10 overflow-x-auto scrollbar-hide border-b border-obsidian/5">
          {['All', ...categories.map((category) => category.name)].map((cat) => {
            const isSelected = (cat === 'All' && !filters.category) || filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilters((f) => ({ ...f, category: cat === 'All' ? '' : cat }))}
                className={`px-6 py-2.5 text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-sans font-medium whitespace-nowrap transition-all duration-300 rounded-sm border ${
                  isSelected
                    ? 'bg-obsidian text-gold-400 border-gold-400/35 shadow-lg'
                    : 'bg-transparent text-obsidian/60 border-obsidian/10 hover:border-gold-400/30 hover:text-obsidian'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search + Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          {/* Search box */}
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian/35" />
            <input
              type="text"
              placeholder="Search by collection, materials, pearls..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-11 pr-10 py-3.5 bg-white/40 border border-obsidian/12 text-obsidian placeholder-obsidian/30 text-xs tracking-wider font-sans outline-none focus:border-gold-400/40 focus:bg-white transition-all duration-300 rounded-sm"
            />
            {filters.search && (
              <button 
                onClick={() => setFilters((f) => ({ ...f, search: '' }))} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-obsidian/30 hover:text-obsidian transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            {/* Custom Sort Select wrapper */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as FilterState['sortBy'] }))}
                className="w-full sm:w-56 px-4 py-3.5 pr-10 bg-white/40 border border-obsidian/12 text-obsidian text-[10px] tracking-[0.2em] uppercase font-sans outline-none focus:border-gold-400/40 hover:border-gold-400/30 cursor-pointer appearance-none rounded-sm transition-all"
              >
                <option value="popularity">Sort: Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-obsidian/40">
                <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 border text-[10px] tracking-[0.2em] uppercase font-sans font-medium rounded-sm transition-all duration-300 ${
                showFilters 
                  ? 'bg-obsidian text-gold-400 border-gold-400/35 shadow-lg' 
                  : 'bg-white/40 border-obsidian/12 text-obsidian/70 hover:border-gold-400/30 hover:text-obsidian'
              }`}
            >
              <SlidersHorizontal size={13} />
              Filters
            </button>
          </div>
        </div>

        {/* Expanded Filters Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden mb-10"
            >
              <div className="border border-gold-400/10 p-6 sm:p-8 flex flex-col sm:flex-row flex-wrap gap-8 bg-sand/15 rounded-sm">
                
                {/* Availability Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters((f) => ({ ...f, inStock: e.target.checked }))}
                    className="w-4 h-4 rounded border-obsidian/12 accent-[#c6a45c] cursor-pointer"
                  />
                  <span className="text-[10px] tracking-[0.2em] uppercase font-sans text-obsidian/60 group-hover:text-obsidian transition-colors">
                    In Stock Only
                  </span>
                </label>

                {/* Price Slider */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 max-w-md">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-sans text-obsidian/60 whitespace-nowrap">
                    Max Budget: <strong className="text-obsidian">€{filters.priceRange[1]}</strong>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={50}
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters((f) => ({ ...f, priceRange: [0, Number(e.target.value)] }))}
                    className="w-full h-1 bg-obsidian/10 rounded-lg appearance-none cursor-pointer accent-[#c6a45c]"
                  />
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white/30 border border-obsidian/5 rounded-sm">
            <p className="font-serif text-obsidian/50 text-2xl font-light">No pieces found matching your selections.</p>
            <p className="text-obsidian/30 font-sans text-xs tracking-widest uppercase mt-2">Try clearing search keywords or selecting other categories</p>
            <button
              onClick={() => setFilters((f) => ({ ...f, category: '', search: '', inStock: false, priceRange: [0, 2000] }))}
              className="mt-8 px-8 py-3 bg-obsidian text-gold-400 hover:text-white transition-all text-[10px] tracking-[0.25em] uppercase font-sans rounded-sm border border-gold-400/20"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
