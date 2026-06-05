import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Invoice from '@/models/Invoice'
import Product from '@/models/Product'
import { requireActiveUser } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const invoice = await Invoice.findOne({ _id: params.id, userId: user._id })
    if (!invoice) return NextResponse.json({ error: 'فاکتور یافت نشد' }, { status: 404 })
    return NextResponse.json({ invoice })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const body = await request.json()
    const invoice = await Invoice.findOneAndUpdate(
      { _id: params.id, userId: user._id },
      body,
      { new: true }
    )
    if (!invoice) return NextResponse.json({ error: 'فاکتور یافت نشد' }, { status: 404 })

    if (body.status === 'completed' && body.items) {
      for (const item of body.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          })
        }
      }
    }

    return NextResponse.json({ invoice })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    await Invoice.findOneAndDelete({ _id: params.id, userId: user._id })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
