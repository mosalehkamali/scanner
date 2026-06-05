'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiClock, FiLogOut } from 'react-icons/fi'

export default function PendingPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return }
      if (d.user.role === 'admin') { router.push('/admin'); return }
      if (d.user.accountStatus === 'active') { router.push('/dashboard'); return }
      setUser(d.user)
    })
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const statusMessages = {
    pending: { title: 'حساب شما در انتظار تأیید است', desc: 'پس از بررسی رسید پرداخت توسط مدیر، حساب شما فعال خواهد شد.', icon: '⏳' },
    rejected: { title: 'پرداخت شما رد شد', desc: 'لطفاً برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.', icon: '❌' },
    disabled: { title: 'حساب شما غیرفعال شده', desc: 'لطفاً با مدیر سیستم تماس بگیرید.', icon: '🚫' },
    expired: { title: 'اشتراک شما منقضی شده', desc: 'برای تمدید اشتراک با مدیر تماس بگیرید.', icon: '📅' },
  }

  const msg = user ? statusMessages[user.accountStatus] || statusMessages.pending : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        {msg && (
          <>
            <div className="text-5xl mb-4">{msg.icon}</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">{msg.title}</h1>
            <p className="text-gray-500 text-sm mb-6">{msg.desc}</p>
          </>
        )}
        {!user && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}
        <button onClick={logout} className="btn-secondary flex items-center gap-2 mx-auto">
          <FiLogOut className="w-4 h-4" />
          خروج
        </button>
      </div>
    </div>
  )
}
