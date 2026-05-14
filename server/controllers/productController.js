import Product from '../models/Product.js';
import Category from '../models/Category.js';

// Escape special regex characters to prevent ReDoS
const escapeRegex = (str) =>
  String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);

// Whitelist of fields a user/admin may set on a product
const PRODUCT_FIELDS = [
  'name', 'brand', 'price', 'originalPrice', 'image', 'images',
  'category', 'description', 'material', 'origin', 'stockQuantity',
  'rating', 'reviewCount', 'inStock', 'isActive', 'isNew',
  'isBestseller', 'isFeatured', 'tags', 'sku', 'weight',
  'dimensions', 'seoTitle', 'seoDescription',
];

const sanitizeProductBody = (body) =>
  PRODUCT_FIELDS.reduce((acc, field) => {
    if (body[field] !== undefined) acc[field] = body[field];
    return acc;
  }, {});

// ── GET /api/products ──────────────────────────────────────────
export const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      inStock,
      isNew,
      isBestseller,
      isFeatured,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = String(category).slice(0, 100);
    if (inStock === 'true') query.inStock = true;
    if (isNew === 'true') query.isNew = true;
    if (isBestseller === 'true') query.isBestseller = true;
    if (isFeatured === 'true') query.isFeatured = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { category: { $regex: safeSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(safeSearch, 'i')] } },
      ];
    }

    const sortMap = { price: 'price', rating: 'rating', newest: 'createdAt', name: 'name' };
    const sortField = sortMap[sortBy] || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('[getAllProducts]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

// ── GET /api/products/:id ──────────────────────────────────────
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    console.error('[getProductById]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
};

// ── POST /api/admin/products ───────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const product = new Product(sanitizeProductBody(req.body));
    await product.save();
    if (product.category) {
      await Category.updateOne(
        { name: product.category },
        { $setOnInsert: { name: product.category, image: product.image, isActive: true } },
        { upsert: true }
      );
    }
    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('[createProduct]', error);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

// ── PUT /api/admin/products/:id ────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      sanitizeProductBody(req.body),
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.category) {
      await Category.updateOne(
        { name: product.category },
        { $setOnInsert: { name: product.category, image: product.image, isActive: true } },
        { upsert: true }
      );
    }
    res.json({ success: true, message: 'Product updated', product });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    console.error('[updateProduct]', error);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// ── DELETE /api/admin/products/:id (soft delete) ──────────────
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('[deleteProduct]', error);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

// ── PATCH /api/admin/products/:id/stock ───────────────────────
export const updateStock = async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    if (stockQuantity === undefined || isNaN(Number(stockQuantity))) {
      return res.status(400).json({ success: false, message: 'stockQuantity must be a number' });
    }
    const qty = Math.max(0, Math.floor(Number(stockQuantity)));
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stockQuantity: qty, inStock: qty > 0 },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Stock updated', product });
  } catch (error) {
    console.error('[updateStock]', error);
    res.status(500).json({ success: false, message: 'Failed to update stock.' });
  }
};

// ── PATCH /api/admin/products/:id/visibility ──────────────────
export const updateVisibility = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: isActive ? 'Product shown' : 'Product hidden', product });
  } catch (error) {
    console.error('[updateVisibility]', error);
    res.status(500).json({ success: false, message: 'Failed to update visibility.' });
  }
};

// ── GET /api/categories ────────────────────────────────────────
export const getCategories = async (req, res) => {
  try {
    const [storedCategories, byCategory] = await Promise.all([
      Category.find({ isActive: true }).sort({ name: 1 }),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 }, image: { $first: '$image' } } },
      ]),
    ]);

    const countMap = new Map(byCategory.map((item) => [item._id, item]));
    const categories = storedCategories.map((category) => ({
      _id: category._id,
      name: category.name,
      image: category.image || countMap.get(category.name)?.image,
      count: countMap.get(category.name)?.count || 0,
    }));

    res.json({ success: true, categories });
  } catch (error) {
    console.error('[getCategories]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

// ── POST /api/admin/categories ────────────────────────────────
export const createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required' });
    const category = await Category.findOneAndUpdate(
      { name: String(name).trim().slice(0, 100) },
      { name: String(name).trim().slice(0, 100), image, isActive: true },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json({ success: true, message: 'Category saved', category });
  } catch (error) {
    console.error('[createCategory]', error);
    res.status(500).json({ success: false, message: 'Failed to save category.' });
  }
};

// ── DELETE /api/admin/categories/:id ──────────────────────────
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('[deleteCategory]', error);
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};

