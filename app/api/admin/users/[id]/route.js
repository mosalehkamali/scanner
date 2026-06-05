import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(request, { params }) {
  try {
    const { user, error, status } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const body = await request.json()
    const allowedFields = ['accountStatus', 'firstName', 'lastName']
    const update = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field]
    }

    const updated = await User.findByIdAndUpdate(params.id, update, { new: true }).select('-password')
    if (!updated) return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 })

    return NextResponse.json({ user: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error, status } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    await User.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
