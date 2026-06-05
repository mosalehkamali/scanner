import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import UserSettings from '@/models/UserSettings'
import { requireActiveUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const settings = await UserSettings.findOne({ userId: user._id })
    return NextResponse.json({ settings: settings || {} })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const body = await request.json()
    const settings = await UserSettings.findOneAndUpdate(
      { userId: user._id },
      { ...body, userId: user._id },
      { new: true, upsert: true }
    )
    return NextResponse.json({ settings })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
