import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'احراز هویت لازم است' }, { status: 401 })
    }
    return NextResponse.json({ user })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
