'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { FiCheck, FiX, FiEye, FiClock, FiFilter } from 'react-icons/fi'

const statusLabel = {
  pending: { text: 'در انتظار بررسی', cls: 'badge-yellow' },
  approved: { text: 'تأیید شده', cls: 'badge-green' },
  rejected: { text: 'رد شده', cls: 'badge-red' },
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
      showCancelButton: true,
      confirmButtonText: action === 'approve' ? 'تأیید' : 'رد',
      cancelButtonText: 'لغو',
      confirmButtonColor: action === 'approve' ? '#16a34a' : '#dc2626',
      reverseButtons: true,
    })
    if (adminNote === undefined) return

    const res = await fetch(`/api/admin/payments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, adminNote: adminNote || '' }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(data.message)
      load()
    } else {
      toast.error(data.error || 'خطا')
    }
  }

  const filtered = receipts.filter(r => filter === 'all' ? true : r.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">رسیدهای پرداخت</h1>
      </div>

      <div className="card mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter className="text-gray-400" />
          {[
            { v: 'pending', label: 'در انتظار' },
            { v: 'approved', label: 'تأیید شده' },
            { v: 'rejected', label: 'رد شده' },
            { v: 'all', label: 'همه' },
          ].map(opt => (
            <button
              key={opt.v}
              onClick={() => setFilter(opt.v)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${filter === opt.v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">رسیدی یافت نشد</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const s = statusLabel[r.status] || statusLabel.pending
            return (
              <div key={r._id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {r.userId?.firstName} {r.userId?.lastName}
                      <span className="text-gray-400 text-sm mr-2">@{r.userId?.username}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1.5 text-sm">
                      <span className={s.cls}>{s.text}</span>
                      {r.planId && (
                        <span className="badge-gray">
                          {r.planId.title} — {r.planId.price?.toLocaleString('fa-IR')} تومان
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        <FiClock className="inline ml-1" />
                        {new Date(r.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    {r.adminNote && (
                      <p className="text-xs text-gray-500 mt-1">یادداشت: {r.adminNote}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {r.receiptImage && (
                      <button onClick={() => setPreviewImg(r.receiptImage)}
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

      {previewImg && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImg(null)}>
          <div className="relative max-w-lg w-full">
            <button onClick={() => setPreviewImg(null)}
              className="absolute -top-10 left-0 text-white text-2xl p-2">✕</button>
            <img src={previewImg} alt="رسید" className="w-full rounded-lg" onClick={e => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  )
}
