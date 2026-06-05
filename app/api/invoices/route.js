import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Invoice from '@/models/Invoice'
import UserSettings from '@/models/UserSettings'
import { requireActiveUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const { user, error, status } = await requireActiveUser(request)
    if (error) return NextResponse.json({ error }, { status })

    await connectDB()
    const { searchParams } = new URL(request.url)
    const invoiceStatus = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    const query = { userId: user._id }
    if (invoiceStatus) query.status = invoiceStatus
    if (search) {
      query.$or = [
        { 'customer.firstName': { $regex: search, $options: 'i' } },
        { 'customer.lastName': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ]
      const num = parseInt(search)
      if (!isNaN(num)) query.$or.push({ invoiceNumber: num })
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 })
    return NextResponse.json({ invoices })
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

    const settings = await UserSettings.findOne({ userId: user._id })
    const storeInfo = settings
      ? { name: settings.storeName, phone: settings.storePhone, address: settings.storeAddress }
      : {}

    const invoice = await Invoice.create({
      ...body,
      userId: user._id,
      storeInfo,
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
