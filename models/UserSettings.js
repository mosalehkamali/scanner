import mongoose from 'mongoose'

const userSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  storeName: { type: String, default: '' },
  storePhone: { type: String, default: '' },
  storeAddress: { type: String, default: '' },
  invoiceFontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
  receiptWidth: { type: String, enum: ['58mm', '80mm', 'A4'], default: '80mm' },
}, { timestamps: true })

export default mongoose.models.UserSettings || mongoose.model('UserSettings', userSettingsSchema)
