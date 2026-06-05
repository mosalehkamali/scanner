import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local manually
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const MONGODB_URI = process.env.MONGODB_URI
console.log('Connecting to:', MONGODB_URI.replace(/:([^:@]+)@/, ':***@'))

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  accountStatus: { type: String, default: 'pending' },
}, { timestamps: true })

const subscriptionPlanSchema = new mongoose.Schema({
  title: String,
  duration: Number,
  price: Number,
  isActive: Boolean,
})

const systemConfigSchema = new mongoose.Schema({
  bankCardNumber: String,
  bankCardOwner: String,
})

const User = mongoose.models.User || mongoose.model('User', userSchema)
const SubscriptionPlan = mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', subscriptionPlanSchema)
const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', systemConfigSchema)

async function run() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Database connected successfully')

    // Admin user
    let admin = await User.findOne({ username: 'amir' })
    if (!admin) {
      const hashed = await bcrypt.hash('hellogpt4', 12)
      admin = await User.create({
        firstName: 'امیر',
        lastName: 'مدیر',
        username: 'amir',
        password: hashed,
        role: 'admin',
        accountStatus: 'active',
      })
      console.log('✅ Admin user created: username=amir, password=hellogpt4')
    } else {
      console.log('ℹ️  Admin user already exists:', admin.username, '| role:', admin.role, '| status:', admin.accountStatus)
    }

    // Subscription plans
    const planCount = await SubscriptionPlan.countDocuments()
    if (planCount === 0) {
      await SubscriptionPlan.insertMany([
        { title: '۱ ماهه', duration: 1, price: 50000, isActive: true },
        { title: '۳ ماهه', duration: 3, price: 130000, isActive: true },
        { title: '۶ ماهه', duration: 6, price: 240000, isActive: true },
      ])
      console.log('✅ Subscription plans seeded')
    } else {
      console.log(`ℹ️  ${planCount} subscription plan(s) already exist`)
    }

    // System config
    const configExists = await SystemConfig.findOne()
    if (!configExists) {
      await SystemConfig.create({ bankCardNumber: '6037-xxxx-xxxx-xxxx', bankCardOwner: 'امیر مدیر' })
      console.log('✅ System config created')
    } else {
      console.log('ℹ️  System config already exists')
    }

    console.log('\n--- Done ---')
  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    await mongoose.disconnect()
  }
}

run()
