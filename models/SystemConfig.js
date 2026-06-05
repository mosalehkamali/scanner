import mongoose from 'mongoose'

const systemConfigSchema = new mongoose.Schema({
  bankCardNumber: { type: String, default: '' },
  bankCardOwner: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.SystemConfig || mongoose.model('SystemConfig', systemConfigSchema)
