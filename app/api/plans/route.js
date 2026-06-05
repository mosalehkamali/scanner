import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import SubscriptionPlan from '@/models/SubscriptionPlan'

export async function GET() {
  try {
    await connectDB()
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ duration: 1 })
    return NextResponse.json({ plans })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
