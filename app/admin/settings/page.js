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
      if (d.config) setForm({
        bankCardNumber: d.config.bankCardNumber || '',
        bankCardOwner: d.config.bankCardOwner || '',
      })
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
    if (res.ok) {
      toast.success('تنظیمات ذخیره شد')
    } else {
      toast.error('خطا در ذخیره')
    }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">تنظیمات سیستم</h1>

      <div className="max-w-lg">
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4 text-base">اطلاعات حساب بانکی</h2>
          <p className="text-sm text-gray-500 mb-4">
            این اطلاعات در صفحه ثبت‌نام به کاربران نمایش داده می‌شود.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">شماره کارت</label>
              <div className="relative">
                <FiCreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input-field pr-10 font-mono tracking-wider"
                  placeholder="6037-XXXX-XXXX-XXXX"
                  value={form.bankCardNumber}
                  onChange={e => setForm({ ...form, bankCardNumber: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام صاحب حساب</label>
              <div className="relative">
                <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input-field pr-10"
                  placeholder="نام و نام خانوادگی"
                  value={form.bankCardOwner}
                  onChange={e => setForm({ ...form, bankCardOwner: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
              <FiSave className="w-4 h-4" />
              {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
