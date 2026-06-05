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

  const cancelEdit = () => { setEditing(null); setEditForm({}) }

  const saveEdit = async (id) => {
    const res = await fetch('/api/admin/plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...editForm, price: Number(editForm.price), duration: Number(editForm.duration) }),
    })
    if (res.ok) { toast.success('پلان بروزرسانی شد'); setEditing(null); load() }
    else toast.error('خطا در بروزرسانی')
  }

  const toggleActive = async (plan) => {
    const res = await fetch('/api/admin/plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: plan._id, isActive: !plan.isActive }),
    })
    if (res.ok) { toast.success(plan.isActive ? 'پلان غیرفعال شد' : 'پلان فعال شد'); load() }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold gradient-text">پلان‌های اشتراک</h1>
        <p className="text-zinc-500 text-sm mt-1">مدیریت پلان‌های قیمت‌گذاری</p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl bg-zinc-900 border border-white/10 p-6 animate-pulse space-y-4">
              <div className="skeleton h-10 w-16 mx-auto" />
              <div className="skeleton h-4 w-24 mx-auto" />
              <div className="skeleton h-7 w-32 mx-auto" />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, idx) => {
            const gradients = [
              'from-brand-900/80 to-brand-800/40 border-brand-700/50',
              'from-zinc-900 to-zinc-800/60 border-neon-400/30',
              'from-zinc-900 to-zinc-800/60 border-acid-400/30',
            ]
            const highlight = ['text-brand-300', 'text-neon-400', 'text-acid-400']
            const gr = gradients[idx % 3]
            const hl = highlight[idx % 3]

            return (
              <div key={plan._id}
                className={`relative rounded-2xl bg-gradient-to-br ${gr} border transition-all duration-300 hover:scale-[1.02] p-6 ${!plan.isActive ? 'opacity-50' : ''}`}>
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-t-2xl" />

                {editing === plan._id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">عنوان پلان</label>
                      <input className="input-field" value={editForm.title}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">مدت (ماه)</label>
                      <input type="number" className="input-field" value={editForm.duration}
                        onChange={e => setEditForm({ ...editForm, duration: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">قیمت (تومان)</label>
                      <input type="number" className="input-field" value={editForm.price}
                        onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => saveEdit(plan._id)} className="btn-primary text-sm flex-1 flex items-center justify-center gap-1.5">
                        <FiSave className="w-3.5 h-3.5" />
                        ذخیره
                      </button>
                      <button onClick={cancelEdit} className="btn-secondary text-sm flex items-center gap-1.5">
                        <FiX className="w-3.5 h-3.5" />
                        لغو
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className={`font-heading text-5xl font-extrabold mb-1 ${hl}`}>{plan.duration}</div>
                      <div className="text-zinc-500 text-sm">ماه</div>
                      <div className="divider-glow my-4" />
                      <div className="font-heading text-2xl font-bold text-white">{plan.price?.toLocaleString('fa-IR')}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">تومان</div>
                      <div className="mt-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-zinc-300 border border-white/10">
                          {plan.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => startEdit(plan)} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1.5">
                        <FiEdit2 className="w-3 h-3" />
                        ویرایش
                      </button>
                      <button onClick={() => toggleActive(plan)}
                        className={`text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-200 ${
                          plan.isActive
                            ? 'bg-acid-400/20 text-acid-400 border-acid-400/30 hover:bg-acid-400/30'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                        }`}>
                        {plan.isActive ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                        {plan.isActive ? 'فعال' : 'غیرفعال'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
