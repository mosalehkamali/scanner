import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { signToken } from '@/lib/auth'

export async function POST(request) {
  try {
    await connectDB()
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'نام کاربری و رمز عبور الزامی است' }, { status: 400 })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return NextResponse.json({ error: 'نام کاربری یا رمز عبور اشتباه است' }, { status: 401 })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: 'نام کاربری یا رمز عبور اشتباه است' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      if (user.accountStatus === 'pending') {
        return NextResponse.json({ error: 'حساب شما در انتظار تأیید پرداخت است' }, { status: 403 })
      }
      if (user.accountStatus === 'rejected') {
        return NextResponse.json({ error: 'پرداخت شما رد شده است. لطفاً با پشتیبانی تماس بگیرید' }, { status: 403 })
      }
      if (user.accountStatus === 'disabled') {
        return NextResponse.json({ error: 'حساب شما غیرفعال شده است' }, { status: 403 })
      }
      if (user.accountStatus === 'active' && user.subscriptionEnd) {
        const now = new Date()
        if (user.subscriptionEnd < now) {
          await User.findByIdAndUpdate(user._id, { accountStatus: 'expired' })
          return NextResponse.json({ error: 'اشتراک شما منقضی شده است. لطفاً اشتراک خود را تمدید کنید' }, { status: 403 })
        }
      }
    }

    const token = signToken({ userId: user._id, role: user.role })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        accountStatus: user.accountStatus,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
