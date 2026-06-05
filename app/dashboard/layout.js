'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import {
  FiHome, FiPackage, FiTag, FiShoppingCart, FiFileText,
  FiSettings, FiLogOut, FiMenu, FiX, FiAlertTriangle, FiZap
} from 'react-icons/fi'

const navItems = [
  { href: '/dashboard',            label: 'داشبورد',      icon: FiHome,         exact: true },
  { href: '/dashboard/pos',        label: 'صندوق فروش',   icon: FiShoppingCart },
  { href: '/dashboard/products',   label: 'محصولات',       icon: FiPackage },
  { href: '/dashboard/categories', label: 'دسته‌بندی‌ها', icon: FiTag },
  { href: '/dashboard/invoices',   label: 'فاکتورها',      icon: FiFileText },
  { href: '/dashboard/settings',   label: 'تنظیمات',       icon: FiSettings },
]

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return }
      if (d.user.role === 'admin') { router.push('/admin'); return }
      if (d.user.accountStatus !== 'active') { router.push('/pending'); return }
      setUser(d.user)
    }).catch(() => router.push('/login'))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('خروج موفق')
    router.push('/login')
  }

  const isActive = (item) => item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const daysLeft = user?.subscriptionEnd
    ? Math.ceil((new Date(user.subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-neon-500 flex items-center justify-center shadow-[0_0_30px_rgba(162,28,175,0.5)]">
            <FiZap className="w-5 h-5 text-white" />
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-64 z-30 transform transition-transform duration-300 flex flex-col
        border-l border-white/10 bg-zinc-900/95 backdrop-blur-xl
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static`}>

        {/* Logo + user */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-neon-500 flex items-center justify-center shadow-[0_0_15px_rgba(162,28,175,0.4)]">
              <FiZap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-sm font-bold text-white">سیستم فروشگاهی</h1>
              <p className="text-xs text-zinc-500">{user.firstName} {user.lastName}</p>
            </div>
          </div>

          {/* Subscription warning */}
          {daysLeft !== null && daysLeft <= 10 && (
            <div className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-xl border ${
              daysLeft <= 3
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-hot-400/10 border-hot-400/20 text-hot-400'
            }`}>
              <FiAlertTriangle className="w-3 h-3 flex-shrink-0" />
              {daysLeft} روز تا انقضای اشتراک
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1 flex-1">
          {navItems.map(item => {
            const active = isActive(item)
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 shadow-[0_0_15px_rgba(162,28,175,0.12)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}>
                <item.icon className={`w-4 h-4 ${active ? 'text-brand-400' : ''}`} />
                {item.label}
                {active && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full text-sm font-medium transition-all duration-200">
            <FiLogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden border-b border-white/10 bg-zinc-900/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors" aria-label="منو">
            {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-neon-500 flex items-center justify-center">
              <FiZap className="w-3 h-3 text-white" />
            </div>
            <span className="font-heading font-bold text-white text-sm">سیستم فروشگاهی</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-7 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
