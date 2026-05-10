import Product from '../models/Product.js';

// GET /api/products — list with filter, search, sort, pagination
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

    if (category) query.category = category;
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
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortMap = {
      price: 'price',
      rating: 'rating',
      newest: 'createdAt',
      name: 'name',
    };
    const sortField = sortMap[sortBy] || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/products — create
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/products/:id — update
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated', product });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/products/:id — soft delete
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/products/:id/stock — update stock only
export const updateStock = async (req, res) => {
  try {
    const { stockQuantity } = req.body;
    if (stockQuantity === undefined) {
      return res.status(400).json({ success: false, message: 'stockQuantity is required' });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stockQuantity, inStock: stockQuantity > 0 },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Stock updated', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/products — all products including inactive (admin view)
export const adminGetAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/products/stats
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/products/seed — seed initial INDÉRA products
export const seedProducts = async (req, res) => {
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
      brand: 'INDERA',
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

    res.status(201).json({
      success: true,
      message: `Seeded ${seedData.length} products`,
      count: seedData.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
