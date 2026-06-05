'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { toast } from 'react-toastify'
import { useReactToPrint } from 'react-to-print'
import {
  FiPlus, FiMinus, FiTrash2, FiX, FiCamera, FiSearch,
  FiShoppingCart, FiPrinter, FiCheck, FiUser, FiDollarSign,
  FiEdit2, FiChevronDown
} from 'react-icons/fi'

// ───── Scanner Component ─────
function BarcodeScanner({ onDetect, onClose }) {
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const [status, setStatus] = useState('در حال راه‌اندازی دوربین...')
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let stopped = false
    let controls = null

    const startScanner = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setStatus('دسترسی به دوربین ممکن نیست. لطفاً صفحه را از طریق HTTPS باز کنید.')
          setHasError(true)
          return
        }

        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const reader = new BrowserMultiFormatReader()
        scannerRef.current = reader

        const hints = new Map()
        const { DecodeHintType, BarcodeFormat } = await import('@zxing/library')
        hints.set(DecodeHintType.TRY_HARDER, true)
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
          BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
          BarcodeFormat.QR_CODE, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
        ])

        setStatus('دوربین فعال شد — محصول را جلوی دوربین نگه دارید')

        controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
          videoRef.current,
          (result, err) => {
            if (result && !stopped) {
              navigator.vibrate?.(100)
              onDetect(result.getText())
            }
          }
        )
      } catch (err) {
        if (!stopped) {
          setStatus('خطا در دسترسی به دوربین: ' + (err.message || err))
          setHasError(true)
        }
      }
    }

    startScanner()

    return () => {
      stopped = true
      try { controls?.stop() } catch {}
      try { scannerRef.current?.reset() } catch {}
    }
  }, [onDetect])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/80">
        <span className="text-white font-medium">اسکن بارکد</span>
        <button onClick={onClose} className="text-white p-2">
          <FiX className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        {/* scan frame overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-40 relative">
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
            <div className="absolute top-1/2 -translate-y-1/2 right-0 left-0 h-0.5 bg-green-400/70 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-black/80 text-center">
        <p className={`text-sm ${hasError ? 'text-red-400' : 'text-gray-300'}`}>{status}</p>
      </div>
    </div>
  )
}

// ───── Invoice Print ─────
function InvoicePrint({ invoice, settings }) {
  const fontSizeMap = { small: '11px', medium: '13px', large: '15px' }
  const fontSize = fontSizeMap[settings?.invoiceFontSize || 'medium']

  return (
    <div style={{ fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl', fontSize, padding: '10mm' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '8px' }}>
        {invoice.storeInfo?.name && <div style={{ fontSize: '1.3em', fontWeight: 'bold' }}>{invoice.storeInfo.name}</div>}
        {invoice.storeInfo?.phone && <div>{invoice.storeInfo.phone}</div>}
        {invoice.storeInfo?.address && <div style={{ fontSize: '0.85em' }}>{invoice.storeInfo.address}</div>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span>فاکتور #{invoice.invoiceNumber}</span>
        <span>{new Date().toLocaleDateString('fa-IR')}</span>
      </div>
      {(invoice.customer?.firstName || invoice.customer?.phone) && (
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
              <td style={{ textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ textAlign: 'left' }}>{item.total?.toLocaleString('fa-IR')}</td>
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

// ───── Customer Modal ─────
function CustomerModal({ customer, onChange, onClose }) {
  const [form, setForm] = useState(customer || { firstName: '', lastName: '', phone: '' })
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">اطلاعات مشتری</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
        </div>
        <div className="p-4 space-y-3">
          <input className="input-field" placeholder="نام" value={form.firstName}
            onChange={e => setForm({ ...form, firstName: e.target.value })} />
          <input className="input-field" placeholder="نام خانوادگی" value={form.lastName}
            onChange={e => setForm({ ...form, lastName: e.target.value })} />
          <input className="input-field" placeholder="شماره موبایل" value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })} />
          <button onClick={() => { onChange(form); onClose() }} className="btn-primary w-full">ذخیره</button>
        </div>
      </div>
    </div>
  )
}

// ───── Manual Item Modal ─────
function ManualItemModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', price: '', quantity: '1' })
  const handleAdd = () => {
    if (!form.name || !form.price) return toast.error('نام و قیمت الزامی است')
    onAdd({ name: form.name, price: Number(form.price), quantity: Number(form.quantity) || 1 })
    onClose()
  }
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">افزودن آیتم دستی</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
        </div>
        <div className="p-4 space-y-3">
          <input className="input-field" placeholder="نام آیتم" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
          <input type="number" className="input-field" placeholder="قیمت (تومان)" value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })} min="0" />
          <input type="number" className="input-field" placeholder="تعداد" value={form.quantity}
            onChange={e => setForm({ ...form, quantity: e.target.value })} min="1" />
          <button onClick={handleAdd} className="btn-primary w-full">افزودن به فاکتور</button>
        </div>
      </div>
    </div>
  )
}

// ───── Product Search Modal ─────
function ProductSearchModal({ products, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = products.filter(p =>
    p.name.includes(search) || (p.barcode || '').includes(search)
  )
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">جستجوی محصول</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX /></button>
        </div>
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input-field pr-10" placeholder="نام یا بارکد محصول..."
              value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">محصولی یافت نشد</div>
          ) : filtered.map(p => (
            <button key={p._id} onClick={() => { onSelect(p); onClose() }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50">
              <div className="text-right">
                <div className="font-medium text-gray-800">{p.name}</div>
                <div className="text-xs text-gray-400">{p.barcode} — موجودی: {p.stock}</div>
              </div>
              <div className="font-bold text-blue-700 text-sm">{p.price?.toLocaleString('fa-IR')}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ───── Main POS ─────
export default function POSPage() {
  const [invoices, setInvoices] = useState([{
    id: Date.now(), title: 'فاکتور ۱',
    items: [], customer: { firstName: '', lastName: '', phone: '' },
    discount: 0, notes: '',
  }])
  const [activeId, setActiveId] = useState(null)
  const [products, setProducts] = useState([])
  const [settings, setSettings] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [showCustomer, setShowCustomer] = useState(false)
  const [lastBarcode, setLastBarcode] = useState('')
  const [saving, setSaving] = useState(false)
  const printRef = useRef()
  const [printInvoice, setPrintInvoice] = useState(null)

  useEffect(() => {
    setActiveId(invoices[0].id)
    fetch('/api/products').then(r => r.json()).then(d => setProducts(d.products || []))
    fetch('/api/settings').then(r => r.json()).then(d => setSettings(d.settings))
  }, [])

  const handlePrint = useReactToPrint({ content: () => printRef.current })

  const active = invoices.find(i => i.id === activeId) || invoices[0]

  const updateActive = (updater) => {
    setInvoices(prev => prev.map(inv => inv.id === activeId ? updater(inv) : inv))
  }

  const addNewInvoice = () => {
    const id = Date.now()
    const num = invoices.length + 1
    const inv = {
      id, title: `فاکتور ${toPersianNum(num)}`,
      items: [], customer: { firstName: '', lastName: '', phone: '' },
      discount: 0, notes: '',
    }
    setInvoices(prev => [...prev, inv])
    setActiveId(id)
  }

  const closeInvoice = (id) => {
    if (invoices.length === 1) return toast.error('حداقل یک فاکتور باید باز باشد')
    setInvoices(prev => {
      const remaining = prev.filter(i => i.id !== id)
      if (activeId === id) setActiveId(remaining[remaining.length - 1].id)
      return remaining
    })
  }

  const addProduct = useCallback((product, qty = 1) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== activeId) return inv
      const existing = inv.items.findIndex(it => it.productId === product._id)
      let items
      if (existing >= 0) {
        items = inv.items.map((it, i) => i === existing
          ? { ...it, quantity: it.quantity + qty, total: (it.quantity + qty) * it.price }
          : it
        )
      } else {
        items = [...inv.items, {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: qty,
          total: product.price * qty,
        }]
      }
      return { ...inv, items }
    }))
    toast.success(`${product.name} افزوده شد`, { autoClose: 1000, position: 'bottom-center' })
  }, [activeId])

  const addManualItem = ({ name, price, quantity }) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== activeId) return inv
      return {
        ...inv, items: [...inv.items, {
          productId: null, name, price, quantity, total: price * quantity,
        }]
      }
    }))
    toast.success(`${name} افزوده شد`, { autoClose: 1000, position: 'bottom-center' })
  }

  const updateQty = (idx, delta) => {
    updateActive(inv => {
      const items = inv.items.map((it, i) => {
        if (i !== idx) return it
        const q = Math.max(1, it.quantity + delta)
        return { ...it, quantity: q, total: q * it.price }
      })
      return { ...inv, items }
    })
  }

  const removeItem = (idx) => {
    updateActive(inv => ({ ...inv, items: inv.items.filter((_, i) => i !== idx) }))
  }

  const handleBarcodeDetect = useCallback(async (barcode) => {
    if (barcode === lastBarcode) return
    setLastBarcode(barcode)
    setTimeout(() => setLastBarcode(''), 1500)

    const product = products.find(p => p.barcode === barcode)
    if (product) {
      addProduct(product)
    } else {
      toast.warning(`بارکد ${barcode} در محصولات یافت نشد`, { autoClose: 2000 })
    }
  }, [products, addProduct, lastBarcode])

  const subtotal = active?.items.reduce((s, it) => s + it.total, 0) || 0
  const total = Math.max(0, subtotal - (active?.discount || 0))

  const completeInvoice = async () => {
    if (!active?.items.length) return toast.error('فاکتور خالی است')
    setSaving(true)
    try {
      const body = {
        items: active.items,
        customer: active.customer,
        discount: active.discount || 0,
        subtotal,
        total,
        status: 'completed',
        notes: active.notes || '',
      }
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      const { invoice } = await res.json()
      setPrintInvoice({ ...invoice, storeInfo: settings ? { name: settings.storeName, phone: settings.storePhone, address: settings.storeAddress } : {} })

      setInvoices(prev => prev.map(inv => inv.id === activeId
        ? { ...inv, items: [], discount: 0, customer: { firstName: '', lastName: '', phone: '' } }
        : inv
      ))
      toast.success('فاکتور ثبت شد!')
    } catch {
      toast.error('خطا در ثبت فاکتور')
    }
    setSaving(false)
  }

  useEffect(() => {
    if (printInvoice) {
      const t = setTimeout(handlePrint, 300)
      return () => clearTimeout(t)
    }
  }, [printInvoice])

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 130px)' }}>
      {/* Invoice Tabs */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {invoices.map(inv => (
          <div key={inv.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors
              ${inv.id === activeId ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400'}`}
            onClick={() => setActiveId(inv.id)}>
            <FiShoppingCart className="w-3.5 h-3.5" />
            <span>{inv.title}</span>
            {inv.items.length > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${inv.id === activeId ? 'bg-blue-500' : 'bg-gray-200 text-gray-600'}`}>
                {inv.items.length}
              </span>
            )}
            {invoices.length > 1 && (
              <span className="mr-1 opacity-70 hover:opacity-100"
                onClick={e => { e.stopPropagation(); closeInvoice(inv.id) }}>
                <FiX className="w-3 h-3" />
              </span>
            )}
          </div>
        ))}
        <button onClick={addNewInvoice}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-blue-600 border border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 transition-colors">
          <FiPlus className="w-3.5 h-3.5" />
          فاکتور جدید
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* Left: Product add methods */}
        <div className="lg:w-72 flex-shrink-0 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setShowScanner(true)}
              className="card flex flex-col items-center gap-1.5 py-4 hover:border-blue-400 border-2 transition-colors cursor-pointer">
              <FiCamera className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">بارکد</span>
            </button>
            <button onClick={() => setShowSearch(true)}
              className="card flex flex-col items-center gap-1.5 py-4 hover:border-blue-400 border-2 transition-colors cursor-pointer">
              <FiSearch className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">جستجو</span>
            </button>
            <button onClick={() => setShowManual(true)}
              className="card flex flex-col items-center gap-1.5 py-4 hover:border-blue-400 border-2 transition-colors cursor-pointer">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">دستی</span>
            </button>
          </div>

          {/* Customer info */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">مشتری (اختیاری)</span>
              <button onClick={() => setShowCustomer(true)} className="text-blue-600 hover:text-blue-700">
                <FiEdit2 className="w-4 h-4" />
              </button>
            </div>
            {active?.customer?.firstName || active?.customer?.phone ? (
              <div className="text-sm text-gray-600">
                {active.customer.firstName} {active.customer.lastName}
                {active.customer.phone && <div className="text-gray-400 text-xs mt-0.5">{active.customer.phone}</div>}
              </div>
            ) : (
              <button onClick={() => setShowCustomer(true)}
                className="text-sm text-gray-400 hover:text-blue-600 flex items-center gap-1">
                <FiUser className="w-3.5 h-3.5" />
                افزودن اطلاعات مشتری
              </button>
            )}
          </div>

          {/* Discount */}
          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">تخفیف (تومان)</label>
            <input type="number" className="input-field" placeholder="0"
              value={active?.discount || ''}
              onChange={e => updateActive(inv => ({ ...inv, discount: Number(e.target.value) || 0 }))}
              min="0" />
          </div>
        </div>

        {/* Right: Invoice items + total */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="card flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">اقلام فاکتور</h3>
              <span className="text-sm text-gray-400">{active?.items.length || 0} آیتم</span>
            </div>

            {!active?.items.length ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 py-12">
                <FiShoppingCart className="w-12 h-12 mb-3" />
                <p className="text-sm">محصولی اضافه نشده</p>
                <p className="text-xs mt-1">از بارکد، جستجو یا ورود دستی استفاده کنید</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1">
                {active.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm truncate">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.price?.toLocaleString('fa-IR')} تومان/عدد</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(idx, -1)}
                        className="w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100">
                        <FiMinus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="w-7 text-center font-bold text-gray-800 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(idx, 1)}
                        className="w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100">
                        <FiPlus className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                    <div className="font-bold text-blue-700 text-sm min-w-[70px] text-left">
                      {item.total?.toLocaleString('fa-IR')}
                    </div>
                    <button onClick={() => removeItem(idx)}
                      className="text-gray-300 hover:text-red-500 p-1">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total & complete */}
          <div className="card mt-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>جمع کالا:</span>
              <span>{subtotal.toLocaleString('fa-IR')} تومان</span>
            </div>
            {(active?.discount > 0) && (
              <div className="flex items-center justify-between text-sm text-red-600 mb-1">
                <span>تخفیف:</span>
                <span>- {active.discount.toLocaleString('fa-IR')} تومان</span>
              </div>
            )}
            <div className="flex items-center justify-between font-bold text-xl border-t pt-3 mt-2">
              <span className="text-gray-800">مجموع:</span>
              <span className="text-blue-700">{total.toLocaleString('fa-IR')} تومان</span>
            </div>

            <button onClick={completeInvoice} disabled={saving || !active?.items.length}
              className="btn-success w-full mt-4 py-3 text-base flex items-center justify-center gap-2">
              <FiCheck className="w-5 h-5" />
              {saving ? 'در حال ثبت...' : 'تکمیل و چاپ فاکتور'}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showScanner && <BarcodeScanner onDetect={handleBarcodeDetect} onClose={() => setShowScanner(false)} />}
      {showSearch && <ProductSearchModal products={products} onSelect={p => addProduct(p)} onClose={() => setShowSearch(false)} />}
      {showManual && <ManualItemModal onAdd={addManualItem} onClose={() => setShowManual(false)} />}
      {showCustomer && (
        <CustomerModal
          customer={active?.customer}
          onChange={c => updateActive(inv => ({ ...inv, customer: c }))}
          onClose={() => setShowCustomer(false)}
        />
      )}

      {/* Hidden print area */}
      <div className="hidden">
        <div ref={printRef}>
          {printInvoice && <InvoicePrint invoice={printInvoice} settings={settings} />}
        </div>
      </div>
    </div>
  )
}

function toPersianNum(n) {
  return n.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
}
