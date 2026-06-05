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
  open: { text: 'باز', cls: 'badge-yellow' },
  completed: { text: 'تکمیل', cls: 'badge-green' },
  cancelled: { text: 'لغو', cls: 'badge-red' },
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
            <span>تخفیف:</span>
            <span>{invoice.discount?.toLocaleString('fa-IR')}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1em' }}>
          <span>مجموع:</span>
          <span>{invoice.total?.toLocaleString('fa-IR')} تومان</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8em', color: '#666' }}>
        با تشکر از خرید شما
      </div>
    </div>
  )
}

function InvoiceDetail({ invoice, settings, onClose }) {
  const printRef = useRef()
  const handlePrint = useReactToPrint({ content: () => printRef.current })

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">فاکتور #{invoice.invoiceNumber}</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn-secondary text-sm flex items-center gap-1">
              <FiPrinter className="w-4 h-4" />
              چاپ
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs text-gray-400 mb-4">
            {new Date(invoice.createdAt).toLocaleString('fa-IR')}
          </div>

          {(invoice.customer?.firstName || invoice.customer?.phone) && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              {(invoice.customer.firstName || invoice.customer.lastName) && (
                <div className="flex items-center gap-2 text-gray-700">
                  <FiUser className="w-4 h-4 text-gray-400" />
                  {invoice.customer.firstName} {invoice.customer.lastName}
                </div>
              )}
              {invoice.customer.phone && (
                <div className="flex items-center gap-2 text-gray-700 mt-1">
                  <FiPhone className="w-4 h-4 text-gray-400" />
                  {invoice.customer.phone}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1 mb-4">
            {invoice.items?.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
                <div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-gray-400 mr-2 text-xs">×{item.quantity}</span>
                </div>
                <span className="font-medium text-gray-700">{item.total?.toLocaleString('fa-IR')}</span>
              </div>
            ))}
          </div>

          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>تخفیف:</span>
              <span>{invoice.discount?.toLocaleString('fa-IR')} تومان</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-3">
            <span>مجموع:</span>
            <span className="text-blue-700">{invoice.total?.toLocaleString('fa-IR')} تومان</span>
          </div>
        </div>

        <div className="hidden">
          <div ref={printRef}>
            <InvoicePrint invoice={invoice} settings={settings} />
          </div>
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
      showCancelButton: true,
      confirmButtonText: 'حذف',
      cancelButtonText: 'لغو',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
    })
    if (!result.isConfirmed) return
    const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('فاکتور حذف شد')
      load()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">آرشیو فاکتورها</h1>
        <span className="text-sm text-gray-500">{invoices.length} فاکتور</span>
      </div>

      <div className="card mb-4 space-y-3">
        <div className="relative">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pr-10" placeholder="جستجو بر اساس نام مشتری یا شماره فاکتور..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter className="text-gray-400 w-4 h-4" />
          {[
            { v: '', label: 'همه' },
            { v: 'completed', label: 'تکمیل' },
            { v: 'open', label: 'باز' },
            { v: 'cancelled', label: 'لغو' },
          ].map(opt => (
            <button key={opt.v} onClick={() => setStatusFilter(opt.v)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${statusFilter === opt.v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>
      ) : invoices.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <FiFileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          فاکتوری یافت نشد
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map(inv => {
            const s = statusLabel[inv.status] || statusLabel.open
            return (
              <div key={inv._id} className="card flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">فاکتور #{inv.invoiceNumber}</span>
                    <span className={s.cls}>{s.text}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 flex gap-3">
                    <span>{new Date(inv.createdAt).toLocaleDateString('fa-IR')}</span>
                    {(inv.customer?.firstName || inv.customer?.lastName) && (
                      <span>{inv.customer.firstName} {inv.customer.lastName}</span>
                    )}
                    <span>{inv.items?.length || 0} آیتم</span>
                  </div>
                </div>
                <div className="text-left flex-shrink-0">
                  <div className="font-bold text-gray-800">{inv.total?.toLocaleString('fa-IR')}</div>
                  <div className="text-xs text-gray-400">تومان</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setSelected(inv)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                    <FiEye className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteInvoice(inv._id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
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
