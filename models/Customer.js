import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  phone: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema)
