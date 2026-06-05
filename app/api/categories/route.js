import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Category from '@/models/Category'
import { requireActiveUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const categories = await Category.find({ userId: user._id }).sort({ name: 1 })
    return NextResponse.json({ categories })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const { name } = await request.json()
    if (!name) return NextResponse.json({ error: 'نام دسته‌بندی الزامی است' }, { status: 400 })

    const category = await Category.create({ name, userId: user._id })
    return NextResponse.json({ category }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
