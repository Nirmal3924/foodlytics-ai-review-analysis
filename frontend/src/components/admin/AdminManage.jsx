import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'

const CAT_COLOR = { 
  'Top Restaurant': 'text-[#cc7700]', 
  'Popular': 'text-[#2e7d32]', 
  'Hidden Gem': 'text-[#1565c0]', 
  'Overrated': 'text-[#c62828]' 
}
const CAT_BG = { 
  'Top Restaurant': 'bg-[#fff5e6]', 
  'Popular': 'bg-[#e8f5e9]', 
  'Hidden Gem': 'bg-[#e3f2fd]', 
  'Overrated': 'bg-[#fce4ec]' 
}
const CATEGORIES = ['Top Restaurant', 'Popular', 'Hidden Gem', 'Overrated']
const LOCATIONS = ['Gachibowli', 'Banjara Hills', 'Jubilee Hills', 'Hitech City', 'Madhapur', 'Kondapur', 'Kukatpally', 'Begumpet', 'Ameerpet', 'Secunderabad']

export default function AdminManage() {
  const lightMode = localStorage.getItem('zl_theme') !== 'dark'

  const [restaurants, setRestaurants] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const [addMode, setAddMode] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({})
  const PER_PAGE = 10

  const load = async (p = page) => {
    setLoading(true)
    try {
      const res = await adminService.getRestaurants(p)
      setRestaurants(res)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [page])

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2800) }

  const openEdit = r => {
    setForm({ ...r })
    setEditTarget(r)
    setAddMode(false)
  }

  const openAdd = () => {
    setForm({ name: '', avg_rating: '', cost: '', location: LOCATIONS[0], category: CATEGORIES[0], cuisines: '' })
    setAddMode(true)
    setEditTarget(null)
  }

  const closeModal = () => { setEditTarget(null); setAddMode(false) }

  const handleSave = async () => {
    try {
      if (addMode) {
        await adminService.createRestaurant(form)
        showToast('✓ Restaurant added to database')
      } else {
        await adminService.updateRestaurant(editTarget.id, form)
        showToast('✓ Restaurant updated')
      }
      closeModal()
      load()
    } catch (e) { showToast('Error: ' + e.message) }
  }

  const handleDelete = async r => {
    if (!window.confirm(`Delete "${r.name}"? This cannot be undone.`)) return
    try {
      await adminService.deleteRestaurant(r.id)
      showToast(`✓ "${r.name}" deleted`)
      load()
    } catch (e) { showToast('Error: ' + e.message) }
  }

  const tableCard = lightMode ? 'bg-white border border-black/10' : 'bg-[#0d1b2e] border border-[#223650]'
  const tableHead = lightMode ? 'bg-[#fafaf8]' : 'bg-[#12233a]'
  const rowHover = lightMode ? 'hover:bg-[#fafaf8]' : 'hover:bg-[#12233a]'
  const titleText = lightMode ? 'text-gray-900' : 'text-white'
  const mutedText = lightMode ? 'text-gray-500' : 'text-[#9cadc5]'
  const mutedText2 = lightMode ? 'text-gray-600' : 'text-[#9cadc5]'
  const actionBorderLight = 'border-blue-200'
  const actionBorderDark = 'border-blue-900/40'

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between mb-5 gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${titleText}`}>Manage Restaurants</h1>
          <p className={`text-sm ${mutedText}`}>View, create, edit, and delete restaurant records</p>
        </div>
        <button 
          onClick={openAdd}
          className="px-[18px] py-2.5 bg-[#E8401C] hover:bg-[#c7340f] text-white rounded-[10px] text-sm font-semibold transition-colors whitespace-nowrap shadow-sm"
        >
          + Add Restaurant
        </button>
      </div>

      {loading ? (
        <div className={`flex items-center justify-center h-40 text-sm ${lightMode ? 'text-gray-400' : 'text-[#9cadc5]'}`}>Loading…</div>
      ) : (
        <div className={`rounded-xl overflow-hidden shadow-sm ${tableCard}`}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px] text-left">
              <thead>
                <tr className={tableHead}>
                  {['Name', 'Rating', 'Category', 'Location', 'Cost (₹)', 'Cuisines', 'Actions'].map(h => (
                    <th
                      key={h}
                      className={`px-[14px] py-[11px] text-[11px] font-semibold uppercase tracking-wider border-b ${
                        lightMode ? 'text-gray-400 border-black/5' : 'text-[#9cadc5] border-[#223650]'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={lightMode ? 'divide-y divide-black/5' : 'divide-y divide-[#223650]'}>
                {restaurants.map(r => (
                  <tr key={r.id} className={`${rowHover} transition-colors`}>
                    <td className={`px-[14px] py-[11px] font-medium max-w-[180px] truncate ${lightMode ? 'text-gray-900' : 'text-white/90'}`}>
                      {r.name}
                    </td>
                    <td className="px-[14px] py-[11px]">
                      <span className={`font-bold ${r.avg_rating >= 4.5 ? 'text-green-500' : r.avg_rating >= 4 ? 'text-amber-500' : 'text-red-500'}`}>
                        ★ {r.avg_rating?.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-[14px] py-[11px]">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${CAT_BG[r.category]} ${CAT_COLOR[r.category]}`}>
                        {r.category}
                      </span>
                    </td>
                    <td className={`px-[14px] py-[11px] ${mutedText2}`}>{r.location}</td>
                    <td className={`px-[14px] py-[11px] ${mutedText2}`}>{r.cost?.toLocaleString()}</td>
                    <td className={`px-[14px] py-[11px] ${lightMode ? 'text-gray-400' : 'text-[#9cadc5]'} max-w-[160px] truncate`}>{r.cuisines}</td>
                    <td className="px-[14px] py-[11px] whitespace-nowrap space-x-2">
                      <button 
                        onClick={() => openEdit(r)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium hover:opacity-80 transition-opacity ${
                          lightMode
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-[#0b2140] text-[#93c5fd] border-blue-900/40'
                        }`}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(r)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium hover:opacity-80 transition-opacity ${
                          lightMode
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-[#3b0b0b] text-[#fca5a5] border-red-900/40'
                        }`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={`flex items-center justify-between p-4 border-t text-[13px] ${lightMode ? 'border-black/5 text-gray-500' : 'border-[#223650] text-[#9cadc5]'}`}>
            <span>Page {page}</span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className={`px-3 py-1 border rounded-md hover:bg-[#f5f5f2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                  lightMode ? 'border-gray-300 bg-white' : 'border-[#223650] bg-[#0d1b2e] hover:bg-[#12233a]'
                }`}
              >
                ← Prev
              </button>
              <button 
                disabled={restaurants.length < PER_PAGE}
                onClick={() => setPage(p => p + 1)}
                className={`px-3 py-1 border rounded-md hover:bg-[#f5f5f2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                  lightMode ? 'border-gray-300 bg-white' : 'border-[#223650] bg-[#0d1b2e] hover:bg-[#12233a]'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {(editTarget || addMode) && (
        <div 
          className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-5"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className={`rounded-2xl p-7 w-full max-w-[480px] shadow-2xl animate-[slideUp_0.22s_ease] ${lightMode ? 'bg-white' : 'bg-[#0d1b2e]'}`}>
            <h2 className={`text-lg font-bold mb-5 ${lightMode ? 'text-gray-900' : 'text-white'}`}>{addMode ? 'Add Restaurant' : 'Edit Restaurant'}</h2>

            <div className="flex flex-col mb-3.5">
              <label className={`text-xs font-semibold mb-1 ${lightMode ? 'text-gray-500' : 'text-[#9cadc5]'}`}>Name</label>
              <input 
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E8401C]/20 focus:border-[#E8401C] outline-none transition-all ${
                  lightMode ? 'border-gray-200 bg-white' : 'border-[#223650] bg-[#07111f] text-white'
                }`}
                value={form.name || ''} 
                onChange={e => setForm(f => ({...f, name: e.target.value}))} 
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              <div className="flex flex-col">
                <label className={`text-xs font-semibold mb-1 ${lightMode ? 'text-gray-500' : 'text-[#9cadc5]'}`}>Avg Rating</label>
                <input 
                  type="number" step="0.1" min="1" max="5" 
                  className={`border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E8401C]/20 focus:border-[#E8401C] outline-none ${
                    lightMode ? 'border-gray-200 bg-white' : 'border-[#223650] bg-[#07111f] text-white'
                  }`}
                  value={form.avg_rating || ''} 
                  onChange={e => setForm(f => ({...f, avg_rating: e.target.value}))} 
                />
              </div>
              <div className="flex flex-col">
                <label className={`text-xs font-semibold mb-1 ${lightMode ? 'text-gray-500' : 'text-[#9cadc5]'}`}>Cost (₹)</label>
                <input 
                  type="number" 
                  className={`border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#E8401C]/20 focus:border-[#E8401C] outline-none ${
                    lightMode ? 'border-gray-200 bg-white' : 'border-[#223650] bg-[#07111f] text-white'
                  }`}
                  value={form.cost || ''} 
                  onChange={e => setForm(f => ({...f, cost: e.target.value}))} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              <div className="flex flex-col">
                <label className={`text-xs font-semibold mb-1 ${lightMode ? 'text-gray-500' : 'text-[#9cadc5]'}`}>Location</label>
                <select 
                  className={`border rounded-lg px-3 py-2 text-sm outline-none ${
                    lightMode ? 'border-gray-200 bg-white' : 'border-[#223650] bg-[#07111f] text-white'
                  }`}
                  value={form.location || ''} 
                  onChange={e => setForm(f => ({...f, location: e.target.value}))}
                >
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className={`text-xs font-semibold mb-1 ${lightMode ? 'text-gray-500' : 'text-[#9cadc5]'}`}>Category</label>
                <select 
                  className={`border rounded-lg px-3 py-2 text-sm outline-none ${
                    lightMode ? 'border-gray-200 bg-white' : 'border-[#223650] bg-[#07111f] text-white'
                  }`}
                  value={form.category || ''} 
                  onChange={e => setForm(f => ({...f, category: e.target.value}))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col mb-5">
              <label className={`text-xs font-semibold mb-1 ${lightMode ? 'text-gray-500' : 'text-[#9cadc5]'}`}>Cuisines</label>
              <input 
                className={`border rounded-lg px-3 py-2 text-sm outline-none ${
                  lightMode ? 'border-gray-200 bg-white' : 'border-[#223650] bg-[#07111f] text-white'
                }`}
                value={form.cuisines || ''} 
                onChange={e => setForm(f => ({...f, cuisines: e.target.value}))} 
                placeholder="e.g. North Indian, Chinese" 
              />
            </div>

            <div className="flex gap-2.5 justify-end">
              <button
                onClick={closeModal}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 ${
                  lightMode ? 'border border-gray-300 bg-white text-gray-600' : 'border border-[#223650] bg-[#07111f] text-[#9cadc5] hover:bg-[#12233a]'
                }`}
              >
                Cancel
              </button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-[#E8401C] text-white rounded-lg text-sm font-semibold hover:bg-[#c7340f] transition-colors">
                {addMode ? 'Add Restaurant' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1a1a1a] text-white px-5 py-3 rounded-xl text-sm z-[999] shadow-2xl animate-[slideUp_0.3s_ease]">
          {toast}
        </div>
      )}
    </div>
  )
}