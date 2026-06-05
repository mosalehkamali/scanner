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
    if (res.ok) {
      toast.success('دسته‌بندی افزوده شد')
      setNewName('')
      setAdding(false)
      load()
    } else {
      const d = await res.json()
      toast.error(d.error || 'خطا')
    }
  }

  const saveEdit = async (id) => {
    if (!editName.trim()) return
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    if (res.ok) {
      toast.success('بروزرسانی شد')
      setEditing(null)
      load()
    } else {
      toast.error('خطا در بروزرسانی')
    }
  }

  const deleteCategory = async (id, name) => {
    const result = await Swal.fire({
      title: 'حذف دسته‌بندی',
      text: `«${name}» حذف شود؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'حذف',
      cancelButtonText: 'لغو',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
    })
    if (!result.isConfirmed) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('دسته‌بندی حذف شد')
      load()
    } else {
      toast.error('خطا در حذف')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">دسته‌بندی‌ها</h1>
        <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" />
          دسته‌بندی جدید
        </button>
      </div>

      {adding && (
        <div className="card mb-4 border-blue-200 border-2">
          <h3 className="font-medium text-gray-700 mb-3">افزودن دسته‌بندی</h3>
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="نام دسته‌بندی"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              autoFocus
            />
            <button onClick={addCategory} className="btn-primary flex items-center gap-1">
              <FiSave className="w-4 h-4" />
              ذخیره
            </button>
            <button onClick={() => { setAdding(false); setNewName('') }} className="btn-secondary">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>
      ) : categories.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <FiTag className="w-10 h-10 mx-auto mb-3 opacity-40" />
          هنوز دسته‌بندی‌ای ثبت نشده
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(cat => (
            <div key={cat._id} className="card flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiTag className="text-blue-600 w-4 h-4" />
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
                  <button onClick={() => saveEdit(cat._id)} className="text-green-600 hover:text-green-700 p-1">
                    <FiSave className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 p-1">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 font-medium text-gray-800">{cat.name}</span>
                  <button onClick={() => { setEditing(cat._id); setEditName(cat.name) }}
                    className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCategory(cat._id, cat.name)}
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50">
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
