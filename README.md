# INDÉRA — Premium Indo-European Jewelry E-Commerce

A luxury 3D e-commerce website for **INDÉRA**, a premium Indo-European fusion jewelry brand combining Indian craftsmanship with European minimalism.

---

## 🎨 Brand Concept

**INDÉRA** is a premium Indo-European fusion jewelry and lifestyle brand that merges:
- Indian craftsmanship and heritage aesthetics
- Modern European minimalism and luxury positioning
- Artisan storytelling from Jaipur, Delhi, Mumbai, and Surat

**Positioning:** "Modern Indian heritage reimagined for Europe"

**Target Audience:**
- Premium online shoppers
- Women aged 22–40
- Indian diaspora in Europe
- European consumers interested in artisan luxury

---

## ✨ Features

### Design & UX
- **3D Premium Look:** Glassmorphism, soft shadows, floating elements, smooth animations
- **Luxury Indo-European Theme:** Ivory, sand beige, matte gold, obsidian, terracotta color palette
- **Responsive Design:** Optimized for mobile, tablet, and desktop
- **Framer Motion Animations:** Smooth page transitions and scroll-triggered animations
- **Premium Typography:** Cormorant Garamond (serif) + DM Sans (sans-serif)

### Sections
1. **Hero Section** — 3D floating jewelry visual with parallax effects
2. **Featured Collections** — Minimal Jhumkas, Pearl Fusion, Indo-European Necklaces, Modern Kundan, Festival Sets
3. **Product Cards** — 3D hover effects, matte gold borders, quick add to cart
4. **Brand Story** — Indian craftsmanship + European luxury narrative
5. **Artisan Craftsmanship** — Storytelling from Jaipur, Mumbai, Delhi, Surat
6. **Lookbook** — Premium editorial fashion layout
7. **Testimonials** — Customer reviews with glassmorphism cards
8. **Newsletter** — "Join the INDÉRA private list"
9. **Footer** — Shop, About, Shipping, Returns, Instagram, Pinterest, TikTok

### Functionality
- **Product Catalog** — Filter by category, search, sort by price/popularity
- **Shopping Cart** — Add/remove items, update quantities
- **Wishlist** — Save favorite pieces
- **Product Detail Pages** — Full specs, reviews, related products
- **SEO Optimized** — Meta tags, Open Graph, structured data

---

## 🚀 Tech Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS (custom luxury theme)
- **Animations:** Framer Motion
- **Routing:** React Router v6
- **State Management:** React Context API
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Build Tool:** Vite

---

## 📦 Installation

```bash
# Clone the repository
git clone <repo-url>
cd chronolux-watches

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎨 Color Palette

```css
Ivory:       #FAF7F2  (background)
Sand:        #E8DDD0  (accents)
Matte Gold:  #C9A84C  (primary brand color)
Terracotta:  #C4714A  (warm accent)
Obsidian:    #0D0D0D  (text, dark sections)
Charcoal:    #1A1A1A  (secondary dark)
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.tsx           — Premium nav with search overlay
│   ├── Hero.tsx             — 3D floating jewelry hero
│   ├── Categories.tsx       — Collection grid
│   ├── ProductCard.tsx      — 3D product cards
│   ├── BrandStory.tsx       — Brand narrative
│   ├── Artisan.tsx          — Artisan city storytelling
│   ├── Lookbook.tsx         — Editorial layout
│   ├── Testimonials.tsx     — Customer reviews
│   ├── Newsletter.tsx       — Email signup
│   ├── TrustBadges.tsx      — Brand pillars
│   └── Footer.tsx           — Site footer
├── pages/
│   ├── Home.tsx             — Homepage composition
│   ├── Products.tsx         — Product catalog with filters
│   ├── ProductDetail.tsx    — Individual product page
│   ├── Cart.tsx             — Shopping cart
│   ├── Wishlist.tsx         — Saved items
│   ├── About.tsx            — Brand story page
│   ├── Contact.tsx          — Contact form
│   └── Checkout.tsx         — Checkout flow
├── context/
│   └── CartContext.tsx      — Cart & wishlist state
├── data/
│   └── products.ts          — Product catalog data
├── types/
│   └── index.ts             — TypeScript interfaces
└── index.css                — Global styles + Tailwind
```

---

## 🌐 SEO Features

- **Meta Tags:** Title, description, keywords
- **Open Graph:** Social media preview cards
- **Structured Data:** Organization schema
- **Semantic HTML:** Proper heading hierarchy
- **Alt Text:** All images have descriptive alt attributes
- **Fast Loading:** Optimized images, code splitting

---

## 🎯 Product Categories

1. **Minimal Jhumkas** — Modern take on traditional Indian earrings
2. **Pearl Fusion** — South Sea pearls with European design
3. **Indo-European Necklaces** — Statement pieces merging cultures
4. **Modern Kundan** — Contemporary Kundan stone-setting
5. **Festival Sets** — Bridal and celebration jewelry
6. **Accessories** — Future expansion category

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build command
npm run build

# Publish directory
dist
```

---

## 📝 License

© 2024 INDÉRA. All rights reserved.

---

## 🤝 Contributing

This is a private commercial project. For inquiries, contact the INDÉRA team.

---

**Built with ❤️ for modern Indian heritage**
