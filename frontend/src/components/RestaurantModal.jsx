import { useState, useEffect, useRef } from 'react'
import { restaurantService } from '../services/api'

const CUISINE_EMOJI = {
  'Biryani':'🍛','Pizza':'🍕','Burger':'🍔','Seafood':'🦞','Desserts':'🍰',
  'Ice Cream':'🍦','Cafe':'☕','BBQ':'🔥','Chinese':'🥢','Italian':'🍝',
  'American':'🍟','Bakery':'🥐','Momos':'🥟','Fast Food':'🍟','Kebab':'🥙',
  'default':'🍽️',
}

function getCuisineEmoji(c='') {
  for (const [k,v] of Object.entries(CUISINE_EMOJI)) if (c.includes(k)) return v
  return CUISINE_EMOJI.default
}

function getSentiment(rating) {
  if (rating >= 4.5) return { label:'Very Positive', pct:95, color:'#22c55e' }
  if (rating >= 4.0) return { label:'Positive',      pct:78, color:'#84cc16' }
  if (rating >= 3.5) return { label:'Mixed',          pct:55, color:'#f59e0b' }
  if (rating >= 3.0) return { label:'Negative',       pct:35, color:'#f97316' }
  return                { label:'Very Negative',  pct:15, color:'#ef4444' }
}

export default function RestaurantModal({ id, onClose }) {
  const [restaurant, setRestaurant] = useState(null)
  const [reviews,    setReviews]    = useState([])
  const [reviewPage, setReviewPage] = useState(1)
  const [totalRev,   setTotalRev]   = useState(0)
  const [loading,    setLoading]    = useState(true)
  const backdropRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    restaurantService.getOne(id)
      .then(r => { setRestaurant(r); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    restaurantService.getReviews(id, reviewPage)
      .then(d => { setReviews(d.reviews); setTotalRev(d.total) })
      .catch(() => {})
  }, [id, reviewPage])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleBackdrop = e => { if (e.target === backdropRef.current) onClose() }

  if (loading) return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-5 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-[20px] w-full max-w-[580px] h-[300px] flex items-center justify-center shadow-2xl">
        <div className="text-gray-400">Loading…</div>
      </div>
    </div>
  )

  if (!restaurant) return null

  const r = restaurant
  const s = getSentiment(r.avg_rating)
  const emoji = getCuisineEmoji(r.cuisines)
  const totalPages = Math.ceil(totalRev / 10)

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-5 animate-in fade-in duration-200" 
      ref={backdropRef} 
      onClick={handleBackdrop} 
      role="dialog" 
      aria-modal="true"
    >
      <div className="bg-white rounded-[20px] w-full max-w-[580px] max-h-[88vh] flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.28)] animate-in slide-in-from-bottom-5 duration-300">

        {/* Header */}
        <div className="p-6 pb-0 relative shrink-0">
          <button 
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors" 
            onClick={onClose}
          >✕</button>
          <div className="text-[48px] mb-2">{emoji}</div>
          <h2 className="text-[22px] font-bold text-gray-900 mb-1">{r.name}</h2>
          <p className="text-sm text-gray-400 mb-4">{r.cuisines}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 px-6 pb-4 shrink-0">
          {[
            { val: r.avg_rating?.toFixed(1), label: 'Avg Rating' },
            { val: r.review_count,           label: 'Reviews'    },
            { val: `₹${r.cost?.toLocaleString()}`, label: 'For Two' },
          ].map(({ val, label }) => (
            <div key={label} className="bg-[#fafaf8] rounded-[10px] p-3 text-center">
              <div className="text-[22px] font-bold text-[#E8401C]">{val}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 scrollbar-thin">
          
          {/* Details Section */}
          <section className="mb-5">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Details</h3>
            <div className="flex gap-2 items-start text-sm mb-1.5 text-gray-700"><span>📍</span><span>{r.location}, Hyderabad</span></div>
            {r.timings && <div className="flex gap-2 items-start text-sm mb-1.5 text-gray-700"><span>🕐</span><span>{r.timings}</span></div>}
            <div className="flex gap-2 items-start text-sm mb-1.5 text-gray-700"><span>🏷️</span><span>{r.category}</span></div>
          </section>

          {/* Sentiment Analysis */}
          <section className="mb-5">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Sentiment Analysis</h3>
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] text-gray-600 min-w-[110px]">{s.label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700" 
                  style={{ width: `${s.pct}%`, backgroundColor: s.color }} 
                />
              </div>
              <span className="text-[13px] font-bold min-w-[36px] text-right" style={{ color: s.color }}>{s.pct}%</span>
            </div>
            {r.sentiment_score != null && (
              <p className="text-[12px] text-gray-400 mt-1.5">
                Lexicon score: {(r.sentiment_score * 100).toFixed(1)}%
              </p>
            )}
          </section>

          {/* Reviews Section */}
          <section className="mb-5">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
              Reviews {totalRev > 0 && <span className="text-gray-400 font-normal">({totalRev})</span>}
            </h3>

            {reviews.length === 0 ? (
              <p className="text-gray-400 text-[13px]">No reviews available.</p>
            ) : (
              <div className="space-y-2.5">
                {reviews.map(rv => (
                  <div key={rv.id} className="bg-[#fafaf8] rounded-[10px] p-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[13px] font-semibold text-gray-800">{rv.reviewer || 'Anonymous'}</span>
                      <span className="text-[14px] text-[#f59e0b] tracking-tighter">
                        {'★'.repeat(rv.rating ?? 0)}
                        <span className="text-gray-200">{'★'.repeat(5 - (rv.rating ?? 0))}</span>
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-600 leading-relaxed italic">"{rv.review_text}"</p>
                    <p className="text-[11px] text-gray-400 mt-1">{rv.review_time}</p>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between py-2.5">
                    <button 
                      disabled={reviewPage === 1} 
                      onClick={() => setReviewPage(p => p - 1)} 
                      className="px-3.5 py-1.5 border border-gray-200 rounded-lg bg-white text-[13px] text-gray-600 hover:enabled:bg-gray-50 disabled:opacity-40 transition-colors"
                    >← Prev</button>
                    <span className="text-[13px] text-gray-400">Page {reviewPage} of {totalPages}</span>
                    <button 
                      disabled={reviewPage === totalPages} 
                      onClick={() => setReviewPage(p => p + 1)} 
                      className="px-3.5 py-1.5 border border-gray-200 rounded-lg bg-white text-[13px] text-gray-600 hover:enabled:bg-gray-50 disabled:opacity-40 transition-colors"
                    >Next →</button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-black/5 shrink-0">
          <button 
            className="w-full py-[11px] bg-[#E8401C] hover:bg-[#c7340f] text-white rounded-[10px] text-[15px] font-semibold transition-colors" 
            onClick={onClose}
          >Close</button>
        </div>
      </div>
    </div>
  )
}