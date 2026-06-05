import mongoose from 'mongoose'

const subscriptionPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', subscriptionPlanSchema)