// ── GET /api/admin/products ────────────────────────────────────
export const adminGetAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category } = req.query;
    const query = {};
    if (category) query.category = String(category).slice(0, 100);
    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { sku: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(200, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('[adminGetAllProducts]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

// ── GET /api/admin/products/stats ─────────────────────────────
export const getProductStats = async (req, res) => {
  try {
    const [total, active, outOfStock, byCategory] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ inStock: false, isActive: true }),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: { total, active, inactive: total - active, outOfStock, byCategory },
    });
  } catch (error) {
    console.error('[getProductStats]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};

// ── POST /api/admin/seed ───────────────────────────────────────
export const seedProducts = async (req, res) => {
  // Disable seed endpoint in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Seed endpoint is disabled in production' });
  }

  try {
    const seedData = [
      { name: 'Chandni Minimal Jhumkas', price: 189, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', category: 'Minimal Jhumkas', rating: 4.9, reviewCount: 142, description: 'Delicate gold-plated jhumkas with a modern silhouette. Handcrafted in Jaipur using traditional Kundan setting techniques reimagined for the contemporary woman.', material: '22K Gold Plated Sterling Silver', origin: 'Jaipur, Rajasthan', stockQuantity: 45, isBestseller: true, isFeatured: true },
      { name: 'Riviera Pearl Drop Earrings', price: 245, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', category: 'Pearl Fusion', rating: 4.8, reviewCount: 98, description: 'South Sea pearls suspended in hand-hammered gold frames. A fusion of Indian pearl heritage and European minimalist design.', material: 'South Sea Pearls & 18K Gold Vermeil', origin: 'Mumbai & Surat', stockQuantity: 28, isNew: true, isFeatured: true },
      { name: 'Milano Kundan Collar', price: 485, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80', category: 'Indo-European Necklaces', rating: 4.9, reviewCount: 67, description: 'A statement collar necklace merging Kundan stone-setting with Italian architectural lines. Crafted by master artisans in Delhi.', material: 'Kundan Stones, 22K Gold Plating', origin: 'Delhi', stockQuantity: 15, isBestseller: true, isFeatured: true },
      { name: 'Sahara Geometric Jhumkas', price: 165, image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=80', category: 'Minimal Jhumkas', rating: 4.7, reviewCount: 203, description: 'Geometric hexagonal jhumkas with a matte gold finish. Clean lines meet traditional bell silhouette.', material: 'Brass with Matte Gold Plating', origin: 'Jaipur, Rajasthan', stockQuantity: 60 },
      { name: 'Baroque Pearl Choker', price: 320, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', category: 'Pearl Fusion', rating: 4.8, reviewCount: 54, description: 'Irregular baroque pearls strung on a delicate gold chain with a Meenakari-inspired clasp.', material: 'Baroque Freshwater Pearls, Gold-filled Chain', origin: 'Surat, Gujarat', stockQuantity: 22, isNew: true },
      { name: 'Devi Kundan Statement Ring', price: 275, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80', category: 'Modern Kundan', rating: 4.6, reviewCount: 89, description: 'A bold cocktail ring featuring hand-set Kundan stones in a modern architectural setting.', material: 'Kundan, Sterling Silver, 22K Gold Plating', origin: 'Delhi', stockQuantity: 35 },
      { name: 'Diwali Luxe Bridal Set', price: 1290, originalPrice: 1580, image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80', category: 'Festival Sets', rating: 5.0, reviewCount: 31, description: 'Complete bridal set: statement necklace, jhumka earrings, and maang tikka. Handcrafted over 40 hours by master artisans in Jaipur.', material: 'Kundan, Polki Diamonds, 22K Gold', origin: 'Jaipur, Rajasthan', stockQuantity: 8, isBestseller: true, isFeatured: true },
      { name: 'Arco Iris Layered Necklace', price: 395, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', category: 'Indo-European Necklaces', rating: 4.7, reviewCount: 76, description: 'Three-layer necklace combining delicate gold chains with a central Meenakari pendant.', material: '18K Gold Vermeil, Meenakari Enamel', origin: 'Mumbai', stockQuantity: 19 },
      { name: 'Lotus Minimal Studs', price: 125, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', category: 'Minimal Jhumkas', rating: 4.9, reviewCount: 318, description: 'Tiny lotus-motif studs in matte gold. The perfect everyday earring that carries cultural meaning with effortless elegance.', material: '18K Gold Plated Sterling Silver', origin: 'Jaipur, Rajasthan', stockQuantity: 120, isBestseller: true },
      { name: 'Navratri Celebration Set', price: 890, image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80', category: 'Festival Sets', rating: 4.8, reviewCount: 44, description: 'Vibrant festival set with Meenakari necklace and matching jhumkas.', material: 'Meenakari Enamel, 22K Gold Plating', origin: 'Jaipur & Delhi', stockQuantity: 0 },
      { name: 'Versailles Kundan Bracelet', price: 340, image: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=80', category: 'Modern Kundan', rating: 4.7, reviewCount: 62, description: 'A wide cuff bracelet with Kundan inlay inspired by Versailles palace motifs.', material: 'Kundan Stones, Brass, 22K Gold Plating', origin: 'Delhi', stockQuantity: 25, isNew: true },
      { name: 'Malabar Pearl Ear Cuff', price: 195, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', category: 'Pearl Fusion', rating: 4.6, reviewCount: 87, description: 'A sculptural ear cuff featuring Malabar pearls. No piercing required.', material: 'Freshwater Pearls, Sterling Silver', origin: 'Surat, Gujarat', stockQuantity: 40 },
    ].map((product, index) => ({
      ...product,
      brand: 'INDÉRA',
      sku: `IND-SEED-${String(index + 1).padStart(5, '0')}`,
      inStock: product.stockQuantity > 0,
      isActive: true,
    }));

    const result = await Product.bulkWrite(
      seedData.map((product) => ({
        updateOne: {
          filter: { sku: product.sku },
          update: { $set: product },
          upsert: true,
        },
      }))
    );

    const categoryMap = new Map();
    seedData.forEach((product) => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, { name: product.category, image: product.image, isActive: true });
      }
    });
    await Category.bulkWrite(
      [...categoryMap.values()].map((category) => ({
        updateOne: {
          filter: { name: category.name },
          update: { $set: category },
          upsert: true,
        },
      }))
    );

    res.status(201).json({
      success: true,
      message: `Seeded ${seedData.length} products`,
      count: seedData.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    });
  } catch (error) {
    console.error('[seedProducts]', error);
    res.status(500).json({ success: false, message: 'Failed to seed products.' });
  }
};
