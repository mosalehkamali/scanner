'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { FiCheck, FiX, FiEye, FiClock, FiFilter, FiCreditCard } from 'react-icons/fi'

const statusLabel = {
  pending:  { text: 'در انتظار بررسی', cls: 'badge-yellow' },
  approved: { text: 'تأیید شده',        cls: 'badge-green'  },
  rejected: { text: 'رد شده',           cls: 'badge-red'    },
}

export default function AdminPaymentsPage() {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [previewImg, setPreviewImg] = useState(null)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/payments').then(r => r.json()).then(d => {
      setReceipts(d.receipts || [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const handleAction = async (id, action) => {
    const { value: adminNote } = await Swal.fire({
      title: action === 'approve' ? 'تأیید پرداخت' : 'رد پرداخت',
      input: 'text',
      inputLabel: 'یادداشت (اختیاری)',
      background: '#18181b',
      color: '#fff',
      showCancelButton: true,
      confirmButtonText: action === 'approve' ? 'تأیید' : 'رد',
      cancelButtonText: 'لغو',
      confirmButtonColor: action === 'approve' ? '#84cc16' : '#dc2626',
      reverseButtons: true,
    })
    if (adminNote === undefined) return
    const res = await fetch(`/api/admin/payments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, adminNote: adminNote || '' }),
    })
    const data = await res.json()
    if (res.ok) { toast.success(data.message); load() }
    else toast.error(data.error || 'خطا')
  }

  const filtered = receipts.filter(r => filter === 'all' ? true : r.status === filter)

  const filterOpts = [
    { v: 'pending',  label: 'در انتظار' },
    { v: 'approved', label: 'تأیید شده' },
    { v: 'rejected', label: 'رد شده'    },
    { v: 'all',      label: 'همه'       },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold gradient-text">رسیدهای پرداخت</h1>
        <p className="text-zinc-500 text-sm mt-1">بررسی و تأیید پرداخت‌های کاربران</p>
      </div>

      {/* Filters */}
      <div className="card mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter className="text-zinc-500 w-4 h-4" />
          {filterOpts.map(opt => (
            <button key={opt.v} onClick={() => setFilter(opt.v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === opt.v
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-white'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl bg-zinc-900 border border-white/10 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-40" />
                  <div className="skeleton h-3 w-60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center">
            <FiCreditCard className="w-7 h-7 text-zinc-500" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-white">رسیدی یافت نشد</h3>
          <p className="text-zinc-500 text-sm">در این دسته‌بندی رسید پرداختی وجود ندارد</p>
        </div>
      )}

      {/* List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(r => {
            const s = statusLabel[r.status] || statusLabel.pending
            return (
              <div key={r._id} className="card hover:shadow-[0_8px_30px_rgba(162,28,175,0.12)]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {r.userId?.firstName} {r.userId?.lastName}
                      <span className="text-zinc-500 text-sm font-normal mr-2">@{r.userId?.username}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={s.cls}>{s.text}</span>
                      {r.planId && (
                        <span className="badge-neon">{r.planId.title} — {r.planId.price?.toLocaleString('fa-IR')} تومان</span>
                      )}
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {new Date(r.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    {r.adminNote && (
                      <p className="text-xs text-zinc-500 mt-2 bg-zinc-800/50 rounded-lg px-3 py-1.5">یادداشت: {r.adminNote}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {r.receiptImage?.data && (
                      <button onClick={() => setPreviewImg(`/api/receipts/${r._id}/image`)}
                        className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                        <FiEye className="w-3 h-3" />
                        رسید
                      </button>
                    )}
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(r._id, 'approve')}
                          className="btn-success text-xs px-3 py-1.5 flex items-center gap-1">
                          <FiCheck className="w-3 h-3" />
                          تأیید
                        </button>
                        <button onClick={() => handleAction(r._id, 'reject')}
                          className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1">
                          <FiX className="w-3 h-3" />
                          رد
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Image preview modal */}
      {previewImg && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImg(null)}>
          <div className="relative max-w-lg w-full animate-fade-up" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewImg(null)}
              className="absolute -top-12 left-0 text-zinc-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10"
              aria-label="بستن">
              <FiX className="w-6 h-6" />
            </button>
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img src={previewImg} alt="رسید پرداخت" className="w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
