import { useMemo, useState } from 'react'
import { FiChevronDown, FiClock } from 'react-icons/fi'
import { DAYS, getTodayKey, isOpenAt, parseTimings } from '../utils/timingsParser'

export default function RestaurantHours({ timings }) {
  const [expanded, setExpanded] = useState(false)
  const schedule = useMemo(() => parseTimings(timings), [timings])
  const today = getTodayKey()
  const todayHours = schedule[today] || 'Closed'
  const openNow = isOpenAt(todayHours)
  const visibleDays = expanded ? DAYS : [today]

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(value => !value)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={expanded}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <FiClock aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className={`block text-sm font-bold ${openNow ? 'text-emerald-600' : 'text-rose-600'}`}>
              {openNow ? 'Open Now' : 'Closed'}
            </span>
            <span className="block truncate text-sm text-gray-500">{todayHours}</span>
          </span>
        </span>
        <FiChevronDown
          className={`shrink-0 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div className="mt-4 space-y-1">
        {visibleDays.map(day => {
          const isToday = day === today
          return (
            <div
              key={day}
              className={`grid grid-cols-[44px_1fr] gap-3 rounded-lg px-3 py-2 text-sm ${
                isToday ? 'bg-orange-50 font-semibold text-gray-950' : 'text-gray-600'
              }`}
            >
              <span className={isToday ? 'text-orange-700' : 'text-gray-500'}>{day}</span>
              <span className="text-right">{schedule[day]}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
