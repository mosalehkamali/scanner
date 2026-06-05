'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiLogOut, FiClock, FiAlertCircle, FiSlash, FiCalendar } from 'react-icons/fi'

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
    pending:  { title: 'حساب شما در انتظار تأیید است', desc: 'پس از بررسی رسید پرداخت توسط مدیر، حساب شما فعال خواهد شد.', icon: FiClock,        color: 'text-hot-400',   bg: 'bg-hot-400/10 border-hot-400/20' },
    rejected: { title: 'پرداخت شما رد شد',             desc: 'لطفاً برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.',             icon: FiAlertCircle,    color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20' },
    disabled: { title: 'حساب شما غیرفعال شده',          desc: 'لطفاً با مدیر سیستم تماس بگیرید.',                               icon: FiSlash,          color: 'text-zinc-400',  bg: 'bg-zinc-700/30 border-zinc-700/40' },
    expired:  { title: 'اشتراک شما منقضی شده',         desc: 'برای تمدید اشتراک با مدیر تماس بگیرید.',                         icon: FiCalendar,       color: 'text-neon-400',  bg: 'bg-neon-400/10 border-neon-400/20' },
  }

  const msg = user ? statusMessages[user.accountStatus] || statusMessages.pending : null

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-neon-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-up">
        <div className="card p-10 text-center">
          {!user && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-zinc-500 text-sm">در حال بارگذاری...</span>
            </div>
          )}

          {msg && (
            <>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border mb-6 mx-auto ${msg.bg}`}>
                <msg.icon className={`w-7 h-7 ${msg.color}`} />
              </div>
              <h1 className="font-heading text-2xl font-bold text-white mb-3">{msg.title}</h1>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">{msg.desc}</p>
            </>
          )}

          <button onClick={logout} className="btn-secondary flex items-center gap-2 mx-auto">
            <FiLogOut className="w-4 h-4" />
            خروج از حساب
          </button>
        </div>
      </div>
    </div>
  )
}
