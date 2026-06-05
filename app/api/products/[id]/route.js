import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Product from '@/models/Product'
import { requireActiveUser } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const product = await Product.findOne({ _id: params.id, userId: user._id }).populate('categoryId', 'name')
    if (!product) return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })
    return NextResponse.json({ product })
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
    const product = await Product.findOneAndUpdate(
      { _id: params.id, userId: user._id },
      body,
      { new: true }
    ).populate('categoryId', 'name')
    if (!product) return NextResponse.json({ error: 'محصول یافت نشد' }, { status: 404 })
    return NextResponse.json({ product })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    await Product.findOneAndDelete({ _id: params.id, userId: user._id })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
