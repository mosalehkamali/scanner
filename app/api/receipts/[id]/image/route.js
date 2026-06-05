import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import PaymentReceipt from '@/models/PaymentReceipt'
import { requireAdmin } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const { error, status } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const receipt = await PaymentReceipt.findById(params.id).select('receiptImage')
    if (!receipt || !receipt.receiptImage?.data) {
      return NextResponse.json({ error: 'تصویر یافت نشد' }, { status: 404 })
    }

    return new NextResponse(receipt.receiptImage.data, {
      headers: {
        'Content-Type': receipt.receiptImage.contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
