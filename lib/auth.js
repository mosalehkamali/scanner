import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import connectDB from './db'

const JWT_SECRET = process.env.JWT_SECRET

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function getAuthUser(request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return null

    const decoded = verifyToken(token)
    if (!decoded) return null

    await connectDB()
    const { default: User } = await import('@/models/User')
    const user = await User.findById(decoded.userId).select('-password')
    return user
  } catch {
    return null
  }
}

export async function requireAuth(request) {
  const user = await getAuthUser(request)
  if (!user) {
    return { error: 'لطفاً ابتدا وارد شوید', status: 401 }
  }
  return { user }
}

export async function requireAdmin(request) {
  const { user, error, status } = await requireAuth(request)
  if (error) return { error, status }
  if (user.role !== 'admin') {
    return { error: 'دسترسی غیرمجاز', status: 403 }
  }
  return { user }
}

export async function requireActiveUser(request) {
  const { user, error, status } = await requireAuth(request)
  if (error) return { error, status }
  if (user.role === 'admin') return { user }
  if (user.accountStatus !== 'active') {
    return { error: 'حساب شما فعال نیست', status: 403 }
  }
  const now = new Date()
  if (user.subscriptionEnd && user.subscriptionEnd < now) {
    return { error: 'اشتراک شما منقضی شده است', status: 403 }
  }
  return { user }
}

export function errorResponse(message, status = 400) {
  return Response.json({ error: message }, { status })
}

export function successResponse(data, status = 200) {
  return Response.json(data, { status })
}
