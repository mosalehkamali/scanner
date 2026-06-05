'use client'

import { useEffect, useState } from 'react'
import { FiUsers, FiCreditCard, FiFileText, FiUserCheck } from 'react-icons/fi'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d))
  }, [])

  const cards = [
    { label: 'کل کاربران', value: stats?.totalUsers ?? '...', icon: FiUsers, color: 'blue' },
    { label: 'کاربران فعال', value: stats?.activeUsers ?? '...', icon: FiUserCheck, color: 'green' },
    { label: 'پرداخت‌های در انتظار', value: stats?.pendingPayments ?? '...', icon: FiCreditCard, color: 'yellow' },
    { label: 'فاکتورهای صادر شده', value: stats?.totalInvoices ?? '...', icon: FiFileText, color: 'purple' },
  ]

  const colorMap = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">داشبورد مدیریت</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="card">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[card.color]}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
