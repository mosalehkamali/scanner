'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { FiUser, FiCheck, FiX, FiTrash2, FiSearch, FiSlash } from 'react-icons/fi'

const statusLabel = {
  pending: { text: 'در انتظار', cls: 'badge-yellow' },
  active: { text: 'فعال', cls: 'badge-green' },
  expired: { text: 'منقضی', cls: 'badge-gray' },
  rejected: { text: 'رد شده', cls: 'badge-red' },
  disabled: { text: 'غیرفعال', cls: 'badge-red' },
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
    if (res.ok) {
      toast.success('وضعیت بروزرسانی شد')
      load()
    } else {
      toast.error('خطا در بروزرسانی')
    }
  }

  const deleteUser = async (id, name) => {
    const result = await Swal.fire({
      title: 'حذف کاربر',
      text: `آیا از حذف ${name} مطمئن هستید؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'حذف',
      cancelButtonText: 'لغو',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
    })
    if (!result.isConfirmed) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('کاربر حذف شد')
      load()
    } else {
      toast.error('خطا در حذف')
    }
  }

  const filtered = users.filter(u =>
    u.firstName.includes(search) ||
    u.lastName.includes(search) ||
    u.username.includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت کاربران</h1>
        <span className="text-sm text-gray-500">{users.length} کاربر</span>
      </div>

      <div className="card mb-4">
        <div className="relative">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input-field pr-10"
            placeholder="جستجو بر اساس نام یا نام کاربری..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">کاربری یافت نشد</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(user => {
            const s = statusLabel[user.accountStatus] || statusLabel.pending
            return (
              <div key={user._id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className={s.cls}>{s.text}</span>
                  {user.subscriptionPlan && (
                    <span className="badge-gray">{user.subscriptionPlan.title}</span>
                  )}
                  {user.subscriptionEnd && (
                    <span className="text-xs text-gray-400">
                      تا {new Date(user.subscriptionEnd).toLocaleDateString('fa-IR')}
                    </span>
                  )}
                </div>

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
