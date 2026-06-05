import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import PaymentReceipt from '@/models/PaymentReceipt'
import User from '@/models/User'
import SubscriptionPlan from '@/models/SubscriptionPlan'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(request, { params }) {
  try {
    const { user, error, status } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const { action, adminNote } = await request.json()

    const receipt = await PaymentReceipt.findById(params.id).populate('planId')
    if (!receipt) return NextResponse.json({ error: 'رسید یافت نشد' }, { status: 404 })

    if (action === 'approve') {
      const plan = receipt.planId
      const start = new Date()
      const end = new Date()
      end.setMonth(end.getMonth() + plan.duration)

      await User.findByIdAndUpdate(receipt.userId, {
        accountStatus: 'active',
        subscriptionStart: start,
        subscriptionEnd: end,
        subscriptionPlan: plan._id,
      })

      receipt.status = 'approved'
      receipt.adminNote = adminNote || ''
      receipt.adminReviewDate = new Date()
      await receipt.save()

      return NextResponse.json({ success: true, message: 'پرداخت تأیید شد و حساب کاربر فعال شد' })
    }

    if (action === 'reject') {
      await User.findByIdAndUpdate(receipt.userId, { accountStatus: 'rejected' })
      receipt.status = 'rejected'
      receipt.adminNote = adminNote || ''
      receipt.adminReviewDate = new Date()
      await receipt.save()

      return NextResponse.json({ success: true, message: 'پرداخت رد شد' })
    }

    return NextResponse.json({ error: 'عملیات نامعتبر' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
