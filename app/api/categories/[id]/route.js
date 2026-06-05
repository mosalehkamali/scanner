import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Category from '@/models/Category'
import { requireActiveUser } from '@/lib/auth'

export async function PUT(request, { params }) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const { name } = await request.json()
    const category = await Category.findOneAndUpdate(
      { _id: params.id, userId: user._id },
      { name },
      { new: true }
    )
    if (!category) return NextResponse.json({ error: 'دسته‌بندی یافت نشد' }, { status: 404 })
    return NextResponse.json({ category })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    await Category.findOneAndDelete({ _id: params.id, userId: user._id })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
