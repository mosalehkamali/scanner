import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(async (mongoose) => {
      await seedDatabase()
      return mongoose
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

async function seedDatabase() {
  try {
    const { default: User } = await import('@/models/User')
    const { default: SubscriptionPlan } = await import('@/models/SubscriptionPlan')
    const { default: SystemConfig } = await import('@/models/SystemConfig')

    const adminExists = await User.findOne({ username: 'amir' })
    if (!adminExists) {
      const hashed = await bcrypt.hash('hellogpt4', 12)
      await User.create({
        firstName: 'امیر',
        lastName: 'مدیر',
        username: 'amir',
        password: hashed,
        role: 'admin',
        accountStatus: 'active',
      })
      console.log('Admin user created')
    }

    const planCount = await SubscriptionPlan.countDocuments()
    if (planCount === 0) {
      await SubscriptionPlan.insertMany([
        { title: '۱ ماهه', duration: 1, price: 50000, isActive: true },
        { title: '۳ ماهه', duration: 3, price: 130000, isActive: true },
        { title: '۶ ماهه', duration: 6, price: 240000, isActive: true },
      ])
      console.log('Subscription plans created')
    }

    const configExists = await SystemConfig.findOne()
    if (!configExists) {
      await SystemConfig.create({
        bankCardNumber: '6037-xxxx-xxxx-xxxx',
        bankCardOwner: 'امیر مدیر',
      })
      console.log('System config created')
    }
  } catch (err) {
    console.error('Seed error:', err)
  }
}

export default connectDB
