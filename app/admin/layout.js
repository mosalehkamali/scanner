'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import {
  FiUsers, FiCreditCard, FiSettings, FiPackage,
  FiLogOut, FiMenu, FiX, FiBarChart2
} from 'react-icons/fi'

const navItems = [
  { href: '/admin', label: 'داشبورد', icon: FiBarChart2, exact: true },
  { href: '/admin/users', label: 'کاربران', icon: FiUsers },
  { href: '/admin/payments', label: 'رسیدهای پرداخت', icon: FiCreditCard },
  { href: '/admin/plans', label: 'پلان‌های اشتراک', icon: FiPackage },
  { href: '/admin/settings', label: 'تنظیمات سیستم', icon: FiSettings },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'admin') {
        router.push('/login')
      } else {
        setUser(d.user)
      }
    }).catch(() => router.push('/login'))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('خروج موفق')
    router.push('/login')
  }

  const isActive = (item) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-30 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static lg:shadow-none lg:border-l border-gray-200`}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-800">پنل مدیریت</h1>
          <p className="text-xs text-gray-500 mt-0.5">{user.firstName} {user.lastName}</p>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                ${isActive(item) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 right-0 left-0 px-3">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 w-full text-sm font-medium transition-colors">
            <FiLogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <FiMenu className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-gray-800">پنل مدیریت</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
