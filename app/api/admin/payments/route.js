import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import PaymentReceipt from '@/models/PaymentReceipt'
import { requireAdmin } from '@/lib/auth'

export async function GET(request) {
  try {
    const { user, error, status } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const receipts = await PaymentReceipt.find()
      .populate('userId', 'firstName lastName username')
      .populate('planId', 'title duration price')
      .sort({ createdAt: -1 })

    return NextResponse.json({ receipts })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
