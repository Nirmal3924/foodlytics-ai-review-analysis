import { FiX, FiArrowRight } from 'react-icons/fi'

export default function AiConciergeModal({
  isOpen,
  onClose,
  onSubmit,
  mood,
  setMood,
  cuisine,
  setCuisine,
  budget,
  setBudget,
  notes,
  setNotes,
  loading,
  error,
  picks,
  onSelectRestaurant,
  onReset
}) {
  if (!isOpen) return null

  const MOODS = [
    { id: 'Romantic Date', icon: '🍷', label: 'Romantic Date', desc: 'Candlelight & intimacy' },
    { id: 'Casual Hangout', icon: '🍕', label: 'Casual Hangout', desc: 'Chill & fun vibe' },
    { id: 'Family Dinner', icon: '👨‍👩‍👧‍👦', label: 'Family Dinner', desc: 'Spacious & hearty' },
    { id: 'Party / Celebration', icon: '🥳', label: 'Party & Drinks', desc: 'Music & high energy' },
    { id: 'Late Night Munchies', icon: '🌙', label: 'Late Night Munch', desc: 'Midnight cravings' },
    { id: 'Work / Client Meeting', icon: '💼', label: 'Work Meeting', desc: 'Quiet & professional' },
    { id: 'Healthy / Clean Eating', icon: '🥗', label: 'Clean Eating', desc: 'Wholesome & fresh' },
  ]

  const CUISINES = ['Any', 'North Indian', 'South Indian', 'Chinese', 'Italian', 'Fast Food', 'Desserts', 'Cafe', 'Biryani', 'Beverages']

  const BUDGETS = [
    { id: 'budget', label: 'Pocket Friendly (< ₹500)', icon: '💸' },
    { id: 'mid', label: 'Mid-Range (₹500 - ₹1200)', icon: '💰' },
    { id: 'premium', label: 'Premium / Fine (> ₹1200)', icon: '👑' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-300/50 border border-gray-100 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden relative">
        {/* Modal Header */}
        <div className="bg-gray-50/80 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl border border-orange-100 shadow-sm">
              ✨
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI Food Concierge</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Tell AI what you're craving, and let magic happen</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center border border-gray-100 transition-colors shadow-sm"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 overflow-y-auto flex-1 no-scrollbar">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-3xl">🤖</div>
              </div>
              <h3 className="text-2xl font-black text-gray-900">AI Concierge is scanning menus...</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-2 font-medium">Matching your mood "{mood}" with Zomato review sentiment and menu collections across the city.</p>
            </div>
          ) : picks ? (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <span>🎯</span> Your Personalized Match Results
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">Found {picks.length} flawless options tailored for your {mood} vibe</p>
                </div>
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-all shadow-sm"
                >
                  🔄 Change Vibe
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {picks.map(p => (
                  <article
                    key={p.restaurant.id}
                    onClick={() => onSelectRestaurant(p.restaurant.id)}
                    className="group cursor-pointer overflow-hidden rounded-[16px] border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(0,0,0,0.11)] p-5 flex flex-col justify-between relative"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="text-[18px] font-semibold text-[#1a1a1a] group-hover:text-orange-600 transition-colors leading-tight">{p.restaurant.name}</h4>
                          <p className="text-[13px] text-[#888] mt-1">{p.restaurant.area || p.restaurant.city} • {p.restaurant.cuisines}</p>
                        </div>
                        <span className="rounded-full px-3 py-1 text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 shrink-0">
                          ✨ {p.match_score}% Match
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[13px] text-[#666] mb-4">
                        <span className="flex items-center gap-1 font-bold text-[#f59e0b]">
                          ★ {parseFloat(p.restaurant.avg_rating).toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>₹{p.restaurant.cost || 400} for two</span>
                        {p.restaurant.timings && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 truncate max-w-[150px]">🕒 {p.restaurant.timings}</span>
                          </>
                        )}
                      </div>

                      <div className="rounded-xl bg-orange-50/60 border border-orange-100 p-4 relative mt-2">
                        <div className="absolute -top-2.5 left-4 bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-orange-200">
                          🤖 AI Insights
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed italic pt-1">
                          "{p.reason}"
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                      <span>Explore details & reviews</span>
                      <FiArrowRight size={16} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Mood section */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 ml-1">
                  <span className="w-5 h-5 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-[10px] font-bold border border-orange-100">1</span>
                  <span>What's the vibe or mood?</span> <span className="text-orange-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {MOODS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between text-left cursor-pointer ${
                        mood === m.id
                          ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-md shadow-orange-100/50 scale-[1.02]'
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm text-gray-800'
                      }`}
                    >
                      <div className="text-2xl mb-2 flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100">{m.icon}</div>
                      <div>
                        <div className="font-bold text-sm text-gray-900 leading-tight">{m.label}</div>
                        <div className="text-[11px] text-gray-500 mt-1 font-medium">{m.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisine section */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 ml-1">
                  <span className="w-5 h-5 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-[10px] font-bold border border-orange-100">2</span>
                  <span>Preferred Cuisine or Craving</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CUISINES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCuisine(c)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border whitespace-nowrap ${
                        cuisine === c
                          ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {c === 'Any' ? '✨ Any Cuisine' : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget section */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 ml-1">
                  <span className="w-5 h-5 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-[10px] font-bold border border-orange-100">3</span>
                  <span>Budget Level</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BUDGETS.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudget(b.id)}
                      className={`p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                        budget === b.id
                          ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-sm font-bold'
                          : 'bg-white border-gray-100 hover:border-gray-200 text-gray-700 font-medium'
                      }`}
                    >
                      <span className="text-2xl">{b.icon}</span>
                      <span className="text-xs">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes section */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2 ml-1">
                  <span className="w-5 h-5 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-[10px] font-bold border border-orange-100">4</span>
                  <span>Specific Preferences or Diet (Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Quiet corner, rooftop ambiance, vegan pasta, wheelchair accessible..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-gray-300 text-sm"
                />
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:bg-orange-700 active:scale-[0.98]"
                >
                  <span>✨ Get My AI Recommendations</span>
                  <FiArrowRight size={18} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
