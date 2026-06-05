'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiSave, FiShoppingBag, FiPhone, FiMapPin, FiType, FiPrinter } from 'react-icons/fi'

export default function SettingsPage() {
  const [form, setForm] = useState({
    storeName: '',
    storePhone: '',
    storeAddress: '',
    invoiceFontSize: 'medium',
    receiptWidth: '80mm',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.settings) {
        setForm(prev => ({ ...prev, ...d.settings }))
      }
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/settings', {
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">تنظیمات فروشگاه</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">اطلاعات فروشگاه</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام فروشگاه</label>
              <div className="relative">
                <FiShoppingBag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input-field pr-10"
                  placeholder="نام فروشگاه شما"
                  value={form.storeName}
                  onChange={e => setForm({ ...form, storeName: e.target.value })}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">این نام روی فاکتورها چاپ می‌شود</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">شماره تلفن</label>
              <div className="relative">
                <FiPhone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input-field pr-10"
                  placeholder="شماره تلفن فروشگاه"
                  value={form.storePhone}
                  onChange={e => setForm({ ...form, storePhone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">آدرس فروشگاه</label>
              <div className="relative">
                <FiMapPin className="absolute right-3 top-3 text-gray-400" />
                <textarea
                  className="input-field pr-10 resize-none"
                  rows={2}
                  placeholder="آدرس فروشگاه"
                  value={form.storeAddress}
                  onChange={e => setForm({ ...form, storeAddress: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">تنظیمات چاپ فاکتور</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiType className="inline ml-1" />
                اندازه فونت
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: 'small', label: 'کوچک' },
                  { v: 'medium', label: 'متوسط' },
                  { v: 'large', label: 'بزرگ' },
                ].map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setForm({ ...form, invoiceFontSize: opt.v })}
                    className={`py-2 rounded-lg text-sm border transition-colors ${form.invoiceFontSize === opt.v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiPrinter className="inline ml-1" />
                عرض کاغذ
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['58mm', '80mm', 'A4'].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setForm({ ...form, receiptWidth: w })}
                    className={`py-2 rounded-lg text-sm border transition-colors ${form.receiptWidth === w ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}>
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary flex items-center gap-2 w-full justify-center py-3" disabled={saving}>
          <FiSave className="w-4 h-4" />
          {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
        </button>
      </form>
    </div>
  )
}
