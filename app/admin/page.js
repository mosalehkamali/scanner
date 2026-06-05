'use client'

import { useEffect, useState } from 'react'
import { FiUsers, FiCreditCard, FiFileText, FiUserCheck } from 'react-icons/fi'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d))
  }, [])

  const cards = [
    { label: 'کل کاربران',            value: stats?.totalUsers       ?? null, icon: FiUsers,     gradient: 'from-brand-900/80 to-brand-800/40', border: 'border-brand-700/50',  icon_color: 'text-brand-300',  glow: 'rgba(162,28,175,0.15)' },
    { label: 'کاربران فعال',          value: stats?.activeUsers      ?? null, icon: FiUserCheck, gradient: 'from-zinc-900 to-zinc-800/60',       border: 'border-acid-400/30',   icon_color: 'text-acid-400',   glow: 'rgba(163,230,53,0.12)' },
    { label: 'پرداخت‌های در انتظار', value: stats?.pendingPayments  ?? null, icon: FiCreditCard,gradient: 'from-zinc-900 to-zinc-800/60',       border: 'border-hot-400/30',    icon_color: 'text-hot-400',    glow: 'rgba(251,146,60,0.12)' },
    { label: 'فاکتورهای صادر شده',    value: stats?.totalInvoices    ?? null, icon: FiFileText,  gradient: 'from-zinc-900 to-zinc-800/60',       border: 'border-neon-400/30',   icon_color: 'text-neon-400',   glow: 'rgba(34,211,238,0.12)' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-widest bg-brand-500/20 text-brand-300 border border-brand-500/30">
          مدیریت
        </span>
        <h1 className="font-heading text-4xl font-extrabold gradient-text mt-3">داشبورد مدیریت</h1>
        <p className="text-zinc-500 text-sm mt-1">وضعیت کلی سیستم</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label}
            className={`relative rounded-2xl p-5 bg-gradient-to-br ${card.gradient} border ${card.border} transition-all duration-300 hover:scale-[1.02]`}
            style={{ boxShadow: `0 4px 30px ${card.glow}` }}>
            {/* Top accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />

            <div className={`w-9 h-9 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-4 ${card.icon_color}`}>
              <card.icon className="w-4 h-4" />
            </div>

            {card.value === null ? (
              <div className="space-y-2">
                <div className="skeleton h-7 w-16" />
                <div className="skeleton h-3 w-24" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-heading font-extrabold text-white">{card.value}</div>
                <div className="text-xs text-zinc-500 mt-1 font-medium">{card.label}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
