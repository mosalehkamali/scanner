'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiTag } from 'react-icons/fi'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')

  const load = () => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      setCategories(d.categories || [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const addCategory = async () => {
    if (!newName.trim()) return
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (res.ok) { toast.success('دسته‌بندی افزوده شد'); setNewName(''); setAdding(false); load() }
    else { const d = await res.json(); toast.error(d.error || 'خطا') }
  }

  const saveEdit = async (id) => {
    if (!editName.trim()) return
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    if (res.ok) { toast.success('بروزرسانی شد'); setEditing(null); load() }
    else toast.error('خطا در بروزرسانی')
  }

  const deleteCategory = async (id, name) => {
    const result = await Swal.fire({
      title: 'حذف دسته‌بندی',
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
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('دسته‌بندی حذف شد'); load() }
    else toast.error('خطا در حذف')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold gradient-text">دسته‌بندی‌ها</h1>
          <p className="text-zinc-500 text-sm mt-1">مدیریت دسته‌بندی محصولات</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" />
          دسته‌بندی جدید
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="card border-brand-500/30 bg-brand-500/5 mb-5">
          <h3 className="font-heading font-semibold text-white mb-4">افزودن دسته‌بندی جدید</h3>
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="نام دسته‌بندی"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              autoFocus
            />
            <button onClick={addCategory} className="btn-primary flex items-center gap-1.5">
              <FiSave className="w-4 h-4" />
              ذخیره
            </button>
            <button onClick={() => { setAdding(false); setNewName('') }} className="btn-secondary" aria-label="لغو">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-2xl bg-zinc-900 border border-white/10 p-4 animate-pulse flex gap-3">
              <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
              <div className="skeleton h-4 w-28 my-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center">
            <FiTag className="w-7 h-7 text-zinc-500" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-white">هنوز دسته‌بندی‌ای ثبت نشده</h3>
          <p className="text-zinc-500 text-sm max-w-xs">با کلیک روی «دسته‌بندی جدید» اولین دسته‌بندی را بسازید</p>
          <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2 mt-2">
            <FiPlus className="w-4 h-4" />
            دسته‌بندی جدید
          </button>
        </div>
      )}

      {/* List */}
      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(cat => (
            <div key={cat._id} className="card flex items-center gap-3 hover:shadow-[0_4px_20px_rgba(162,28,175,0.12)]">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                <FiTag className="text-brand-300 w-4 h-4" />
              </div>
              {editing === cat._id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    className="input-field flex-1 py-1.5 text-sm"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(cat._id)}
                    autoFocus
                  />
                  <button onClick={() => saveEdit(cat._id)} className="text-acid-400 hover:text-acid-300 p-1.5 rounded-lg hover:bg-acid-400/10 transition-colors" aria-label="ذخیره">
                    <FiSave className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-700 transition-colors" aria-label="لغو">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 font-medium text-white">{cat.name}</span>
                  <button onClick={() => { setEditing(cat._id); setEditName(cat.name) }}
                    className="text-zinc-500 hover:text-brand-300 p-1.5 rounded-lg hover:bg-brand-500/10 transition-colors" aria-label="ویرایش">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCategory(cat._id, cat.name)}
                    className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" aria-label="حذف">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
