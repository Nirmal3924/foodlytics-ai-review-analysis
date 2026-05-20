import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiCalendar,
  FiDownload,
  FiMoreVertical,
  FiSearch,
  FiStar,
  FiTrendingUp,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { adminService } from '../../services/api'

const INR = '\u20b9'
const STAR = '\u2605'

const RATING_LABELS = ['< 3.0', '3.0 - 3.5', '3.5 - 4.0', '4.0 - 4.5', '4.5+']
const CATEGORY_COLORS = {
  'Hidden Gem': '#f59e0b',
  Uncategorized: '#48b23f',
  Overrated: '#3b82f6',
  'Top Restaurant': '#ef4b57',
  Popular: '#8b5cf6',
}
const FALLBACK_COLORS = ['#f59e0b', '#48b23f', '#3b82f6', '#ef4b57', '#8b5cf6', '#14b8a6']
const CAT_BADGE = {
  'Top Restaurant': 'bg-[#fff0df] text-[#e46b12]',
  Popular: 'bg-[#e8f5e9] text-[#2e7d32]',
  'Hidden Gem': 'bg-[#fff4dc] text-[#b87505]',
  Overrated: 'bg-[#eaf2ff] text-[#1d64d8]',
  Uncategorized: 'bg-[#eef8ed] text-[#428a39]',
}
function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function csvValue(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getDatabaseRangeLabel(stats) {
  const start = formatDate(stats?.data_start_date)
  const end = formatDate(stats?.data_end_date)
  if (start && end && start !== end) return `${start} - ${end}`
  if (end) return `Database updated ${end}`
  return 'All database data'
}

function MetricIcon({ tone, children }) {
  const tones = {
    orange: 'border-[#ffd8c7] bg-[#ffe2d6] text-[#ff4a13]',
    green: 'border-[#c8f0cf] bg-[#d9f4dd] text-[#16a34a]',
    blue: 'border-[#d5e5ff] bg-[#e2ebff] text-[#3b82f6]',
    purple: 'border-[#ead7ff] bg-[#efdfff] text-[#a855f7]',
  }

  return (
    <div className={`grid h-11 w-11 place-items-center rounded-[14px] border ${tones[tone]} transition-transform duration-300 group-hover:scale-110`}>
      {children}
    </div>
  )
}

function StatCard({ tone, icon, value, label, trend, lightMode }) {
  const borders = {
    orange: 'border-[#ffd7c9]',
    green: 'border-[#ccebd3]',
    blue: 'border-[#d7e6ff]',
    purple: 'border-[#eadbff]',
  }

  return (
    <div
      className={`group relative flex min-h-[82px] items-center gap-3 overflow-hidden rounded-[10px] border p-3 shadow-[0_12px_32px_rgba(19,34,62,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(19,34,62,0.10)] ${
        lightMode ? `bg-white ${borders[tone]}` : 'border-[#223650] bg-[#0d1b2e]'
      }`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
          tone === 'orange'
            ? 'bg-[linear-gradient(90deg,rgba(255,74,19,0.18),transparent)]'
            : tone === 'green'
              ? 'bg-[linear-gradient(90deg,rgba(34,197,94,0.16),transparent)]'
              : tone === 'blue'
                ? 'bg-[linear-gradient(90deg,rgba(59,130,246,0.16),transparent)]'
                : 'bg-[linear-gradient(90deg,rgba(168,85,247,0.16),transparent)]'
        }`}
      />

      <MetricIcon tone={tone}>{icon}</MetricIcon>
      <div className="relative">
        <div
          className={`text-[19px] font-bold leading-tight transition-transform duration-300 group-hover:scale-[1.04] ${
            lightMode ? 'text-[#0f1f3a]' : 'text-white'
          }`}
        >
          {value}
        </div>
        <div className={`mt-0.5 text-[12px] font-medium ${lightMode ? 'text-[#65728a]' : 'text-[#9cadc5]'}`}>{label}</div>
        <div className="mt-0.5 text-[11px] font-semibold text-[#16a34a]">{trend}</div>
      </div>
    </div>
  )
}

function RestaurantIcon() {
  return (
    <div className="relative h-6 w-6">
      <div className="absolute left-1 top-1 h-3 w-5 rounded-t-md border-[2px] border-current" />
      <div className="absolute left-0 top-3 h-3 w-7 rounded-b-md border-[2px] border-current" />
      <div className="absolute bottom-0 left-2 h-2.5 w-1.5 border-[2px] border-current" />
      <div className="absolute bottom-0 right-2 h-2.5 w-1.5 border-[2px] border-current" />
    </div>
  )
}

export default function AdminOverview({ lightMode = true, onViewAll }) {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [topRestaurants, setTopRestaurants] = useState([])
  const [query, setQuery] = useState('')
  const [actionsOpen, setActionsOpen] = useState(null)
  const [toast, setToast] = useState('')
  const ratingChartRef = useRef(null)
  const catChartRef = useRef(null)
  const chartInstances = useRef({})

  useEffect(() => {
    Promise.all([adminService.getStats(), adminService.getRestaurants()])
      .then(([s, r]) => {
        setStats(s)
        setTopRestaurants((Array.isArray(r) ? r : []).slice(0, 10))
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

  const categoryEntries = useMemo(() => {
    const breakdown = stats?.category_breakdown || {}
    const entries = Object.entries(breakdown).filter(([, count]) => Number(count) > 0)
    const ordered = ['Hidden Gem', 'Uncategorized', 'Overrated', 'Top Restaurant', 'Popular']

    return entries.sort(([a], [b]) => {
      const ai = ordered.indexOf(a)
      const bi = ordered.indexOf(b)
      if (ai === -1 && bi === -1) return a.localeCompare(b)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }, [stats])

  useEffect(() => {
    if (!stats || !window.Chart) return

    Object.values(chartInstances.current).forEach((chart) => chart?.destroy())
    chartInstances.current = {}
    const axisColor = lightMode ? '#52607a' : '#9cadc5'
    const gridColor = lightMode ? 'rgba(82, 96, 122, 0.13)' : 'rgba(156, 173, 197, 0.18)'
    const tooltipBg = lightMode ? '#102039' : '#020817'

    const rd = stats.rating_distribution || {}
    const ratingValues = [
      rd.below_3 ?? 0,
      rd['3_to_3_5'] ?? 0,
      rd['3_5_to_4'] ?? 0,
      rd['4_to_4_5'] ?? 0,
      rd.above_4_5 ?? 0,
    ]
    const ratingTotalForChart = ratingValues.reduce((sum, count) => sum + Number(count || 0), 0) || 1
    const ratingMax = Math.max(...ratingValues.map((v) => Number(v || 0)), 0)
    const suggestedMax = Math.max(1, Math.ceil(ratingMax * 1.15))

    if (ratingChartRef.current) {
      const ctx = ratingChartRef.current.getContext('2d')
      const gradient = ctx.createLinearGradient(0, 0, 0, 250)
      gradient.addColorStop(0, 'rgba(255, 148, 34, 0.34)')
      gradient.addColorStop(0.48, 'rgba(255, 210, 91, 0.22)')
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.16)')

      chartInstances.current.rating = new window.Chart(ratingChartRef.current, {
        type: 'line',
        data: {
          labels: RATING_LABELS,
          datasets: [
            {
              label: 'Restaurants',
              data: ratingValues,
              fill: true,
              tension: 0.42,
              borderWidth: 3,
              pointRadius: 5,
              borderColor: (context) => {
                const chart = context.chart
                const area = chart.chartArea
                if (!area) return '#ff7a1a'
                const stroke = chart.ctx.createLinearGradient(area.left, 0, area.right, 0)
                stroke.addColorStop(0, '#ef4444')
                stroke.addColorStop(0.5, '#f97316')
                stroke.addColorStop(1, '#16a34a')
                return stroke
              },
              backgroundColor: gradient,
              pointBackgroundColor: ['#ef4444', '#f97316', '#f97316', '#84cc16', '#10b981'],
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: tooltipBg,
              padding: 12,
              titleColor: '#ffffff',
              bodyColor: '#dce5f4',
              displayColors: false,
              callbacks: {
                label: (context) => {
                  const count = Number(context.parsed.y || 0)
                  const pct = Math.round((count / ratingTotalForChart) * 100)
                  return `${count.toLocaleString()} restaurants (${pct}%)`
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax,
              ticks: {
                color: axisColor,
                font: { size: 12 },
                precision: 0,
                callback: (value) => Number(value).toLocaleString(),
              },
              grid: { color: gridColor, drawBorder: false },
              title: { display: true, text: 'Restaurants', color: axisColor, font: { size: 12 } },
            },
            x: {
              ticks: { color: axisColor, font: { size: 12 }, maxRotation: 0 },
              grid: { display: false, drawBorder: false },
              title: { display: true, text: 'Rating Range', color: axisColor, font: { size: 12 } },
            },
          },
        },
      })
    }

    if (catChartRef.current && categoryEntries.length) {
      chartInstances.current.category = new window.Chart(catChartRef.current, {
        type: 'doughnut',
        data: {
          labels: categoryEntries.map(([label]) => label),
          datasets: [
            {
              data: categoryEntries.map(([, count]) => count),
              backgroundColor: categoryEntries.map(([label], index) => CATEGORY_COLORS[label] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]),
              borderWidth: 0,
              hoverOffset: 4,
              cutout: '62%',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: tooltipBg,
              padding: 12,
              titleColor: '#ffffff',
              bodyColor: '#dce5f4',
              displayColors: false,
            },
          },
        },
      })
    }

    return () => Object.values(chartInstances.current).forEach((chart) => chart?.destroy())
  }, [stats, categoryEntries, lightMode])

  const filteredRestaurants = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return topRestaurants

    return topRestaurants.filter((restaurant) =>
      [restaurant.name, restaurant.category, restaurant.area, restaurant.city]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    )
  }, [query, topRestaurants])

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }

  const exportReport = () => {
    if (!stats) return

    const rows = [
      ['Foodlytics Admin Report'],
      ['Data Range', getDatabaseRangeLabel(stats)],
      ['Total Restaurants', stats.total_restaurants ?? 0],
      ['Total Reviews', stats.total_reviews ?? 0],
      ['Average Rating', Number(stats.avg_rating ?? 0).toFixed(2)],
      ['Top Rated Restaurants', stats.top_rated_count ?? 0],
      [],
      ['Rank', 'Restaurant Name', 'Rating', 'Category', 'City', 'Area', 'Cost for Two'],
      ...topRestaurants.map((restaurant, index) => [
        index + 1,
        restaurant.name,
        Number(restaurant.avg_rating ?? 0).toFixed(1),
        restaurant.category || 'Uncategorized',
        restaurant.city || '',
        restaurant.area || '',
        restaurant.cost ?? '',
      ]),
    ]

    const csv = rows.map((row) => row.map(csvValue).join(',')).join('\n')
    downloadTextFile('foodlytics-admin-report.csv', csv)
    showToast('Report downloaded')
  }

  const copyRestaurantName = async (name) => {
    try {
      await navigator.clipboard.writeText(name)
      showToast('Restaurant name copied')
    } catch {
      showToast('Copy failed')
    }
    setActionsOpen(null)
  }

  if (loading) {
    return (
      <div className="grid min-h-[360px] place-items-center text-sm font-medium text-[#75829a]">
        Loading dashboard...
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid min-h-[360px] place-items-center text-sm font-medium text-[#75829a]">
        Could not load stats.
      </div>
    )
  }

  const totalRestaurants = stats.total_restaurants ?? 0
  const totalCategories = categoryEntries.reduce((sum, [, count]) => sum + count, 0) || totalRestaurants || 1
  const adminName = user?.name?.split(' ')[0] || 'Admin'
  const totalReviews = stats.total_reviews ?? 0
  const topRatedCount = stats.top_rated_count ?? 0
  const avgRating = Number(stats.avg_rating ?? 0)
  const dataRangeLabel = getDatabaseRangeLabel(stats)
  const ratingTotal = Object.values(stats.rating_distribution || {}).reduce((sum, count) => sum + Number(count || 0), 0)
  const cardClass = lightMode ? 'border-[#e0e7f1] bg-white' : 'border-[#223650] bg-[#0d1b2e]'
  const titleClass = lightMode ? 'text-[#102039]' : 'text-white'
  const mutedClass = lightMode ? 'text-[#52607a]' : 'text-[#9cadc5]'
  const controlClass = lightMode
    ? 'border-[#d9e0ec] bg-white text-[#23324d] hover:border-[#c6d0df]'
    : 'border-[#223650] bg-[#12233a] text-[#d9e5f5] hover:border-[#31506f]'
  const tableHeadClass = lightMode ? 'bg-[#fbfcfe] text-[#102039]' : 'bg-[#12233a] text-[#d9e5f5]'
  const rowHoverClass = lightMode ? 'hover:bg-[#fbfcfe]' : 'hover:bg-[#12233a]'

  return (
    <div className="mx-auto max-w-[1120px] pb-4">
      <header className="mb-3.5 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className={`text-[19px] font-bold tracking-[-0.02em] ${titleClass}`}>
            Welcome back, {adminName}
          </h1>
          <p className={`text-[12px] font-medium ${mutedClass}`}>
            Here's what's happening with your restaurant data today.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className={`flex h-8 w-full items-center justify-center gap-2 rounded-lg border px-3 text-[11px] font-semibold shadow-sm sm:w-auto ${controlClass}`}>
            <FiCalendar size={14} />
            {dataRangeLabel}
          </div>
          <button
            type="button"
            onClick={exportReport}
            className="flex h-8 items-center justify-center gap-2 rounded-lg bg-[#082645] px-3 text-[11px] font-bold text-white shadow-[0_12px_24px_rgba(8,38,69,0.18)] transition hover:bg-[#12385f]"
          >
            <FiDownload size={14} />
            Export Report
          </button>
        </div>
      </header>

      <section className="mb-3.5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="orange"
          icon={<RestaurantIcon />}
          value={totalRestaurants.toLocaleString()}
          label="Total Restaurants"
          trend={`${categoryEntries.length} live categories`}
          lightMode={lightMode}
        />
        <StatCard
          tone="green"
          icon={<FiStar size={22} />}
          value={totalReviews.toLocaleString()}
          label="Total Reviews"
          trend={`${totalReviews.toLocaleString()} reviews loaded`}
          lightMode={lightMode}
        />
        <StatCard
          tone="blue"
          icon={<FiTrendingUp size={23} />}
          value={avgRating.toFixed(2)}
          label="Average Rating"
          trend={`${avgRating >= 4 ? 'Strong' : avgRating >= 3.5 ? 'Stable' : 'Needs attention'} rating`}
          lightMode={lightMode}
        />
        <StatCard
          tone="purple"
          icon={<FiStar size={22} />}
          value={topRatedCount.toLocaleString()}
          label="Top Rated (4.5+)"
          trend={`${Math.round((topRatedCount / Math.max(totalRestaurants, 1)) * 100)}% of restaurants`}
          lightMode={lightMode}
        />
      </section>

      <section className="mb-3.5 grid grid-cols-1 gap-3.5 xl:grid-cols-[1.08fr_1fr]">
        <div className={`rounded-[10px] border p-3.5 shadow-[0_12px_30px_rgba(21,34,66,0.04)] ${cardClass}`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className={`text-[14px] font-bold ${titleClass}`}>Rating Distribution</h2>
            <span className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${controlClass}`}>
              {ratingTotal.toLocaleString()} restaurants
            </span>
          </div>
          <p className={`mb-1 text-[11px] font-medium ${mutedClass}`}>
            Based on current restaurant avg_rating values.
          </p>
          <div className="relative h-[190px]">
            <canvas ref={ratingChartRef} role="img" aria-label="Line chart of restaurant rating distribution" />
          </div>
        </div>

        <div className={`rounded-[10px] border p-3.5 shadow-[0_12px_30px_rgba(21,34,66,0.04)] ${cardClass}`}>
          <h2 className={`mb-2 text-[14px] font-bold ${titleClass}`}>Category Breakdown</h2>
          <div className="grid items-center gap-3 md:grid-cols-[160px_1fr]">
            <div className="relative mx-auto h-[145px] w-[145px]">
              <canvas ref={catChartRef} role="img" aria-label="Doughnut chart of restaurant categories" />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className={`text-[18px] font-bold ${titleClass}`}>{totalRestaurants.toLocaleString()}</div>
                  <div className={`text-[10px] font-medium ${mutedClass}`}>Restaurants</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {categoryEntries.map(([label, count], index) => {
                const color = CATEGORY_COLORS[label] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                const percent = ((count / totalCategories) * 100).toFixed(1)

                return (
                  <div key={label} className="flex items-center gap-2 text-[12px]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                    <span className={`min-w-0 flex-1 font-medium ${mutedClass}`}>{label}</span>
                    <span className={`font-semibold ${titleClass}`}>
                      {count} ({percent}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className={`overflow-hidden rounded-[10px] border shadow-[0_12px_30px_rgba(21,34,66,0.04)] ${cardClass}`}>
        <div className={`flex flex-col gap-2.5 border-b p-3 lg:flex-row lg:items-center lg:justify-between ${lightMode ? 'border-[#e6ebf3]' : 'border-[#223650]'}`}>
          <h2 className={`text-[14px] font-bold ${titleClass}`}>Top 10 Restaurants by Rating</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#63708a]" size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={`h-8 w-full rounded-lg border pl-8 pr-3 text-[11px] font-medium outline-none transition placeholder:text-[#72809a] focus:border-[#ff8a55] focus:ring-4 focus:ring-[#ff8a55]/10 sm:w-[200px] ${controlClass}`}
                placeholder="Search restaurant..."
              />
            </label>
            <button
              type="button"
              onClick={onViewAll}
              className={`h-8 rounded-lg border px-4 text-[11px] font-bold transition ${controlClass}`}
            >
              View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-[11px]">
            <thead>
              <tr className={`text-[10px] font-bold ${tableHeadClass}`}>
                {['#', 'Restaurant Name', 'Rating', 'Category', 'City', 'Area', 'Cost for Two', ''].map((header) => (
                  <th key={header || 'actions'} className="px-4 py-2.5">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={lightMode ? 'divide-y divide-[#e8edf4]' : 'divide-y divide-[#223650]'}>
              {filteredRestaurants.map((restaurant, index) => {
                const rating = Number(restaurant.avg_rating ?? 0)
                const ratingClass = rating >= 4.5 ? 'text-[#16a34a]' : rating >= 4 ? 'text-[#f97316]' : 'text-[#ef4444]'

                return (
                  <tr key={restaurant.id ?? restaurant.name} className={`transition ${rowHoverClass}`}>
                    <td className="px-4 py-2 font-medium text-[#66738c]">{index + 1}</td>
                    <td className={`max-w-[260px] truncate px-4 py-2 font-bold ${titleClass}`}>{restaurant.name}</td>
                    <td className="px-4 py-2">
                      <span className={`font-bold ${ratingClass}`}>
                        {STAR} {rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${CAT_BADGE[restaurant.category] || 'bg-[#f1f5f9] text-[#52607a]'}`}>
                        {restaurant.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className={`px-4 py-2 font-medium ${mutedClass}`}>{restaurant.city || '—'}</td>
                    <td className={`px-4 py-2 font-medium ${mutedClass}`}>{restaurant.area || '—'}</td>
                    <td className={`px-4 py-2 font-medium ${mutedClass}`}>
                      {INR}{Number(restaurant.cost ?? 0).toLocaleString()}
                    </td>
                    <td className="relative px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setActionsOpen((value) => (value === (restaurant.id ?? restaurant.name) ? null : (restaurant.id ?? restaurant.name)))}
                        className={`grid h-8 w-8 place-items-center rounded-lg transition ${lightMode ? 'text-[#52607a] hover:bg-[#eef2f7] hover:text-[#102039]' : 'text-[#9cadc5] hover:bg-[#1a2b45] hover:text-white'}`}
                        aria-label={`Open actions for ${restaurant.name}`}
                      >
                        <FiMoreVertical size={17} />
                      </button>
                      {actionsOpen === (restaurant.id ?? restaurant.name) && (
                        <div className={`absolute right-4 top-10 z-20 w-36 overflow-hidden rounded-lg border py-1 text-left shadow-[0_16px_34px_rgba(21,34,66,0.14)] ${cardClass}`}>
                          <button
                            type="button"
                            onClick={() => {
                              setActionsOpen(null)
                              onViewAll?.()
                            }}
                            className={`block w-full px-3 py-2 text-[12px] font-semibold transition ${mutedClass} ${lightMode ? 'hover:bg-[#f7f9fc]' : 'hover:bg-[#1a2b45]'}`}
                          >
                            Manage
                          </button>
                          <button
                            type="button"
                            onClick={() => copyRestaurantName(restaurant.name)}
                            className={`block w-full px-3 py-2 text-[12px] font-semibold transition ${mutedClass} ${lightMode ? 'hover:bg-[#f7f9fc]' : 'hover:bg-[#1a2b45]'}`}
                          >
                            Copy name
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!filteredRestaurants.length && (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-sm font-medium text-[#75829a]">
                    No restaurants match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {toast && (
        <div className="fixed bottom-5 right-5 z-[999] rounded-lg bg-[#102039] px-4 py-3 text-[13px] font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
