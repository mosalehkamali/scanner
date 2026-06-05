'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiEdit2, FiSave, FiX, FiToggleLeft, FiToggleRight } from 'react-icons/fi'

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  const load = () => {
    fetch('/api/admin/plans').then(r => r.json()).then(d => {
      setPlans(d.plans || [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const startEdit = (plan) => {
    setEditing(plan._id)
    setEditForm({ title: plan.title, price: plan.price, duration: plan.duration })
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditForm({})
  }

  const saveEdit = async (id) => {
    const res = await fetch('/api/admin/plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editForm, price: Number(editForm.price), duration: Number(editForm.duration) }),
    })
    if (res.ok) {
      toast.success('پلان بروزرسانی شد')
      setEditing(null)
      load()
    } else {
      toast.error('خطا در بروزرسانی')
    }
  }

  const toggleActive = async (plan) => {
    const res = await fetch('/api/admin/plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: plan._id, isActive: !plan.isActive }),
    })
    if (res.ok) {
      toast.success(plan.isActive ? 'پلان غیرفعال شد' : 'پلان فعال شد')
      load()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">پلان‌های اشتراک</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan._id} className={`card border-2 ${plan.isActive ? 'border-blue-200' : 'border-gray-200 opacity-60'}`}>
              {editing === plan._id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">عنوان پلان</label>
                    <input className="input-field" value={editForm.title}
                      onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">مدت (ماه)</label>
                    <input type="number" className="input-field" value={editForm.duration}
                      onChange={e => setEditForm({ ...editForm, duration: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">قیمت (تومان)</label>
                    <input type="number" className="input-field" value={editForm.price}
                      onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(plan._id)} className="btn-primary text-sm flex-1 flex items-center justify-center gap-1">
                      <FiSave className="w-4 h-4" />
                      ذخیره
                    </button>
                    <button onClick={cancelEdit} className="btn-secondary text-sm flex items-center gap-1">
                      <FiX className="w-4 h-4" />
                      لغو
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{plan.duration}</div>
                    <div className="text-sm text-gray-500">ماه</div>
                    <div className="text-xl font-bold text-gray-800 mt-2">{plan.price?.toLocaleString('fa-IR')}</div>
                    <div className="text-sm text-gray-500">تومان</div>
                    <div className="text-base font-medium text-gray-700 mt-1">{plan.title}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(plan)} className="btn-secondary text-sm flex-1 flex items-center justify-center gap-1">
                      <FiEdit2 className="w-3 h-3" />
                      ویرایش
                    </button>
                    <button onClick={() => toggleActive(plan)}
                      className={`text-sm flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${plan.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {plan.isActive ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                      {plan.isActive ? 'فعال' : 'غیرفعال'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
