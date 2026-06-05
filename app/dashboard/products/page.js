'use client'

import { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import Barcode from 'react-barcode'
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave,
  FiPackage, FiAlertTriangle, FiFilter, FiHash
} from 'react-icons/fi'

const emptyForm = {
  name: '', barcode: '', categoryId: '', price: '', stock: '',
  lowStockLimit: '5', description: '',
}

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
  const [saving, setSaving] = useState(false)

  const generateBarcode = () => {
    const code = Date.now().toString().slice(-12)
    setForm({ ...form, barcode: code })
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
    let res
    if (product) {
      res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }
    if (res.ok) {
      toast.success(product ? 'محصول بروزرسانی شد' : 'محصول افزوده شد')
      onSave()
    } else {
      const d = await res.json()
      toast.error(d.error || 'خطا')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg">{product ? 'ویرایش محصول' : 'محصول جدید'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام محصول *</label>
            <input className="input-field" placeholder="نام محصول" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">بارکد</label>
            <div className="flex gap-2">
              <input className="input-field flex-1 font-mono" placeholder="بارکد محصول" value={form.barcode}
                onChange={e => setForm({ ...form, barcode: e.target.value })} />
              <button type="button" onClick={generateBarcode}
                className="btn-secondary text-sm flex items-center gap-1 whitespace-nowrap">
                <FiHash className="w-4 h-4" />
                تولید
              </button>
            </div>
            {form.barcode && form.barcode.length >= 8 && (
              <div className="mt-2 flex justify-center bg-white border rounded-lg p-3">
                <Barcode value={form.barcode} width={1.5} height={50} fontSize={12} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
            <select className="input-field" value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">بدون دسته‌بندی</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">قیمت فروش (تومان) *</label>
              <input type="number" className="input-field" placeholder="0" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} required min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">موجودی</label>
              <input type="number" className="input-field" placeholder="0" value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })} min="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">آستانه هشدار موجودی</label>
            <input type="number" className="input-field" placeholder="5" value={form.lowStockLimit}
              onChange={e => setForm({ ...form, lowStockLimit: e.target.value })} min="0" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
            <textarea className="input-field resize-none" rows={2} placeholder="توضیحات اختیاری"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={saving}>
              <FiSave className="w-4 h-4" />
              {saving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">لغو</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [modal, setModal] = useState(null)

  const load = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
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
      showCancelButton: true,
      confirmButtonText: 'حذف',
      cancelButtonText: 'لغو',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
    })
    if (!result.isConfirmed) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('محصول حذف شد')
      load()
    } else {
      toast.error('خطا در حذف')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">محصولات</h1>
        <button onClick={() => setModal({ type: 'add' })} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" />
          محصول جدید
        </button>
      </div>

      <div className="card mb-4 space-y-3">
        <div className="relative">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pr-10" placeholder="جستجو بر اساس نام یا بارکد..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter className="text-gray-400 w-4 h-4" />
          <button onClick={() => setCatFilter('')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${!catFilter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
            همه
          </button>
          {categories.map(c => (
            <button key={c._id} onClick={() => setCatFilter(c._id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${catFilter === c._id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>
      ) : products.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <FiPackage className="w-10 h-10 mx-auto mb-3 opacity-40" />
          محصولی یافت نشد
        </div>
      ) : (
        <div className="space-y-2">
          {products.map(p => {
            const lowStock = p.stock <= p.lowStockLimit
            return (
              <div key={p._id} className={`card flex items-center gap-4 ${lowStock ? 'border-red-200 border' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 truncate">{p.name}</span>
                    {lowStock && <FiAlertTriangle className="text-red-500 w-4 h-4 flex-shrink-0" />}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                    {p.barcode && <span className="font-mono">{p.barcode}</span>}
                    {p.categoryId && <span className="badge-gray">{p.categoryId.name}</span>}
                    <span className={lowStock ? 'text-red-600 font-medium' : ''}>موجودی: {p.stock}</span>
                  </div>
                </div>
                <div className="text-left flex-shrink-0">
                  <div className="font-bold text-gray-800">{p.price.toLocaleString('fa-IR')}</div>
                  <div className="text-xs text-gray-400">تومان</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setModal({ type: 'edit', product: p })}
                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteProduct(p._id, p.name)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
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
