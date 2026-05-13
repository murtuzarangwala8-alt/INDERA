import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gem, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { useCategories, useProducts } from '../hooks/useProducts';

const Home: React.FC = () => {
  const products = useProducts();
  const categories = useCategories();

  const visibleProducts = useMemo(
    () => products.filter((product) => product.isActive !== false && !product.hidden),
    [products]
  );

  const newArrivals = useMemo(
    () => visibleProducts.filter((product) => product.isNew).slice(0, 4),
    [visibleProducts]
  );

  const bestsellers = useMemo(
    () => visibleProducts.filter((product) => product.isBestseller).slice(0, 4),
    [visibleProducts]
  );

  const spotlight = visibleProducts[0];
  const categoryHighlights = categories.filter((category) => category.count !== 0).slice(0, 6);
  const editorialProducts = visibleProducts.slice(0, 3);

  return (
    <div className="bg-ivory">
      <Hero />

      <LiveCategoryStrip categories={categoryHighlights} />

      {newArrivals.length > 0 && (
        <ProductRail
          eyebrow="New In"
          title="Freshly Added"
          description="The newest pieces from the live collection, updated directly from your admin dashboard."
          products={newArrivals}
          link="/products?sort=newest"
        />
      )}

      {spotlight && <CollectionSpotlight product={spotlight} />}

      {bestsellers.length > 0 && (
        <ProductRail
          eyebrow="Most Loved"
          title="Bestsellers"
          description="Customer favourites and hero pieces selected from your current catalogue."
          products={bestsellers}
          link="/products"
          dark
        />
      )}

      {editorialProducts.length > 0 && <EditorialShowcase products={editorialProducts} />}

      <LiveServices />
    </div>
  );
};

interface CategoryStripProps {
  categories: Array<{ name: string; image: string; count?: number }>;
}

const LiveCategoryStrip: React.FC<CategoryStripProps> = ({ categories }) => {
  if (categories.length === 0) return null;

  return (
    <section className="bg-ivory px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-3">Shop Live</p>
            <h2 className="font-serif text-obsidian text-4xl lg:text-5xl font-light">Shop by Category</h2>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-sans text-gold-500 hover:text-gold-400 transition-colors">
            All Jewelry <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group block relative aspect-[4/5] overflow-hidden bg-sand"
                style={{ border: '1px solid rgba(201,168,76,0.18)' }}
              >
                <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-serif text-ivory text-lg leading-tight">{category.name}</p>
                  <p className="text-gold-300 text-[9px] tracking-widest uppercase font-sans mt-1">{category.count || 0} pieces</p>
                </div>
              </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

interface ProductRailProps {
  eyebrow: string;
  title: string;
  description: string;
  products: any[];
  link: string;
  dark?: boolean;
}

const ProductRail: React.FC<ProductRailProps> = ({ eyebrow, title, description, products, link, dark = false }) => (
  <section className={`px-6 py-24 ${dark ? 'bg-obsidian' : 'bg-ivory'}`}>
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-12">
        <div className="max-w-2xl">
          <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-3">{eyebrow}</p>
          <h2 className={`font-serif text-4xl lg:text-5xl font-light ${dark ? 'text-ivory' : 'text-obsidian'}`}>{title}</h2>
          <p className={`font-sans text-sm leading-relaxed mt-4 ${dark ? 'text-ivory/45' : 'text-obsidian/50'}`}>{description}</p>
        </div>
        <Link to={link} className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-sans text-gold-500 hover:text-gold-400 transition-colors">
          Shop Now <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
      </div>
    </div>
  </section>
);

const CollectionSpotlight: React.FC<{ product: any }> = ({ product }) => (
  <section className="bg-ivory px-6 py-24">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <div className="aspect-[4/5] overflow-hidden bg-sand">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="lg:px-10">
        <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-4">{product.category}</p>
        <h2 className="font-serif text-obsidian text-5xl lg:text-6xl font-light leading-none mb-6">{product.name}</h2>
        <p className="text-obsidian/50 font-sans text-base leading-relaxed mb-8">{product.description}</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Spec label="Material" value={product.material} />
          <Spec label="Origin" value={product.origin} />
        </div>
        <Link to={`/product/${product.id}`} className="btn-gold">Discover Piece</Link>
      </div>
    </div>
  </section>
);

const Spec: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="border-t border-obsidian/10 pt-3">
    <p className="text-[10px] tracking-widest uppercase font-sans text-obsidian/40">{label}</p>
    <p className="font-sans text-sm text-obsidian/70 mt-1">{value}</p>
  </div>
);

const EditorialShowcase: React.FC<{ products: any[] }> = ({ products }) => (
  <section className="bg-sand/35 px-6 py-24">
    <div className="max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-gold-500 text-[10px] tracking-[0.4em] uppercase font-sans mb-3">Style Stories</p>
        <h2 className="font-serif text-obsidian text-4xl lg:text-5xl font-light">Curated From Your Catalogue</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {products.map((product, index) => (
          <Link key={product.id} to={`/product/${product.id}`} className={`group block ${index === 1 ? 'md:mt-12' : ''}`}>
            <div className="aspect-[3/4] overflow-hidden bg-ivory">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="text-gold-500 text-[10px] tracking-[0.3em] uppercase font-sans mt-5">{product.category}</p>
            <h3 className="font-serif text-obsidian text-2xl font-light mt-1 group-hover:text-gold-500 transition-colors">{product.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const LiveServices = () => (
  <section className="bg-ivory px-6 py-20">
    <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { icon: Sparkles, title: 'New Drops', text: 'Live catalogue updates from admin' },
        { icon: Gem, title: 'Curated Finish', text: 'Jewelry-first product storytelling' },
        { icon: Truck, title: 'Tracked Orders', text: 'Account order history after checkout' },
        { icon: ShieldCheck, title: 'Verified Accounts', text: 'Email and phone OTP security' },
      ].map((item) => (
        <div key={item.title} className="bg-sand/30 p-7 border border-obsidian/8">
          <item.icon size={22} className="text-gold-500 mb-5" />
          <h3 className="font-serif text-obsidian text-2xl font-light">{item.title}</h3>
          <p className="font-sans text-sm text-obsidian/50 mt-2">{item.text}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Home;
