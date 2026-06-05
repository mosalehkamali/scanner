'use client'

import { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { useReactToPrint } from 'react-to-print'
import {
  FiSearch, FiFilter, FiTrash2, FiPrinter, FiEye,
  FiFileText, FiX, FiUser, FiPhone
} from 'react-icons/fi'

const statusLabel = {
  open:      { text: 'باز',    cls: 'badge-yellow' },
  completed: { text: 'تکمیل', cls: 'badge-green'  },
  cancelled: { text: 'لغو',   cls: 'badge-red'    },
}

function InvoicePrint({ invoice, settings }) {
  const fontSizeMap = { small: '11px', medium: '13px', large: '15px' }
  const fontSize = fontSizeMap[settings?.invoiceFontSize || 'medium']
  return (
    <div style={{ fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl', fontSize, padding: '10mm', maxWidth: settings?.receiptWidth === 'A4' ? '210mm' : settings?.receiptWidth || '80mm' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
        {invoice.storeInfo?.name && <div style={{ fontSize: '1.3em', fontWeight: 'bold' }}>{invoice.storeInfo.name}</div>}
        {invoice.storeInfo?.phone && <div>{invoice.storeInfo.phone}</div>}
        {invoice.storeInfo?.address && <div style={{ fontSize: '0.85em' }}>{invoice.storeInfo.address}</div>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span>فاکتور #{invoice.invoiceNumber}</span>
        <span>{new Date(invoice.createdAt).toLocaleDateString('fa-IR')}</span>
      </div>
      {(invoice.customer?.firstName || invoice.customer?.lastName || invoice.customer?.phone) && (
        <div style={{ background: '#f5f5f5', padding: '4px 6px', borderRadius: '4px', marginBottom: '6px', fontSize: '0.9em' }}>
          {invoice.customer.firstName} {invoice.customer.lastName}
          {invoice.customer.phone && ` — ${invoice.customer.phone}`}
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ textAlign: 'right', padding: '3px 0' }}>کالا</th>
            <th style={{ textAlign: 'center', padding: '3px 0' }}>تعداد</th>
            <th style={{ textAlign: 'left', padding: '3px 0' }}>مبلغ</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px dotted #eee' }}>
              <td style={{ padding: '3px 0' }}>{item.name}</td>
              <td style={{ textAlign: 'center', padding: '3px 0' }}>{item.quantity}</td>
              <td style={{ textAlign: 'left', padding: '3px 0' }}>{item.total?.toLocaleString('fa-IR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ borderTop: '2px solid #000', paddingTop: '6px' }}>
        {invoice.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>تخفیف:</span><span>{invoice.discount?.toLocaleString('fa-IR')}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1em' }}>
          <span>مجموع:</span><span>{invoice.total?.toLocaleString('fa-IR')} تومان</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8em', color: '#666' }}>با تشکر از خرید شما</div>
    </div>
  )
}

function InvoiceDetail({ invoice, settings, onClose }) {
  const printRef = useRef()
  const handlePrint = useReactToPrint({ content: () => printRef.current })

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="font-heading font-bold text-white">فاکتور #{invoice.invoiceNumber}</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn-secondary text-xs flex items-center gap-1.5">
              <FiPrinter className="w-3.5 h-3.5" />
              چاپ
            </button>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white" aria-label="بستن">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <span className="text-xs text-zinc-500 font-mono">{new Date(invoice.createdAt).toLocaleString('fa-IR')}</span>

          {(invoice.customer?.firstName || invoice.customer?.phone) && (
            <div className="bg-zinc-800/60 border border-white/10 rounded-xl p-3 my-4 text-sm space-y-1.5">
              {(invoice.customer.firstName || invoice.customer.lastName) && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <FiUser className="w-3.5 h-3.5 text-zinc-500" />
                  {invoice.customer.firstName} {invoice.customer.lastName}
                </div>
              )}
              {invoice.customer.phone && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <FiPhone className="w-3.5 h-3.5 text-zinc-500" />
                  {invoice.customer.phone}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1 mb-4 mt-4">
            {invoice.items?.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                <div>
                  <span className="font-medium text-white">{item.name}</span>
                  <span className="text-zinc-500 mr-2 text-xs">×{item.quantity}</span>
                </div>
                <span className="font-medium text-zinc-300 font-mono">{item.total?.toLocaleString('fa-IR')}</span>
              </div>
            ))}
          </div>

          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm text-zinc-400 mb-2">
              <span>تخفیف:</span>
              <span className="font-mono">{invoice.discount?.toLocaleString('fa-IR')} تومان</span>
            </div>
          )}
          <div className="flex justify-between font-heading font-bold text-lg border-t border-white/10 pt-4">
            <span className="text-white">مجموع:</span>
            <span className="text-brand-300 font-mono">{invoice.total?.toLocaleString('fa-IR')} تومان</span>
          </div>
        </div>

        <div className="hidden">
          <div ref={printRef}><InvoicePrint invoice={invoice} settings={settings} /></div>
        </div>
      </div>
    </div>
  )
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [settings, setSettings] = useState(null)

  const load = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    fetch(`/api/invoices?${params}`).then(r => r.json()).then(d => {
      setInvoices(d.invoices || [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [search, statusFilter])
  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setSettings(d.settings))
  }, [])

  const deleteInvoice = async (id) => {
    const result = await Swal.fire({
      title: 'حذف فاکتور',
      text: 'این فاکتور حذف شود؟',
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
    const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('فاکتور حذف شد'); load() }
  }

  const filterOpts = [
    { v: '',          label: 'همه'   },
    { v: 'completed', label: 'تکمیل' },
    { v: 'open',      label: 'باز'   },
    { v: 'cancelled', label: 'لغو'   },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold gradient-text">آرشیو فاکتورها</h1>
          <p className="text-zinc-500 text-sm mt-1">مشاهده و مدیریت فاکتورها</p>
        </div>
        <span className="badge-brand font-mono">{invoices.length} فاکتور</span>
      </div>

      {/* Filters */}
      <div className="card mb-5 space-y-4">
        <div className="relative">
          <FiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input className="input-field pr-10" placeholder="جستجو بر اساس نام مشتری یا شماره فاکتور..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter className="text-zinc-500 w-4 h-4" />
          {filterOpts.map(opt => (
            <button key={opt.v} onClick={() => setStatusFilter(opt.v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                statusFilter === opt.v
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
        <div className="space-y-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl bg-zinc-900 border border-white/10 p-4 animate-pulse flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-3 w-60" />
              </div>
              <div className="skeleton h-6 w-16 my-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && invoices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center">
            <FiFileText className="w-7 h-7 text-zinc-500" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-white">فاکتوری یافت نشد</h3>
          <p className="text-zinc-500 text-sm max-w-xs">فیلتر یا جستجوی خود را تغییر دهید</p>
        </div>
      )}

      {/* List */}
      {!loading && invoices.length > 0 && (
        <div className="space-y-2">
          {invoices.map(inv => {
            const s = statusLabel[inv.status] || statusLabel.open
            return (
              <div key={inv._id} className="card flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(162,28,175,0.1)]">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white font-mono text-sm">#{inv.invoiceNumber}</span>
                    <span className={s.cls}>{s.text}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 flex gap-3 flex-wrap">
                    <span>{new Date(inv.createdAt).toLocaleDateString('fa-IR')}</span>
                    {(inv.customer?.firstName || inv.customer?.lastName) && (
                      <span>{inv.customer.firstName} {inv.customer.lastName}</span>
                    )}
                    <span>{inv.items?.length || 0} آیتم</span>
                  </div>
                </div>
                <div className="text-left flex-shrink-0">
                  <div className="font-heading font-bold text-white font-mono">{inv.total?.toLocaleString('fa-IR')}</div>
                  <div className="text-xs text-zinc-500">تومان</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setSelected(inv)}
                    className="p-2 rounded-xl hover:bg-brand-500/10 text-zinc-500 hover:text-brand-300 transition-colors" aria-label="مشاهده">
                    <FiEye className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteInvoice(inv._id)}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors" aria-label="حذف">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <InvoiceDetail invoice={selected} settings={settings} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
