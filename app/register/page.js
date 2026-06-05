'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { FiUser, FiLock, FiUpload } from 'react-icons/fi'

export default function RegisterPage() {
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', password: '', planId: '',
  })
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">ثبت‌نام</h1>
          <p className="text-gray-500 mt-1 text-sm">ایجاد حساب جدید</p>
        </div>

        {bankInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
            <p className="font-bold text-blue-800 mb-1">اطلاعات پرداخت:</p>
            <p className="text-blue-700">شماره کارت: <span className="font-mono font-bold">{bankInfo.bankCardNumber}</span></p>
            <p className="text-blue-700">به نام: {bankInfo.bankCardOwner}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">نام</label>
              <input className="input-field" placeholder="نام" value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">نام خانوادگی</label>
              <input className="input-field" placeholder="نام خانوادگی" value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })} required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">نام کاربری</label>
            <input className="input-field" placeholder="نام کاربری" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">رمز عبور</label>
            <input type="password" className="input-field" placeholder="رمز عبور" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">پلان اشتراک</label>
            <select className="input-field" value={form.planId}
              onChange={e => setForm({ ...form, planId: e.target.value })} required>
              {plans.map(p => (
                <option key={p._id} value={p._id}>
                  {p.title} — {p.price.toLocaleString('fa-IR')} تومان
                </option>
              ))}
            </select>
            {selectedPlan && (
              <p className="text-xs text-gray-500 mt-1">مدت: {selectedPlan.duration} ماه</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">رسید پرداخت</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors">
              <FiUpload className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-sm text-gray-500">{receipt ? receipt.name : 'کلیک کنید یا فایل بکشید'}</span>
              <input type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => setReceipt(e.target.files[0])} />
            </label>
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'در حال ثبت...' : 'ثبت‌نام'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          حساب دارید؟{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">ورود</Link>
        </p>
      </div>
    </div>
  )
}
