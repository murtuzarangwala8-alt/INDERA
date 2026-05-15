import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, trim: true },
  email:       { type: String, required: true, trim: true, lowercase: true },
  firstName:   { type: String, required: true, trim: true },
  lastName:    { type: String, required: true, trim: true },
  reason:      {
    type: String,
    required: true,
    enum: ['damaged', 'wrong_item', 'not_as_described', 'changed_mind', 'other'],
  },
  description: { type: String, required: true, trim: true },
  resolution:  {
    type: String,
    required: true,
    enum: ['refund', 'replacement', 'exchange'],
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  // Reference to the linked order if found
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  ipAddress: { type: String },
}, { timestamps: true });

export default mongoose.model('ReturnRequest', returnRequestSchema);
