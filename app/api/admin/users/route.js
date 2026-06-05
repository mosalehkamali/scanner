import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { requireAdmin } from '@/lib/auth'

export async function GET(request) {
  try {
    const { user, error, status } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const users = await User.find({ role: 'user' })
      .populate('subscriptionPlan', 'title duration price')
      .sort({ createdAt: -1 })
      .select('-password')

    return NextResponse.json({ users })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
