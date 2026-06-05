import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  total: { type: Number, required: true },
}, { _id: false })

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNumber: { type: Number },
  title: { type: String, default: 'فاکتور جدید' },
  customer: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  items: [itemSchema],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['open', 'completed', 'cancelled'],
    default: 'open',
  },
  storeInfo: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  notes: { type: String, default: '' },
}, { timestamps: true })

invoiceSchema.pre('save', async function (next) {
  if (this.isNew && !this.invoiceNumber) {
    const last = await this.constructor.findOne({ userId: this.userId }).sort({ invoiceNumber: -1 })
    this.invoiceNumber = last ? last.invoiceNumber + 1 : 1001
  }
  next()
})

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema)
