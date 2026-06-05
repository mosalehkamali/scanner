'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { FiUser, FiCheck, FiTrash2, FiSearch, FiSlash, FiUsers } from 'react-icons/fi'

const statusLabel = {
  pending:  { text: 'در انتظار', cls: 'badge-yellow' },
  active:   { text: 'فعال',      cls: 'badge-green'  },
  expired:  { text: 'منقضی',     cls: 'badge-gray'   },
  rejected: { text: 'رد شده',    cls: 'badge-red'    },
  disabled: { text: 'غیرفعال',   cls: 'badge-red'    },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      setUsers(d.users || [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountStatus: status }),
    })
    if (res.ok) { toast.success('وضعیت بروزرسانی شد'); load() }
    else toast.error('خطا در بروزرسانی')
  }

  const deleteUser = async (id, name) => {
    const result = await Swal.fire({
      title: 'حذف کاربر',
      text: `آیا از حذف ${name} مطمئن هستید؟`,
      icon: 'warning',
      background: '#18181b',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: 'حذف',
      cancelButtonText: 'لغو',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
    })
    if (!result.isConfirmed) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('کاربر حذف شد'); load() }
    else toast.error('خطا در حذف')
  }

  const filtered = users.filter(u =>
    u.firstName.includes(search) || u.lastName.includes(search) || u.username.includes(search)
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold gradient-text">مدیریت کاربران</h1>
          <p className="text-zinc-500 text-sm mt-1">مجموع {users.length} کاربر</p>
        </div>
        <span className="badge-brand font-mono">{users.length} کاربر</span>
      </div>

      {/* Search */}
      <div className="card mb-5">
        <div className="relative">
          <FiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input className="input-field pr-10" placeholder="جستجو بر اساس نام یا نام کاربری..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl bg-zinc-900 border border-white/10 p-5 flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-zinc-800" />
              <div className="flex-1 space-y-2 py-1">
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center">
            <FiUsers className="w-7 h-7 text-zinc-500" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-white">کاربری یافت نشد</h3>
          <p className="text-zinc-500 text-sm max-w-xs">جستجوی خود را تغییر دهید</p>
        </div>
      )}

      {/* List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(user => {
            const s = statusLabel[user.accountStatus] || statusLabel.pending
            return (
              <div key={user._id} className="card hover:shadow-[0_8px_30px_rgba(162,28,175,0.12)] flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar + info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-brand-300 w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-zinc-500">@{user.username}</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={s.cls}>{s.text}</span>
                  {user.subscriptionPlan && <span className="badge-gray">{user.subscriptionPlan.title}</span>}
                  {user.subscriptionEnd && (
                    <span className="text-xs text-zinc-500 font-mono">
                      تا {new Date(user.subscriptionEnd).toLocaleDateString('fa-IR')}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {user.accountStatus !== 'active' && (
                    <button onClick={() => updateStatus(user._id, 'active')}
                      className="btn-success text-xs px-3 py-1.5 flex items-center gap-1">
                      <FiCheck className="w-3 h-3" />
                      فعال‌سازی
                    </button>
                  )}
                  {user.accountStatus === 'active' && (
                    <button onClick={() => updateStatus(user._id, 'disabled')}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                      <FiSlash className="w-3 h-3" />
                      غیرفعال
                    </button>
                  )}
                  <button onClick={() => deleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                    className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1">
                    <FiTrash2 className="w-3 h-3" />
                    حذف
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
