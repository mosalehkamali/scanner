'use client'

import { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import Barcode from 'react-barcode'
import BarcodeScanner from '@/components/BarcodeScanner'
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave,
  FiPackage, FiAlertTriangle, FiFilter, FiHash,
  FiCamera, FiDownload, FiRefreshCw
} from 'react-icons/fi'

// ── helpers ───────────────────────────────────────────────────────────────────

function generateBarcode() {
  // 12-digit numeric → valid EAN-13 with check digit
  const base = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('')
  const sum = base.split('').reduce((acc, d, i) => acc + (i % 2 === 0 ? +d : +d * 3), 0)
  const check = (10 - (sum % 10)) % 10
  return base + check
}

function autoFormat(code) {
  if (/^\d{13}$/.test(code)) return 'EAN13'
  if (/^\d{8}$/.test(code))  return 'EAN8'
  if (/^\d{12}$/.test(code)) return 'UPC'
  return 'CODE128'
}

async function downloadBarcodeLabel(barcodeValue, productName) {
  try {
    const { default: JsBarcode } = await import('jsbarcode')

    // Barcode canvas
    const barcodeCanvas = document.createElement('canvas')
    JsBarcode(barcodeCanvas, barcodeValue, {
      format: autoFormat(barcodeValue),
      width: 2,
      height: 70,
      displayValue: true,
      fontSize: 13,
      margin: 10,
      background: '#ffffff',
      lineColor: '#000000',
    })

    // Label canvas
    const W = Math.max(barcodeCanvas.width + 20, 280)
    const H = barcodeCanvas.height + 40
    const label = document.createElement('canvas')
    label.width  = W
    label.height = H
    const ctx = label.getContext('2d')

    // Background + border
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1)

    // Product name (RTL — Canvas doesn't natively flip text; keep LTR safe)
    ctx.fillStyle = '#111111'
    ctx.font = 'bold 13px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const name = productName ? (productName.length > 38 ? productName.slice(0, 38) + '…' : productName) : ''
    if (name) ctx.fillText(name, W / 2, 8)

    // Barcode image
    const barcodeX = Math.max(0, (W - barcodeCanvas.width) / 2)
    ctx.drawImage(barcodeCanvas, barcodeX, name ? 26 : 10)

    // Download
    const url = label.toDataURL('image/png')
    const a   = document.createElement('a')
    a.href     = url
    a.download = `label-${barcodeValue}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (err) {
    console.error(err)
    toast.error('خطا در تولید لیبل بارکد')
  }
}

// ── ProductModal ──────────────────────────────────────────────────────────────

const emptyForm = { name: '', barcode: '', categoryId: '', price: '', stock: '', lowStockLimit: '5', description: '' }

function ProductModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState(product ? {
    name: product.name,
    barcode: product.barcode || '',
    categoryId: product.categoryId?._id || product.categoryId || '',
    price: product.price,
    stock: product.stock,
    lowStockLimit: product.lowStockLimit,
    description: product.description || '',
  } : { ...emptyForm })
  const [saving,      setSaving]      = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [scanning,    setScanning]    = useState(false) // checking dup after scan

  const handleBarcodeScanned = async (code) => {
    setShowScanner(false)
    setForm(f => ({ ...f, barcode: code }))

    // Check duplicate
    setScanning(true)
    try {
      const res  = await fetch(`/api/products?barcode=${encodeURIComponent(code)}`)
      const data = await res.json()
      const found = (data.products || []).find(p => product ? p._id !== product._id : true)
      if (found) {
        toast.warning(`این بارکد قبلاً برای «${found.name}» ثبت شده است`)
      } else {
        toast.success('بارکد اسکن شد ✓')
      }
    } catch {}
    setScanning(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const body = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      lowStockLimit: Number(form.lowStockLimit),
      categoryId: form.categoryId || null,
    }
    const res = product
      ? await fetch(`/api/products/${product._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

    if (res.ok) {
      toast.success(product ? 'محصول بروزرسانی شد' : 'محصول افزوده شد')
      onSave()
    } else {
      const d = await res.json()
      toast.error(d.error || 'خطا')
    }
    setSaving(false)
  }

  const validBarcode = form.barcode.length >= 4

  return (
    <>
      {/* Scanner fullscreen */}
      {showScanner && (
        <BarcodeScanner
          title="اسکن بارکد محصول"
          onDetect={handleBarcodeScanned}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Modal */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10">
            <h2 className="font-heading font-bold text-white text-lg">
              {product ? 'ویرایش محصول' : 'محصول جدید'}
            </h2>
            <button onClick={onClose} aria-label="بستن"
              className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">نام محصول *</label>
              <input className="input-field" placeholder="نام محصول" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">بارکد</label>
              <div className="flex gap-2">
                <input
                  className="input-field flex-1 font-mono tracking-wider"
                  placeholder="بارکد محصول"
                  value={form.barcode}
                  dir="ltr"
                  onChange={e => setForm({ ...form, barcode: e.target.value })}
                />
                {/* Scan button */}
                <button type="button" onClick={() => setShowScanner(true)}
                  className="px-3 py-2.5 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-300 hover:bg-brand-500/30 transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold"
                  title="اسکن با دوربین">
                  <FiCamera className="w-4 h-4" />
                  اسکن
                </button>
                {/* Generate button */}
                <button type="button" onClick={() => setForm({ ...form, barcode: generateBarcode() })}
                  className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap text-sm"
                  title="تولید خودکار بارکد">
                  <FiHash className="w-4 h-4" />
                  تولید
                </button>
              </div>

              {scanning && (
                <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                  <FiRefreshCw className="w-3 h-3 animate-spin" />
                  در حال بررسی تکراری بودن...
                </p>
              )}

              {/* Barcode preview + download */}
              {validBarcode && (
                <div className="mt-3 rounded-xl bg-white p-3 flex flex-col items-center gap-2">
                  <Barcode value={form.barcode} width={1.8} height={55} fontSize={12} />
                  <button
                    type="button"
                    onClick={() => downloadBarcodeLabel(form.barcode, form.name)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50 border border-brand-200"
                  >
                    <FiDownload className="w-3.5 h-3.5" />
                    دانلود لیبل بارکد (PNG)
                  </button>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">دسته‌بندی</label>
              <select className="input-field" value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">بدون دسته‌بندی</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">قیمت (تومان) *</label>
                <input type="number" className="input-field" placeholder="0" value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })} required min="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">موجودی</label>
                <input type="number" className="input-field" placeholder="0" value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })} min="0" />
              </div>
            </div>

            {/* Low stock limit */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">آستانه هشدار موجودی</label>
              <input type="number" className="input-field" placeholder="5" value={form.lowStockLimit}
                onChange={e => setForm({ ...form, lowStockLimit: e.target.value })} min="0" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wide">توضیحات</label>
              <textarea className="input-field resize-none" rows={2} placeholder="توضیحات اختیاری"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
                {saving ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />در حال ذخیره...</>
                ) : (
                  <><FiSave className="w-4 h-4" />ذخیره</>
                )}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary">لغو</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

// ── Main products page ────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [catFilter,  setCatFilter]  = useState('')
  const [modal,      setModal]      = useState(null)

  const load = () => {
    const params = new URLSearchParams()
    if (search)    params.set('search', search)
    if (catFilter) params.set('category', catFilter)
    fetch(`/api/products?${params}`).then(r => r.json()).then(d => {
      setProducts(d.products || [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [search, catFilter])
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []))
  }, [])

  const deleteProduct = async (id, name) => {
    const result = await Swal.fire({
      title: 'حذف محصول',
      text: `«${name}» حذف شود؟`,
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
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('محصول حذف شد'); load() }
    else toast.error('خطا در حذف')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold gradient-text">محصولات</h1>
          <p className="text-zinc-500 text-sm mt-1">مدیریت کالاها و موجودی انبار</p>
        </div>
        <button onClick={() => setModal({ type: 'add' })} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" />
          محصول جدید
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-5 space-y-4">
        <div className="relative">
          <FiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input className="input-field pr-10" placeholder="جستجو بر اساس نام یا بارکد..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter className="text-zinc-500 w-4 h-4" />
          <button onClick={() => setCatFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              !catFilter ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-white'
            }`}>
            همه
          </button>
          {categories.map(c => (
            <button key={c._id} onClick={() => setCatFilter(c._id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                catFilter === c._id ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-white'
              }`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl bg-zinc-900 border border-white/10 p-4 animate-pulse flex gap-4">
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-48" />
                <div className="skeleton h-3 w-32" />
              </div>
              <div className="skeleton h-6 w-16 my-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center">
            <FiPackage className="w-7 h-7 text-zinc-500" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-white">محصولی یافت نشد</h3>
          <p className="text-zinc-500 text-sm max-w-xs">اولین محصول خود را اضافه کنید</p>
          <button onClick={() => setModal({ type: 'add' })} className="btn-primary flex items-center gap-2 mt-2">
            <FiPlus className="w-4 h-4" />
            محصول جدید
          </button>
        </div>
      )}

      {/* Product list */}
      {!loading && products.length > 0 && (
        <div className="space-y-2">
          {products.map(p => {
            const lowStock = p.stock <= p.lowStockLimit
            return (
              <div key={p._id}
                className={`card flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(162,28,175,0.1)] ${lowStock ? 'border-red-500/30 bg-red-500/5' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">{p.name}</span>
                    {lowStock && <FiAlertTriangle className="text-red-400 w-3.5 h-3.5 flex-shrink-0" />}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {p.barcode && (
                      <span className="text-xs text-zinc-500 font-mono bg-zinc-800/60 px-2 py-0.5 rounded">{p.barcode}</span>
                    )}
                    {p.categoryId && <span className="badge-gray">{p.categoryId.name}</span>}
                    <span className={`text-xs ${lowStock ? 'text-red-400 font-semibold' : 'text-zinc-500'}`}>
                      موجودی: {p.stock}
                    </span>
                  </div>
                </div>

                <div className="text-left flex-shrink-0">
                  <div className="font-heading font-bold text-white">{p.price.toLocaleString('fa-IR')}</div>
                  <div className="text-xs text-zinc-500">تومان</div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Download label shortcut */}
                  {p.barcode && (
                    <button
                      onClick={() => downloadBarcodeLabel(p.barcode, p.name)}
                      className="p-2 rounded-xl hover:bg-acid-400/10 text-zinc-500 hover:text-acid-400 transition-colors"
                      title="دانلود لیبل بارکد"
                      aria-label="دانلود لیبل">
                      <FiDownload className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setModal({ type: 'edit', product: p })}
                    className="p-2 rounded-xl hover:bg-brand-500/10 text-zinc-500 hover:text-brand-300 transition-colors" aria-label="ویرایش">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteProduct(p._id, p.name)}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors" aria-label="حذف">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <ProductModal
          product={modal.type === 'edit' ? modal.product : null}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
