'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiPackage, FiShoppingCart, FiFileText, FiAlertTriangle, FiArrowLeft, FiTrendingUp } from 'react-icons/fi'

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
  const todayInvoices = invoices.filter(i => new Date(i.createdAt).toDateString() === new Date().toDateString())

  const stats = [
    { label: 'تعداد محصولات',  value: products.length,        icon: FiPackage,       href: '/dashboard/products', color: 'text-brand-300',  border: 'border-brand-500/30',  bg: 'bg-brand-500/10' },
    { label: 'فاکتورهای امروز', value: todayInvoices.length,   icon: FiShoppingCart,  href: '/dashboard/pos',      color: 'text-neon-400',   border: 'border-neon-400/30',   bg: 'bg-neon-400/10'  },
    { label: 'کل فاکتورها',     value: invoices.length,        icon: FiFileText,      href: '/dashboard/invoices', color: 'text-acid-400',   border: 'border-acid-400/30',   bg: 'bg-acid-400/10'  },
    { label: 'موجودی کم',       value: lowStock.length,        icon: FiAlertTriangle, href: '/dashboard/products', color: 'text-red-400',    border: 'border-red-500/30',    bg: 'bg-red-500/10'   },
  ]

  if (loading) {
    return (
      <div>
        <div className="skeleton h-8 w-40 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl bg-zinc-900 border border-white/10 p-5 animate-pulse space-y-3">
              <div className="skeleton h-9 w-9 rounded-xl" />
              <div className="skeleton h-7 w-14" />
              <div className="skeleton h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold gradient-text">داشبورد</h1>
        <p className="text-zinc-500 text-sm mt-1">خلاصه عملکرد فروشگاه</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <Link key={s.label} href={s.href}
            className={`card group hover:shadow-[0_8px_30px_rgba(162,28,175,0.15)] hover:scale-[1.02]`}>
            <div className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mb-4 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div className="font-heading text-3xl font-extrabold text-white">{s.value}</div>
            <div className="text-xs text-zinc-500 mt-1 font-medium">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Revenue card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-brand-900/80 to-brand-800/40 border border-brand-700/50 p-6 mb-6 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent" />
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-2">
          <FiTrendingUp className="text-acid-400 w-5 h-5" />
          <span className="text-zinc-400 text-sm font-medium">درآمد کل</span>
        </div>
        <div className="font-heading text-4xl font-extrabold text-white">
          {totalRevenue.toLocaleString('fa-IR')}
          <span className="text-base font-normal text-zinc-400 mr-2">تومان</span>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="card border-red-500/30 bg-red-500/5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-white flex items-center gap-2">
              <FiAlertTriangle className="text-red-400 w-4 h-4" />
              محصولات با موجودی کم
            </h2>
            <Link href="/dashboard/products"
              className="text-xs text-neon-400 hover:text-neon-300 flex items-center gap-1 transition-colors">
              مشاهده همه <FiArrowLeft className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {lowStock.slice(0, 5).map(p => (
              <div key={p._id} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                <span className="text-zinc-300">{p.name}</span>
                <span className="badge-red">{p.stock} عدد</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/pos"
          className="relative rounded-2xl p-6 bg-gradient-to-br from-brand-500 to-neon-500 text-center overflow-hidden
            hover:shadow-[0_0_40px_rgba(162,28,175,0.5)] hover:scale-[1.02] transition-all duration-300 group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <FiShoppingCart className="w-8 h-8 mx-auto mb-2 text-white" />
          <div className="font-heading font-bold text-lg text-white">شروع فروش</div>
          <div className="text-white/70 text-sm mt-1">صندوق فروش</div>
        </Link>

        <Link href="/dashboard/products"
          className="card text-center py-6 hover:shadow-[0_8px_30px_rgba(34,211,238,0.15)] hover:border-neon-400/30 hover:scale-[1.02] transition-all duration-300">
          <FiPackage className="w-8 h-8 mx-auto mb-2 text-neon-400" />
          <div className="font-heading font-bold text-lg text-white">مدیریت محصولات</div>
          <div className="text-zinc-500 text-sm mt-1">افزودن و ویرایش</div>
        </Link>
      </div>
    </div>
  )
}
