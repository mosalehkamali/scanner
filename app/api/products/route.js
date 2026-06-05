import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Product from '@/models/Product'
import Category from '@/models/Category'
import { requireActiveUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const barcode = searchParams.get('barcode') || ''

    const query = { userId: user._id }

    if (barcode) {
      query.barcode = barcode
    } else {
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } },
        ]
      }
      if (category) query.categoryId = category
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })

    return NextResponse.json({ products })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const body = await request.json()
    const product = await Product.create({ ...body, userId: user._id })
    const populated = await product.populate('categoryId', 'name')
    return NextResponse.json({ product: populated }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
