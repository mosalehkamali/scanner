import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import SystemConfig from '@/models/SystemConfig'

export async function GET() {
  try {
    await connectDB()
    const config = await SystemConfig.findOne().select('bankCardNumber bankCardOwner')
    return NextResponse.json({ config })
  } catch (err) {
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
