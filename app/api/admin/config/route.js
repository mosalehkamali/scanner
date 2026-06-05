import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import SystemConfig from '@/models/SystemConfig'
import { requireAdmin } from '@/lib/auth'

export async function GET(request) {
  try {
    const { user, error, status } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const config = await SystemConfig.findOne()
    return NextResponse.json({ config })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { user, error, status } = await requireAdmin(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const body = await request.json()
    const config = await SystemConfig.findOneAndUpdate({}, body, { new: true, upsert: true })
    return NextResponse.json({ config })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
