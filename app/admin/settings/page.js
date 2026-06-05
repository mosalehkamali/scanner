'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiSave, FiCreditCard, FiUser } from 'react-icons/fi'

export default function AdminSettingsPage() {
  const [form, setForm] = useState({ bankCardNumber: '', bankCardOwner: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/config').then(r => r.json()).then(d => {
      if (d.config) setForm({ bankCardNumber: d.config.bankCardNumber || '', bankCardOwner: d.config.bankCardOwner || '' })
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) toast.success('تنظیمات ذخیره شد')
    else toast.error('خطا در ذخیره')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-lg">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="rounded-2xl bg-zinc-900 border border-white/10 p-6 space-y-4 animate-pulse">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold gradient-text">تنظیمات سیستم</h1>
        <p className="text-zinc-500 text-sm mt-1">پیکربندی اطلاعات بانکی</p>
      </div>

      <div className="max-w-lg">
        <div className="card">
          {/* Section header */}
          <div className="mb-6">
            <span className="badge-neon mb-3">اطلاعات بانکی</span>
            <p className="text-zinc-500 text-sm mt-2">
              این اطلاعات در صفحه ثبت‌نام به کاربران نمایش داده می‌شود.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 tracking-wide uppercase">شماره کارت</label>
              <div className="relative">
                <FiCreditCard className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  className="input-field pr-10 font-mono tracking-wider"
                  placeholder="6037-XXXX-XXXX-XXXX"
                  value={form.bankCardNumber}
                  onChange={e => setForm({ ...form, bankCardNumber: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 tracking-wide uppercase">نام صاحب حساب</label>
              <div className="relative">
                <FiUser className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  className="input-field pr-10"
                  placeholder="نام و نام خانوادگی"
                  value={form.bankCardOwner}
                  onChange={e => setForm({ ...form, bankCardOwner: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  ذخیره تنظیمات
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
