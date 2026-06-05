'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { FiUser, FiLock, FiUpload, FiCheck, FiCreditCard, FiArrowLeft } from 'react-icons/fi'

export default function RegisterPage() {
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', password: '', planId: '' })
  const [receipt, setReceipt] = useState(null)
  const [bankInfo, setBankInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/plans').then(r => r.json()).then(d => {
      setPlans(d.plans || [])
      if (d.plans?.length > 0) setForm(f => ({ ...f, planId: d.plans[0]._id }))
    })
    fetch('/api/public/config').then(r => r.json()).then(d => setBankInfo(d.config)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!receipt) return toast.error('لطفاً رسید پرداخت را آپلود کنید')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('receipt', receipt)
      const res = await fetch('/api/auth/register', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error || 'خطا در ثبت‌نام')
      toast.success(data.message || 'ثبت‌نام انجام شد')
      router.push('/login')
    } catch {
      toast.error('خطای اتصال')
    } finally {
      setLoading(false)
    }
  }

  const selectedPlan = plans.find(p => p._id === form.planId)

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-neon-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-neon-500 shadow-[0_0_30px_rgba(162,28,175,0.5)] mb-4">
            <FiUser className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold gradient-text mb-1">ثبت‌نام</h1>
          <p className="text-zinc-400 text-sm">ایجاد حساب جدید</p>
        </div>

        <div className="card p-8">
          {/* Bank info */}
          {bankInfo && (
            <div className="mb-6 rounded-xl bg-neon-500/10 border border-neon-500/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiCreditCard className="text-neon-400 w-4 h-4" />
                <span className="text-neon-400 text-xs font-semibold tracking-wide uppercase">اطلاعات پرداخت</span>
              </div>
              <p className="text-white font-mono text-sm tracking-wider">{bankInfo.bankCardNumber}</p>
              <p className="text-zinc-400 text-xs mt-1">به نام: {bankInfo.bankCardOwner}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 tracking-wide uppercase">نام</label>
                <input className="input-field" placeholder="نام" value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 tracking-wide uppercase">نام خانوادگی</label>
                <input className="input-field" placeholder="نام خانوادگی" value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 tracking-wide uppercase">نام کاربری</label>
              <div className="relative">
                <FiUser className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input className="input-field pr-10" placeholder="نام کاربری" value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 tracking-wide uppercase">رمز عبور</label>
              <div className="relative">
                <FiLock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input type="password" className="input-field pr-10" placeholder="رمز عبور" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>

            {/* Plan selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 tracking-wide uppercase">پلان اشتراک</label>
              <div className="grid grid-cols-3 gap-2">
                {plans.map(p => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => setForm({ ...form, planId: p._id })}
                    className={`relative rounded-xl p-3 text-center border transition-all duration-200 ${
                      form.planId === p._id
                        ? 'border-brand-500 bg-brand-500/20 text-white'
                        : 'border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {form.planId === p._id && (
                      <div className="absolute top-1.5 left-1.5 w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center">
                        <FiCheck className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <div className="font-bold text-lg">{p.duration}</div>
                    <div className="text-xs opacity-60">ماه</div>
                    <div className="text-xs font-semibold mt-1">{p.price?.toLocaleString('fa-IR')}</div>
                  </button>
                ))}
              </div>
              {selectedPlan && (
                <p className="text-xs text-zinc-500 mt-1.5">{selectedPlan.title} — {selectedPlan.duration} ماه</p>
              )}
            </div>

            {/* Receipt upload */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 tracking-wide uppercase">رسید پرداخت</label>
              <label className={`flex flex-col items-center justify-center rounded-xl p-5 cursor-pointer transition-all duration-200 border-2 border-dashed ${
                receipt
                  ? 'border-acid-400/50 bg-acid-400/10 text-acid-400'
                  : 'border-zinc-700 bg-zinc-900/60 text-zinc-500 hover:border-brand-500/50 hover:bg-brand-500/5'
              }`}>
                {receipt ? <FiCheck className="w-6 h-6 mb-1" /> : <FiUpload className="w-6 h-6 mb-1" />}
                <span className="text-sm font-medium">{receipt ? receipt.name : 'کلیک کنید یا فایل بکشید'}</span>
                <input type="file" accept="image/*,.pdf" className="hidden"
                  onChange={e => setReceipt(e.target.files[0])} />
              </label>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  ثبت‌نام
                  <FiArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="divider-glow my-6" />
          <p className="text-center text-sm text-zinc-500">
            حساب دارید؟{' '}
            <Link href="/login" className="text-brand-300 hover:text-brand-200 font-semibold transition-colors">ورود</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
