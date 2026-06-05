import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  barcode: { type: String, default: '' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  price: { type: Number, required: true, default: 0 },
  stock: { type: Number, default: 0 },
  lowStockLimit: { type: Number, default: 5 },
  description: { type: String, default: '' },
}, { timestamps: true })

productSchema.index({ userId: 1, barcode: 1 })
productSchema.index({ userId: 1, name: 'text' })

export default mongoose.models.Product || mongoose.model('Product', productSchema)
