import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  brand: {
    type: String,
    default: 'INDÉRA',
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
  },
  image: {
    type: String,
    required: [true, 'Product image is required'],
  },
  images: [{
    type: String,
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  material: {
    type: String,
    required: [true, 'Material is required'],
  },
  origin: {
    type: String,
    required: [true, 'Origin is required'],
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  isNew: {
    type: Boolean,
    default: false,
  },
  isBestseller: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  tags: [{
    type: String,
  }],
  seoTitle: String,
  seoDescription: String,
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Generate SKU automatically
productSchema.pre('save', async function(next) {
  if (!this.sku) {
    const count = await mongoose.model('Product').countDocuments();
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    this.sku = `IND-${categoryCode}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Update inStock based on stockQuantity
productSchema.pre('save', function(next) {
  this.inStock = this.stockQuantity > 0;
  next();
});

// Indexes for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isBestseller: 1, isNew: 1 });
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
