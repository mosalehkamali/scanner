'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { FiUser, FiLock, FiArrowLeft } from 'react-icons/fi'

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
      if (!res.ok) { toast.error(data.error || 'خطا در ورود'); return }
      toast.success('خوش آمدید!')
      if (data.user.role === 'admin') router.push('/admin')
      else router.push('/dashboard')
    } catch {
      toast.error('خطای اتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-neon-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-up">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-neon-500 shadow-[0_0_30px_rgba(162,28,175,0.5)] mb-4">
            <FiLock className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold gradient-text mb-1">ورود به سیستم</h1>
          <p className="text-zinc-400 text-sm">سیستم حسابداری و فروشگاهی</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 tracking-wide uppercase">نام کاربری</label>
              <div className="relative">
                <FiUser className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="text"
                  className="input-field pr-10"
                  placeholder="نام کاربری را وارد کنید"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 tracking-wide uppercase">رمز عبور</label>
              <div className="relative">
                <FiLock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="password"
                  className="input-field pr-10"
                  placeholder="رمز عبور را وارد کنید"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  در حال ورود...
                </>
              ) : (
                <>
                  ورود
                  <FiArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="divider-glow my-6" />

          <p className="text-center text-sm text-zinc-500">
            حساب ندارید؟{' '}
            <Link href="/register" className="text-brand-300 hover:text-brand-200 font-semibold transition-colors">
              ثبت‌نام کنید
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
