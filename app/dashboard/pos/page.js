'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { toast } from 'react-toastify'
import { useReactToPrint } from 'react-to-print'
import BarcodeScanner from '@/components/BarcodeScanner'
import {
  FiPlus, FiMinus, FiTrash2, FiX, FiCamera, FiSearch,
  FiShoppingCart, FiPrinter, FiCheck, FiUser, FiDollarSign,
  FiEdit2, FiSave, FiPackage,
} from 'react-icons/fi'

// ── Invoice print template (no dark mode — for print) ─────────────────────────
function InvoicePrint({ invoice, settings }) {
  const fontSizeMap = { small: '11px', medium: '13px', large: '15px' }
  const fontSize = fontSizeMap[settings?.invoiceFontSize || 'medium']
  return (
    <div style={{ fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl', fontSize, padding: '10mm' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '8px' }}>
        {invoice.storeInfo?.name    && <div style={{ fontSize: '1.3em', fontWeight: 'bold' }}>{invoice.storeInfo.name}</div>}
        {invoice.storeInfo?.phone   && <div>{invoice.storeInfo.phone}</div>}
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

// ── Customer info modal ────────────────────────────────────────────────────────
function CustomerModal({ customer, onChange, onClose }) {
  const [form, setForm] = useState(customer || { firstName: '', lastName: '', phone: '' })
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm animate-fade-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-heading font-bold text-white">اطلاعات مشتری</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white"><FiX /></button>
        </div>
        <div className="p-5 space-y-3">
          <input className="input-field" placeholder="نام" value={form.firstName}
            onChange={e => setForm({ ...form, firstName: e.target.value })} />
          <input className="input-field" placeholder="نام خانوادگی" value={form.lastName}
            onChange={e => setForm({ ...form, lastName: e.target.value })} />
          <input className="input-field" placeholder="شماره موبایل" value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" />
          <button onClick={() => { onChange(form); onClose() }} className="btn-primary w-full">ذخیره</button>
        </div>
      </div>
    </div>
  )
}

// ── Manual item modal ──────────────────────────────────────────────────────────
function ManualItemModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name: '', price: '', quantity: '1' })
  const handleAdd = () => {
    if (!form.name || !form.price) return toast.error('نام و قیمت الزامی است')
    onAdd({ name: form.name, price: Number(form.price), quantity: Number(form.quantity) || 1 })
    onClose()
  }
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm animate-fade-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-heading font-bold text-white">افزودن آیتم دستی</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white"><FiX /></button>
        </div>
        <div className="p-5 space-y-3">
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

// ── Product search modal ───────────────────────────────────────────────────────
function ProductSearchModal({ products, onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const filtered = products.filter(p => p.name.includes(search) || (p.barcode || '').includes(search))
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-sm max-h-[75vh] flex flex-col animate-fade-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="font-heading font-bold text-white">جستجوی محصول</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white"><FiX /></button>
        </div>
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <FiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input className="input-field pr-10" placeholder="نام یا بارکد محصول..."
              value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-sm">محصولی یافت نشد</div>
          ) : filtered.map(p => (
            <button key={p._id} onClick={() => { onSelect(p); onClose() }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-brand-500/10 transition-colors border-b border-white/5 last:border-0">
              <div className="text-right">
                <div className="font-medium text-white text-sm">{p.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{p.barcode && <span className="font-mono">{p.barcode} — </span>}موجودی: {p.stock}</div>
              </div>
              <div className="font-bold text-brand-300 text-sm font-mono">{p.price?.toLocaleString('fa-IR')}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Quick register modal (barcode not in inventory) ────────────────────────────
function QuickRegisterModal({ barcode, categories, onSave, onClose }) {
  const [form,   setForm]   = useState({ name: '', price: '', stock: '1', categoryId: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return toast.error('نام و قیمت الزامی است')
    setSaving(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          barcode,
          price: Number(form.price),
          stock: Number(form.stock) || 0,
          categoryId: form.categoryId || null,
          lowStockLimit: 5,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'خطا در ثبت محصول'); return }
      toast.success(`محصول «${form.name}» ثبت و به فاکتور اضافه شد`)
      onSave(data.product)
    } catch {
      toast.error('خطای اتصال')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md animate-fade-up">
        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-heading font-bold text-white">ثبت سریع محصول</h3>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white"><FiX /></button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-zinc-500">بارکد:</span>
            <span className="text-xs font-mono text-neon-400 bg-neon-400/10 border border-neon-400/20 px-2 py-0.5 rounded-full">{barcode}</span>
            <span className="text-xs text-zinc-500">— در انبار یافت نشد</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">نام محصول *</label>
            <input className="input-field" placeholder="نام محصول را وارد کنید" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">قیمت (تومان) *</label>
              <input type="number" className="input-field" placeholder="0" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} min="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">موجودی اولیه</label>
              <input type="number" className="input-field" placeholder="1" value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })} min="0" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">دسته‌بندی</label>
            <select className="input-field" value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">بدون دسته‌بندی</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />در حال ثبت...</>
              ) : (
                <><FiSave className="w-4 h-4" />ثبت و افزودن به فاکتور</>
              )}
            </button>
            <button onClick={onClose} className="btn-ghost px-4">لغو</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── POS main component ─────────────────────────────────────────────────────────
export default function POSPage() {
  const [invoices, setInvoices] = useState([{
    id: Date.now(), title: 'فاکتور ۱',
    items: [], customer: { firstName: '', lastName: '', phone: '' },
    discount: 0, notes: '',
  }])
  const [activeId,      setActiveId]      = useState(null)
  const [products,      setProducts]      = useState([])
  const [categories,    setCategories]    = useState([])
  const [settings,      setSettings]      = useState(null)
  const [showScanner,   setShowScanner]   = useState(false)
  const [showSearch,    setShowSearch]    = useState(false)
  const [showManual,    setShowManual]    = useState(false)
  const [showCustomer,  setShowCustomer]  = useState(false)
  const [quickRegister, setQuickRegister] = useState(null) // barcode string | null
  const [lastBarcode,   setLastBarcode]   = useState('')
  const [saving,        setSaving]        = useState(false)
  const printRef    = useRef()
  const [printInvoice, setPrintInvoice]  = useState(null)

  const loadProducts = () =>
    fetch('/api/products').then(r => r.json()).then(d => setProducts(d.products || []))

  useEffect(() => {
    setActiveId(invoices[0].id)
    loadProducts()
    fetch('/api/settings').then(r => r.json()).then(d => setSettings(d.settings))
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
  }, [])

  const handlePrint = useReactToPrint({ content: () => printRef.current })

  const active = invoices.find(i => i.id === activeId) || invoices[0]

  const updateActive = (updater) =>
    setInvoices(prev => prev.map(inv => inv.id === activeId ? updater(inv) : inv))

  const addNewInvoice = () => {
    const id  = Date.now()
    const num = invoices.length + 1
    setInvoices(prev => [...prev, {
      id, title: `فاکتور ${toPersianNum(num)}`,
      items: [], customer: { firstName: '', lastName: '', phone: '' }, discount: 0, notes: '',
    }])
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
      const existingIdx = inv.items.findIndex(it => it.productId === product._id)
      let items
      if (existingIdx >= 0) {
        items = inv.items.map((it, i) => i === existingIdx
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
    toast.success(`${product.name} افزوده شد`, { autoClose: 1200, position: 'bottom-center' })
  }, [activeId])

  const addManualItem = ({ name, price, quantity }) => {
    setInvoices(prev => prev.map(inv => inv.id !== activeId ? inv : {
      ...inv, items: [...inv.items, { productId: null, name, price, quantity, total: price * quantity }],
    }))
    toast.success(`${name} افزوده شد`, { autoClose: 1200, position: 'bottom-center' })
  }

  const updateQty = (idx, delta) => {
    updateActive(inv => ({
      ...inv, items: inv.items.map((it, i) => {
        if (i !== idx) return it
        const q = Math.max(1, it.quantity + delta)
        return { ...it, quantity: q, total: q * it.price }
      }),
    }))
  }

  const removeItem = (idx) =>
    updateActive(inv => ({ ...inv, items: inv.items.filter((_, i) => i !== idx) }))

  // ── Barcode detect: find product or open quick-register ──────────────────
  const handleBarcodeDetect = useCallback(async (barcode) => {
    if (barcode === lastBarcode) return
    setLastBarcode(barcode)
    setTimeout(() => setLastBarcode(''), 1500)

    const product = products.find(p => p.barcode === barcode)
    if (product) {
      addProduct(product)
    } else {
      // Unknown barcode → close scanner, offer quick registration
      setShowScanner(false)
      setQuickRegister(barcode)
    }
  }, [products, addProduct, lastBarcode])

  // ── After quick-register: reload products list + add to invoice ──────────
  const handleQuickRegisterSave = async (newProduct) => {
    setQuickRegister(null)
    await loadProducts()
    addProduct(newProduct)
  }

  // ── Submit invoice ────────────────────────────────────────────────────────
  const subtotal = active?.items.reduce((s, it) => s + it.total, 0) || 0
  const total    = Math.max(0, subtotal - (active?.discount || 0))

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
      setPrintInvoice({
        ...invoice,
        storeInfo: settings
          ? { name: settings.storeName, phone: settings.storePhone, address: settings.storeAddress }
          : {},
      })
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 130px)' }}>

      {/* Invoice tabs */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {invoices.map(inv => (
          <div key={inv.id}
            onClick={() => setActiveId(inv.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 border ${
              inv.id === activeId
                ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-white'
            }`}>
            <FiShoppingCart className="w-3.5 h-3.5" />
            <span>{inv.title}</span>
            {inv.items.length > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-mono ${inv.id === activeId ? 'bg-brand-500/40 text-brand-200' : 'bg-zinc-700 text-zinc-400'}`}>
                {inv.items.length}
              </span>
            )}
            {invoices.length > 1 && (
              <span onClick={e => { e.stopPropagation(); closeInvoice(inv.id) }}
                className="mr-0.5 text-zinc-500 hover:text-red-400 transition-colors">
                <FiX className="w-3 h-3" />
              </span>
            )}
          </div>
        ))}
        <button onClick={addNewInvoice}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-brand-400 border border-dashed border-brand-500/40 hover:border-brand-500/70 hover:bg-brand-500/10 transition-all duration-200">
          <FiPlus className="w-3.5 h-3.5" />
          فاکتور جدید
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1">

        {/* ── Left panel: add methods + customer + discount ── */}
        <div className="lg:w-72 flex-shrink-0 space-y-4">

          {/* Add method buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: FiCamera,       label: 'بارکد',  onClick: () => setShowScanner(true),  color: 'text-brand-300',  bg: 'hover:border-brand-500/50 hover:bg-brand-500/10' },
              { icon: FiSearch,       label: 'جستجو',  onClick: () => setShowSearch(true),   color: 'text-neon-400',   bg: 'hover:border-neon-400/50 hover:bg-neon-400/10' },
              { icon: FiDollarSign,   label: 'دستی',   onClick: () => setShowManual(true),   color: 'text-hot-400',    bg: 'hover:border-hot-400/50 hover:bg-hot-400/10' },
            ].map(btn => (
              <button key={btn.label} onClick={btn.onClick}
                className={`card flex flex-col items-center gap-1.5 py-4 border-2 border-zinc-700 ${btn.bg} transition-all duration-200`}>
                <btn.icon className={`w-6 h-6 ${btn.color}`} />
                <span className={`text-xs font-semibold ${btn.color}`}>{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Customer */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">مشتری (اختیاری)</span>
              <button onClick={() => setShowCustomer(true)} className="text-zinc-500 hover:text-brand-300 transition-colors" aria-label="ویرایش">
                <FiEdit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {active?.customer?.firstName || active?.customer?.phone ? (
              <div className="text-sm text-zinc-300">
                {active.customer.firstName} {active.customer.lastName}
                {active.customer.phone && <div className="text-zinc-500 text-xs mt-0.5 font-mono">{active.customer.phone}</div>}
              </div>
            ) : (
              <button onClick={() => setShowCustomer(true)}
                className="text-xs text-zinc-500 hover:text-brand-300 flex items-center gap-1.5 transition-colors">
                <FiUser className="w-3.5 h-3.5" />
                افزودن اطلاعات مشتری
              </button>
            )}
          </div>

          {/* Discount */}
          <div className="card">
            <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">تخفیف (تومان)</label>
            <input type="number" className="input-field" placeholder="0"
              value={active?.discount || ''}
              onChange={e => updateActive(inv => ({ ...inv, discount: Number(e.target.value) || 0 }))}
              min="0" />
          </div>
        </div>

        {/* ── Right panel: invoice items + total ── */}
        <div className="flex-1 flex flex-col min-h-0 gap-4">
          <div className="card flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-white">اقلام فاکتور</h3>
              <span className="badge-brand font-mono">{active?.items.length || 0} آیتم</span>
            </div>

            {!active?.items.length ? (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 py-12 gap-3">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center">
                  <FiShoppingCart className="w-7 h-7" />
                </div>
                <p className="text-sm text-zinc-500">محصولی اضافه نشده</p>
                <p className="text-xs text-zinc-600">از بارکد، جستجو یا ورود دستی استفاده کنید</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1">
                {active.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-zinc-800/50 border border-white/5 rounded-xl px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">{item.name}</div>
                      <div className="text-xs text-zinc-500 font-mono">{item.price?.toLocaleString('fa-IR')} ت</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(idx, -1)}
                        className="w-7 h-7 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center transition-colors">
                        <FiMinus className="w-3 h-3 text-zinc-300" />
                      </button>
                      <span className="w-8 text-center font-bold text-white text-sm font-mono">{item.quantity}</span>
                      <button onClick={() => updateQty(idx, 1)}
                        className="w-7 h-7 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center transition-colors">
                        <FiPlus className="w-3 h-3 text-zinc-300" />
                      </button>
                    </div>
                    <div className="font-bold text-brand-300 text-sm font-mono min-w-[70px] text-left">
                      {item.total?.toLocaleString('fa-IR')}
                    </div>
                    <button onClick={() => removeItem(idx)}
                      className="text-zinc-600 hover:text-red-400 transition-colors p-1" aria-label="حذف">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total + complete */}
          <div className="card">
            <div className="flex items-center justify-between text-sm text-zinc-400 mb-1">
              <span>جمع کالا:</span>
              <span className="font-mono">{subtotal.toLocaleString('fa-IR')} تومان</span>
            </div>
            {(active?.discount > 0) && (
              <div className="flex items-center justify-between text-sm text-red-400 mb-1">
                <span>تخفیف:</span>
                <span className="font-mono">- {active.discount.toLocaleString('fa-IR')} تومان</span>
              </div>
            )}
            <div className="divider-glow my-3" />
            <div className="flex items-center justify-between font-heading font-bold text-xl">
              <span className="text-white">مجموع:</span>
              <span className="gradient-text font-mono">{total.toLocaleString('fa-IR')} تومان</span>
            </div>

            <button onClick={completeInvoice} disabled={saving || !active?.items.length}
              className="btn-primary w-full mt-4 py-3.5 text-base flex items-center justify-center gap-2">
              {saving ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />در حال ثبت...</>
              ) : (
                <><FiCheck className="w-5 h-5" />تکمیل و چاپ فاکتور</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showScanner && (
        <BarcodeScanner
          title="اسکن بارکد — صندوق فروش"
          onDetect={handleBarcodeDetect}
          onClose={() => setShowScanner(false)}
        />
      )}
      {showSearch && (
        <ProductSearchModal products={products} onSelect={p => addProduct(p)} onClose={() => setShowSearch(false)} />
      )}
      {showManual && (
        <ManualItemModal onAdd={addManualItem} onClose={() => setShowManual(false)} />
      )}
      {showCustomer && (
        <CustomerModal
          customer={active?.customer}
          onChange={c => updateActive(inv => ({ ...inv, customer: c }))}
          onClose={() => setShowCustomer(false)}
        />
      )}
      {quickRegister && (
        <QuickRegisterModal
          barcode={quickRegister}
          categories={categories}
          onSave={handleQuickRegisterSave}
          onClose={() => setQuickRegister(null)}
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
