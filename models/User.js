import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
  subscriptionStart: { type: Date },
  subscriptionEnd: { type: Date },
  accountStatus: {
    type: String,
    enum: ['pending', 'active', 'expired', 'rejected', 'disabled'],
    default: 'pending',
  },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', userSchema)
