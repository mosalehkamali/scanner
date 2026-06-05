import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/db'
import User from '@/models/User'
import PaymentReceipt from '@/models/PaymentReceipt'
import SubscriptionPlan from '@/models/SubscriptionPlan'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request) {
  try {
    await connectDB()
    const formData = await request.formData()

    const firstName = formData.get('firstName')
    const lastName = formData.get('lastName')
    const username = formData.get('username')
    const password = formData.get('password')
    const planId = formData.get('planId')
    const receiptFile = formData.get('receipt')

    if (!firstName || !lastName || !username || !password || !planId || !receiptFile) {
      return NextResponse.json({ error: 'تمام فیلدها الزامی است' }, { status: 400 })
    }

    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return NextResponse.json({ error: 'این نام کاربری قبلاً ثبت شده است' }, { status: 400 })
    }

    const plan = await SubscriptionPlan.findById(planId)
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'پلان انتخابی معتبر نیست' }, { status: 400 })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'receipts')
    await mkdir(uploadDir, { recursive: true })

    const bytes = await receiptFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = receiptFile.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
    const filePath = join(uploadDir, filename)
    await writeFile(filePath, buffer)

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      role: 'user',
      subscriptionPlan: planId,
      accountStatus: 'pending',
    })

    await PaymentReceipt.create({
      userId: user._id,
      planId,
      receiptImage: `/uploads/receipts/${filename}`,
      status: 'pending',
    })

    return NextResponse.json({ success: true, message: 'ثبت‌نام با موفقیت انجام شد. منتظر تأیید پرداخت باشید' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
