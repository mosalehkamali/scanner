import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import SubscriptionPlan from '@/models/SubscriptionPlan'
import { requireAdmin } from '@/lib/auth'

export async function GET(request) {
  try {
    const { user, error, status } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const plans = await SubscriptionPlan.find().sort({ duration: 1 })
    return NextResponse.json({ plans })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { user, error, status } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const body = await request.json()
    const plan = await SubscriptionPlan.create(body)
    return NextResponse.json({ plan }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { user, error, status } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const body = await request.json()
    const { id, ...update } = body
    const plan = await SubscriptionPlan.findByIdAndUpdate(id, update, { new: true })
    return NextResponse.json({ plan })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
