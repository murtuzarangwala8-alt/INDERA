import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, 'First name is required'], trim: true },
  lastName:  { type: String, required: [true, 'Last name is required'],  trim: true },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
  },
  emailVerified: { type: Boolean, default: false },
  emailOtp:      { type: String },
  emailOtpExpiry:{ type: Date },

  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
  },
  phoneVerified: { type: Boolean, default: false },
  phoneOtp:      { type: String },
  phoneOtpExpiry:{ type: Date },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },

  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isActive: { type: Boolean, default: true },

  wishlist: [{ type: Number }],

  shippingAddresses: [{
    label:    { type: String, default: 'Home' },
    address:  String,
    city:     String,
    zipCode:  String,
    country:  String,
    isDefault:{ type: Boolean, default: false },
  }],

  passwordResetToken:  { type: String },
  passwordResetExpiry: { type: Date },

  lastLogin: { type: Date },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailOtp;
  delete obj.phoneOtp;
  delete obj.emailOtpExpiry;
  delete obj.phoneOtpExpiry;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpiry;
  return obj;
};

export default mongoose.model('User', userSchema);
