import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { restaurantService } from '../services/api'
import { getRestaurantImage } from '../utils/restaurantImages'
import RestaurantHours from '../components/RestaurantHours'
import { getTodayKey, isOpenAt, parseTimings } from '../utils/timingsParser'
import { FiArrowLeft, FiMapPin, FiTrendingUp, FiThumbsDown, FiThumbsUp, FiClock, FiTag, FiStar, FiMessageSquare, FiExternalLink, FiCpu, FiTarget, FiActivity, FiBookmark } from 'react-icons/fi'

function getSentimentLabel(rating) {
  if (rating >= 4) return { text: 'Positive', class: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' }
  if (rating >= 3) return { text: 'Mixed', class: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' }
  return { text: 'Negative', class: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' }
}

function getRatingDistribution(reviews) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach(rv => {
    const r = rv.rating
    if (r >= 1 && r <= 5) dist[r] = (dist[r] || 0) + 1
  })
  const total = reviews.length || 1
  return {
    5: Math.round((dist[5] / total) * 100),
    4: Math.round((dist[4] / total) * 100),
    3: Math.round((dist[3] / total) * 100),
    2: Math.round((dist[2] / total) * 100),
    1: Math.round((dist[1] / total) * 100),
  }
}

export default function RestaurantDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [reviews, setReviews] = useState([])
  const [totalRev, setTotalRev] = useState(0)
  const [reviewPage, setReviewPage] = useState(1)
  const [showAll, setShowAll] = useState(false)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved_restaurants') || '[]')
    setIsSaved(saved.some(r => String(r.id) === String(id)))
  }, [id])

  const toggleSave = () => {
    if (!restaurant) return
    const saved = JSON.parse(localStorage.getItem('saved_restaurants') || '[]')
    if (isSaved) {
      const newSaved = saved.filter(r => String(r.id) !== String(id))
      localStorage.setItem('saved_restaurants', JSON.stringify(newSaved))
      setIsSaved(false)
    } else {
      saved.push(restaurant)
      localStorage.setItem('saved_restaurants', JSON.stringify(saved))
      setIsSaved(true)
    }
  }

  useEffect(() => {
    let alive = true
    setLoading(true)
    const loadRestaurant = async () => {
      try {
        const [r, d] = await Promise.all([
          restaurantService.getOne(id),
          restaurantService.getReviews(id, 1),
        ])

        const allPages = await Promise.all([
          restaurantService.getAll({ page: 1, per_page: 50 }),
          restaurantService.getAll({ page: 2, per_page: 50 }),
          restaurantService.getAll({ page: 3, per_page: 50 }),
        ])
        const allRestaurants = allPages.flatMap(page => page.restaurants || [])
        const unique = allRestaurants.filter((item, idx, self) => self.findIndex(t => t.id === item.id) === idx)
        const scored = unique
          .filter(item => String(item.id) !== String(id))
          .map(item => getSimilarNearbyScore(r, item))
          .filter(item => item.sharedFoodCount > 0 || item.sameLocation)
          .sort((a, b) => {
            if (b.sharedFoodCount !== a.sharedFoodCount) return b.sharedFoodCount - a.sharedFoodCount
            if (Number(b.sameLocation) !== Number(a.sameLocation)) return Number(b.sameLocation) - Number(a.sameLocation)
            return b.matchScore - a.matchScore
          })

        if (!alive) return
        setRestaurant(r)
        setReviews(d.reviews)
        setTotalRev(d.total)
        setSimilar(scored.slice(0, 5))
        setLoading(false)

        // Save to view history
        try {
          const currentHistory = JSON.parse(localStorage.getItem('view_history') || '[]')
          const newHistory = [r, ...currentHistory.filter(item => String(item.id) !== String(r.id))].slice(0, 20)
          localStorage.setItem('view_history', JSON.stringify(newHistory))
        } catch (e) {
          console.error("Could not save history", e)
        }
      } catch {
        if (alive) setLoading(false)
      }
    }

    loadRestaurant()
    return () => { alive = false }
  }, [id])

  useEffect(() => {
    if (reviewPage === 1) return
    restaurantService.getReviews(id, reviewPage)
      .then(d => { setReviews(d.reviews); setTotalRev(d.total) })
      .catch(() => {})
  }, [id, reviewPage])

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400 text-sm font-medium">Loading restaurant...</p>
      </div>
    )
  }

  const r = restaurant
  const dist = getRatingDistribution(reviews)
  const totalPages = Math.ceil(totalRev / 10)
  const positivePct = r.sentiment_score != null ? Math.round(r.sentiment_score * 100) : Math.round((reviews.filter(rv => (rv.rating || 0) >= 4).length / (reviews.length || 1)) * 100)
  const negativePct = Math.max(0, 100 - positivePct)
  const categoryColor = r.category === 'Top Restaurant' ? 'bg-purple-100 text-purple-700' : r.category === 'Hidden Gem' ? 'bg-emerald-100 text-emerald-700' : r.category === 'Overrated' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
  const aiSignals = getAiSignals(r, positivePct)
  const keywords = getReviewKeywords(reviews)
  const maxKeywordCount = keywords[0]?.count || 1
  const maxMatchScore = Math.max(...similar.map(item => item.matchScore || 0), 1)
  const imageSrc = getRestaurantImage(r.name)
  const todayHours = parseTimings(r.timings)[getTodayKey()]
  const openNow = isOpenAt(todayHours)

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 font-sans transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-between transition-colors duration-300">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-800"
        >
          <FiArrowLeft /> Back
        </button>
        <div className="text-xl font-black tracking-tight">
          <span className="text-orange-600">Foodly</span>
          <span className="text-gray-900 dark:text-white">tics</span>
        </div>
      </nav>

      <div className="p-3 md:p-4">
        <div className="max-w-screen-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300">

          {/* 1. Header Section */}
          <div className="p-6 pb-2 flex flex-col md:flex-row justify-between items-start gap-3">
            <div className="flex flex-col sm:flex-row gap-4 min-w-0">
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt={r.name}
                  className="h-28 w-full rounded-2xl object-cover sm:w-40"
                />
              )}
              <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{r.name}</h1>
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md text-sm font-bold flex items-center gap-1">
                  <FiStar className="text-orange-500" /> {r.avg_rating?.toFixed(1)}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${categoryColor}`}>
                  {r.category}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-gray-500 dark:text-gray-400 text-sm">
                <span className="flex items-center gap-1"><FiMapPin className="text-red-400"/> {[r.area, r.city].filter(Boolean).join(', ') || '—'}</span>
                <span className="flex items-center gap-1"><FiTag className="text-blue-400"/> {r.cuisines}</span>
                <span className={`flex items-center gap-1 font-semibold ${openNow ? 'text-emerald-600' : 'text-rose-600'}`}>
                  <FiClock className={openNow ? 'text-emerald-500' : 'text-rose-500'} />
                  {openNow ? 'Open Now' : 'Closed'}
                </span>
                <span>₹{r.cost?.toLocaleString()} for two</span>
              </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              <button
                onClick={toggleSave}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm border ${
                  isSaved 
                    ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500 border-orange-200 dark:border-orange-800' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <FiBookmark className={isSaved ? "fill-current" : ""} /> {isSaved ? 'Saved' : 'Save'}
              </button>
              {r.link && (
                <a
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#E8401C] hover:bg-[#c7340f] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm"
                >
                  <FiExternalLink /> View
                </a>
              )}
            </div>
          </div>

          {/* 2. Main Content Grid */}
          <div className="p-6 grid grid-cols-12 gap-6">

            {/* LEFT COLUMN (Main Analysis) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">

              {/* AI Insights Card */}
              <div className="bg-[#F8FAFC] dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div>
                      <h3 className="text-[10px] font-bold text-blue-400 dark:text-blue-300 uppercase tracking-[2px] mb-2 flex items-center gap-2">
                         <span className="w-4 h-4 rounded-full border border-blue-400 dark:border-blue-300 flex items-center justify-center text-[8px]">i</span>
                         AI Insights & Analysis
                      </h3>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold mb-2 inline-block ${categoryColor}`}>
                        {r.category}
                      </span>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-md">
                        Based on our sentiment engine processing <b className="dark:text-white">{r.review_count} reviews</b>,
                        {r.name} maintains a <b className="dark:text-white">{positivePct >= 70 ? 'strongly positive' : positivePct >= 50 ? 'mixed' : 'negative'}</b> sentiment score.
                      </p>
                    </div>

                    {/* Dynamic Donut Chart */}
                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="50" className="stroke-[#E2E8F0] dark:stroke-gray-600" strokeWidth="12" fill="transparent" />
                        <circle cx="64" cy="64" r="50" stroke={positivePct >= 70 ? '#10B981' : positivePct >= 50 ? '#F59E0B' : '#EF4444'} strokeWidth="12" fill="transparent"
                          strokeDasharray="314" strokeDashoffset={314 - (314 * positivePct / 100)} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-bold dark:text-white">{positivePct}%</span>
                      </div>
                    </div>
                 </div>

                 <div className="flex gap-3">
                    <div className="bg-[#F0FDF4] dark:bg-green-900/20 p-3 rounded-xl flex-1 border border-green-100 dark:border-green-900/50">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold mb-1">
                        <FiThumbsUp /> {positivePct}%
                      </div>
                      <div className="text-[10px] text-green-600 dark:text-green-500 font-bold uppercase tracking-wider">Positive Sentiment</div>
                    </div>
                    <div className="bg-[#FEF2F2] dark:bg-red-900/20 p-3 rounded-xl flex-1 border border-red-100 dark:border-red-900/50">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-1">
                        <FiThumbsDown /> {negativePct}%
                      </div>
                      <div className="text-[10px] text-red-600 dark:text-red-500 font-bold uppercase tracking-wider">Negative Sentiment</div>
                    </div>
                 </div>
              </div>

              {/* AI Signal Graphs */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <FiCpu className="text-indigo-500" /> AI Feature Score
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">Rating, sentiment, value and popularity signals</p>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                      ML Ready
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-[184px] h-[184px] shrink-0">
                      <svg viewBox="0 0 184 184" className="w-full h-full">
                        {[0.35, 0.7, 1].map(level => (
                          <polygon
                            key={level}
                            points={aiSignals.map((_, index) => {
                              const angle = ((Math.PI * 2) / aiSignals.length) * index - Math.PI / 2
                              const distance = 70 * level
                              return `${92 + Math.cos(angle) * distance},${92 + Math.sin(angle) * distance}`
                            }).join(' ')}
                            fill="none"
                            stroke="#E5E7EB"
                            strokeWidth="1"
                          />
                        ))}
                        {aiSignals.map((signal, index) => {
                          const angle = ((Math.PI * 2) / aiSignals.length) * index - Math.PI / 2
                          const x = 92 + Math.cos(angle) * 72
                          const y = 92 + Math.sin(angle) * 72
                          return <line key={signal.label} x1="92" y1="92" x2={x} y2={y} stroke="#EEF2F7" strokeWidth="1" />
                        })}
                        <polygon points={getRadarPoints(aiSignals)} fill="rgba(99, 102, 241, 0.18)" stroke="#6366F1" strokeWidth="3" />
                        {aiSignals.map((signal, index) => {
                          const angle = ((Math.PI * 2) / aiSignals.length) * index - Math.PI / 2
                          const distance = 70 * (signal.value / 100)
                          const x = 92 + Math.cos(angle) * distance
                          const y = 92 + Math.sin(angle) * distance
                          return <circle key={signal.label} cx={x} cy={y} r="4" fill={signal.color} />
                        })}
                      </svg>
                    </div>

                    <div className="w-full space-y-2">
                      {aiSignals.map(signal => (
                        <div key={signal.label}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-gray-600 dark:text-gray-300">{signal.label}</span>
                            <span className="font-bold" style={{ color: signal.color }}>{signal.value}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${signal.value}%`, background: signal.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <FiActivity className="text-emerald-500" /> Review NLP Signals
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">Keyword extraction from visible reviews</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg">
                      NLP
                    </span>
                  </div>

                  <div className="space-y-2">
                    {keywords.length === 0 && (
                      <div className="h-[140px] flex items-center justify-center text-sm text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        No review keywords available yet.
                      </div>
                    )}
                    {keywords.map((kw, index) => (
                      <div key={kw.word} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-[11px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{kw.word}</span>
                            <span className="text-gray-400">{kw.count}</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.max(18, Math.round((kw.count / maxKeywordCount) * 100))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Rating Distribution</h3>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-gray-500 w-6">{star}★</span>
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full rounded-lg ${star === 5 ? 'bg-[#FBBF24]' : star === 4 ? 'bg-[#94A3B8]' : star === 3 ? 'bg-[#CBD5E1]' : star === 2 ? 'bg-[#E2E8F0]' : 'bg-[#F1F5F9]'}`}
                        style={{ width: `${dist[star]}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{dist[star]}%</span>
                  </div>
                ))}
              </div>

              {/* Reviews Section */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiMessageSquare /> User Reviews
                  </h2>
                  {totalRev > 0 && (
                    <button
                      onClick={() => setShowAll(v => !v)}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 px-4 py-2 rounded-lg transition-colors"
                    >
                      {showAll ? 'Show Less' : 'View All Reviews'}
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {(showAll ? reviews : reviews.slice(0, 3)).map((rv, idx) => {
                    const s = getSentimentLabel(rv.rating)
                    return (
                      <div key={rv.id || idx} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-sm">
                              {(rv.reviewer || 'A')?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-sm">{rv.reviewer || 'Anonymous'}</p>
                              <p className="text-[10px] text-gray-400">{rv.review_time || 'Recently'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-500 text-sm font-bold">{'★'.repeat(rv.rating || 0)}<span className="text-gray-200 dark:text-gray-600">{'★'.repeat(5 - (rv.rating || 0))}</span></span>
                            <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${s.class}`}>
                              {s.text}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm italic leading-relaxed">"{rv.review_text}"</p>
                      </div>
                    )
                  })}
                </div>

                {showAll && totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
                    <button
                      disabled={reviewPage === 1}
                      onClick={() => setReviewPage(p => p - 1)}
                      className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:enabled:bg-gray-50 disabled:opacity-40 transition-colors font-medium"
                    >← Prev</button>
                    <span className="text-sm text-gray-400">Page {reviewPage} of {totalPages}</span>
                    <button
                      disabled={reviewPage === totalPages}
                      onClick={() => setReviewPage(p => p + 1)}
                      className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:enabled:bg-gray-50 disabled:opacity-40 transition-colors font-medium"
                    >Next →</button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN (Similar & Nearby) */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <RestaurantHours timings={r.timings} />

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Similar & Nearby</h3>
              <div className="space-y-3">
                {similar.length === 0 && (
                  <p className="text-sm text-gray-400">No similar or nearby restaurants found.</p>
                )}
                {similar.map(item => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/restaurant/${item.id}`)}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 flex justify-between items-center hover:shadow-md transition cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 truncate">{item.cuisines}</p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {item.sameArea ? 'Nearby' : [item.area, item.city].filter(Boolean).join(', ')}
                        {item.sharedFoods?.length > 0 ? ` · ${item.sharedFoods.slice(0, 2).join(', ')}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-orange-500 font-bold text-sm">★ {item.avg_rating?.toFixed(1)}</span>
                      <span className={`block text-[10px] font-bold mt-0.5 ${item.category === 'Top Restaurant' ? 'text-purple-600' : item.category === 'Hidden Gem' ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {similar.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                    <FiTarget className="text-orange-500" /> Match Score Graph
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">Same food/items and same area based ranking</p>
                  <div className="space-y-2">
                    {similar.slice(0, 4).map(item => {
                      const pct = Math.round(((item.matchScore || 0) / maxMatchScore) * 100)
                      return (
                        <div key={item.id}>
                          <div className="flex items-center justify-between gap-3 text-xs mb-1">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
                            <span className="font-bold text-orange-600 shrink-0">{pct}%</span>
                          </div>
                          <div className="h-2.5 bg-orange-50 rounded-full overflow-hidden">
                            <div className="h-full bg-[#E8401C] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {r.sentiment_score != null && (
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white relative overflow-hidden">
                  <h4 className="font-bold mb-1">Sentiment Insight</h4>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    Our lexicon-based analysis scored this restaurant <b>{(r.sentiment_score * 100).toFixed(1)}%</b> on overall customer satisfaction.
                  </p>
                  <div className="mt-4 opacity-20 absolute -bottom-4 -right-4">
                     <FiTrendingUp size={80} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Bottom Dark Stats Bar */}
          <div className="bg-[#0F172A] p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
             {[
               { label: 'Total Reviews', value: r.review_count },
               { label: 'Avg Rating', value: r.avg_rating?.toFixed(1) },
               { label: 'Sentiment', value: `${positivePct}%` },
               { label: 'Category', value: r.category }
             ].map((stat, i) => (
               <div key={i} className="text-center md:text-left">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[2px] mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const STOP_WORDS = new Set([
  'this', 'that', 'with', 'from', 'have', 'were', 'they', 'their', 'there',
  'here', 'very', 'really', 'just', 'also', 'food', 'place', 'restaurant',
  'good', 'great', 'nice', 'best', 'been', 'will', 'would', 'could', 'should',
  'your', 'what', 'when', 'then', 'than', 'into', 'about', 'after', 'before',
])

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function getReviewKeywords(reviews) {
  const counts = {}
  reviews.forEach(rv => {
    ;(rv.review_text || '').toLowerCase().split(/\s+/).forEach(raw => {
      const word = raw.replace(/[^a-z]/g, '')
      if (word.length < 4 || STOP_WORDS.has(word)) return
      counts[word] = (counts[word] || 0) + 1
    })
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word, count]) => ({ word, count }))
}

function getCuisineTokens(cuisines) {
  return (cuisines || '')
    .toLowerCase()
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function getSimilarNearbyScore(base, item) {
  const baseFoods = getCuisineTokens(base.cuisines)
  const itemFoods = getCuisineTokens(item.cuisines)
  const sharedFoods = itemFoods.filter(food => baseFoods.includes(food))
  const sameArea = Boolean(base.area && item.area && base.area === item.area)
  const ratingBonus = Math.max(0, (item.avg_rating || 0) - 3) * 4
  const matchScore = (sharedFoods.length * 35) + (sameArea ? 25 : 0) + ratingBonus

  return {
    ...item,
    sharedFoods,
    sharedFoodCount: sharedFoods.length,
    sameArea,
    matchScore,
  }
}

function getAiSignals(restaurant, positivePct) {
  const ratingScore = clampScore(((restaurant.avg_rating || 0) / 5) * 100)
  const sentimentScore = clampScore(positivePct)
  const valueScore = clampScore(100 - Math.min((restaurant.cost || 0) / 25, 85) + ratingScore * 0.18)
  const popularityScore = clampScore(Math.log10((restaurant.review_count || 1) + 1) * 28)
  const confidenceScore = clampScore((sentimentScore * 0.45) + (ratingScore * 0.35) + (popularityScore * 0.2))

  return [
    { label: 'Rating', value: ratingScore, color: '#F59E0B' },
    { label: 'Sentiment', value: sentimentScore, color: '#10B981' },
    { label: 'Value', value: valueScore, color: '#3B82F6' },
    { label: 'Popularity', value: popularityScore, color: '#8B5CF6' },
    { label: 'Confidence', value: confidenceScore, color: '#EF4444' },
  ]
}

function getRadarPoints(signals, center = 92, radius = 70) {
  return signals.map((signal, index) => {
    const angle = ((Math.PI * 2) / signals.length) * index - Math.PI / 2
    const distance = radius * (signal.value / 100)
    return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`
  }).join(' ')
}
