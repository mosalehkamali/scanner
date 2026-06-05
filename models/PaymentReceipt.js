import mongoose from 'mongoose'

const paymentReceiptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  receiptImage: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNote: { type: String, default: '' },
  adminReviewDate: { type: Date },
}, { timestamps: true })

export default mongoose.models.PaymentReceipt || mongoose.model('PaymentReceipt', paymentReceiptSchema)
