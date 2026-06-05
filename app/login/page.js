'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'خطا در ورود')
        return
      }
      toast.success('خوش آمدید!')
      if (data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch {
      toast.error('خطای اتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">ورود به سیستم</h1>
          <p className="text-gray-500 mt-1 text-sm">سیستم حسابداری و فروشگاهی</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری</label>
            <div className="relative">
              <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pr-10"
                placeholder="نام کاربری را وارد کنید"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
            <div className="relative">
              <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                className="input-field pr-10"
                placeholder="رمز عبور را وارد کنید"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          حساب ندارید؟{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </div>
  )
}
