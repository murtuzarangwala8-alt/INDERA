import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Category', categorySchema);
