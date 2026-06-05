'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiPackage, FiShoppingCart, FiFileText, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi'

export default function DashboardPage() {
  const [products, setProducts] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/invoices?status=completed').then(r => r.json()),
    ]).then(([p, i]) => {
      setProducts(p.products || [])
      setInvoices(i.invoices || [])
      setLoading(false)
    })
  }, [])

  const lowStock = products.filter(p => p.stock <= p.lowStockLimit)
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)

  const stats = [
    { label: 'تعداد محصولات', value: products.length, icon: FiPackage, color: 'blue', href: '/dashboard/products' },
    { label: 'فاکتورهای امروز', value: invoices.filter(i => new Date(i.createdAt).toDateString() === new Date().toDateString()).length, icon: FiShoppingCart, color: 'green', href: '/dashboard/pos' },
    { label: 'کل فاکتورها', value: invoices.length, icon: FiFileText, color: 'purple', href: '/dashboard/invoices' },
    { label: 'موجودی کم', value: lowStock.length, icon: FiAlertTriangle, color: 'red', href: '/dashboard/products' },
  ]

  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">داشبورد</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(s => (
              <Link key={s.label} href={s.href} className="card hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[s.color]}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </Link>
            ))}
          </div>

          <div className="card mb-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-gray-700">درآمد کل</h2>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {totalRevenue.toLocaleString('fa-IR')} <span className="text-base font-normal text-gray-500">تومان</span>
            </div>
          </div>

          {lowStock.length > 0 && (
            <div className="card border-l-4 border-red-400">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FiAlertTriangle className="text-red-500" />
                  محصولات با موجودی کم
                </h2>
                <Link href="/dashboard/products" className="text-sm text-blue-600 flex items-center gap-1">
                  مشاهده همه <FiArrowLeft className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {lowStock.slice(0, 5).map(p => (
                  <div key={p._id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{p.name}</span>
                    <span className="badge-red">{p.stock} عدد</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Link href="/dashboard/pos"
              className="card bg-blue-600 text-white hover:bg-blue-700 transition-colors text-center py-6">
              <FiShoppingCart className="w-8 h-8 mx-auto mb-2" />
              <div className="font-bold text-lg">شروع فروش</div>
              <div className="text-blue-200 text-sm mt-1">صندوق فروش</div>
            </Link>
            <Link href="/dashboard/products"
              className="card bg-white hover:shadow-md transition-shadow text-center py-6 border-2 border-blue-200">
              <FiPackage className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="font-bold text-lg text-gray-800">مدیریت محصولات</div>
              <div className="text-gray-400 text-sm mt-1">افزودن و ویرایش</div>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
