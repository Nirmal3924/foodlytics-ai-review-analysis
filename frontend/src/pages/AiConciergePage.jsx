import { useState } from 'react'
import { FiArrowRight, FiSend, FiMessageSquare } from 'react-icons/fi'
import { useOutletContext } from 'react-router-dom'
import { restaurantService } from '../services/api'

export default function AiConciergePage() {
  const { city, navigate } = useOutletContext()

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const SUGGESTIONS = [
    "Need a cozy cafe for work",
    "Late-night food with friends",
    "Romantic rooftop dinner",
    "Budget-friendly Punjabi food"
  ]

  const onSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!query.trim()) return
    
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const res = await restaurantService.aiChat({
        query: query.trim(),
        city,
      })
      setResult(res)
    } catch (err) {
      setError(err.message || 'Failed to get AI recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (sug) => {
    setQuery(sug)
  }

  const onReset = () => {
    setResult(null)
    setQuery('')
  }
  
  const onSelectRestaurant = (id) => navigate(`/restaurant/${id}`)

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto py-6">
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-8 py-8 border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-orange-200">
              ✨
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">AI Food Concierge</h2>
              <p className="text-sm text-gray-600 font-medium mt-1">Chat with our AI to find exactly what you're craving in {city}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          {!result && !loading && (
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-orange-500 mb-4 shadow-sm border border-orange-100">
                <FiMessageSquare size={28} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">How can I help you today?</h3>
              <p className="text-sm text-gray-500 font-medium mb-8">
                Type what you're looking for, in your own words. I'll understand your mood, budget, and cravings.
              </p>

              <form onSubmit={onSubmit} className="relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 'Need a cozy cafe with wifi near me'"
                  className="w-full bg-white border-2 border-gray-200 rounded-2xl py-4 pl-6 pr-16 text-gray-800 font-medium text-lg outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm group-hover:border-gray-300"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="absolute right-2 top-2 bottom-2 aspect-square bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-md disabled:shadow-none"
                >
                  <FiSend size={20} />
                </button>
              </form>

              <div className="mt-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Try asking</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(sug)}
                      className="px-4 py-2 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 text-gray-600 hover:text-orange-700 text-sm font-medium rounded-full transition-all cursor-pointer shadow-sm"
                    >
                      "{sug}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-orange-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
              </div>
              <h3 className="text-2xl font-black text-gray-900">AI Concierge is analyzing your request...</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-3 font-medium">Extracting intent, filtering menus, and analyzing Zomato review sentiment in {city}.</p>
            </div>
          )}

          {result && !loading && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              {/* AI Message */}
              <div className="flex gap-4 mb-8 bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                <div className="w-12 h-12 shrink-0 rounded-full bg-white shadow-sm border border-orange-200 flex items-center justify-center text-2xl">
                  🤖
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">AI Concierge</h4>
                  <p className="text-gray-700 text-sm leading-relaxed font-medium">
                    {result.message}
                  </p>
                  
                  {/* Extracted Intent Pills */}
                  {result.filters && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {Object.entries(result.filters).map(([key, val]) => {
                        if (!val) return null;
                        return (
                          <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-orange-200 text-[11px] font-bold text-orange-800 shadow-sm">
                            <span className="uppercase opacity-60">{key}:</span> {val}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <span>🎯</span> Your Curated Picks
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">Found {result.restaurants.length} matches tailored for your request</p>
                </div>
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-all shadow-sm cursor-pointer"
                >
                  🔄 New Query
                </button>
              </div>

              {result.restaurants.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🤷</div>
                  <h4 className="text-lg font-bold text-gray-900">No perfect matches found</h4>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your request or searching for something else.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.restaurants.map(p => (
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
