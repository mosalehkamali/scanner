import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import PaymentReceipt from '@/models/PaymentReceipt'
import Invoice from '@/models/Invoice'
import { requireAdmin } from '@/lib/auth'

export async function GET(request) {
  try {
    const { user, error, status } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const [totalUsers, activeUsers, pendingPayments, totalInvoices] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', accountStatus: 'active' }),
      PaymentReceipt.countDocuments({ status: 'pending' }),
      Invoice.countDocuments({ status: 'completed' }),
    ])

    return NextResponse.json({ totalUsers, activeUsers, pendingPayments, totalInvoices })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
