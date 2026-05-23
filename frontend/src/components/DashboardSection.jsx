import { FaCrown, FaGem, FaTriangleExclamation } from 'react-icons/fa6'
import RestaurantCard from './RestaurantCard'
import { uniqueById } from '../utils/helpers'

export default function DashboardSection({ title, icon, restaurants, onSelect, emptyMsg, badge, onViewAll, viewAllLabel = 'View All', maxItems, theme = 'default' }) {
  const uniqueRestaurants = uniqueById(restaurants)
  const visibleRestaurants = maxItems ? uniqueRestaurants.slice(0, maxItems) : uniqueRestaurants
  const themeStyles = {
    picks: {
      wrap: 'bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600 ring-orange-100',
      badge: 'bg-orange-50 text-orange-700 border-orange-200',
      accentIcon: <FaCrown className="text-[13px]" />,
    },
    gems: {
      wrap: 'bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-emerald-100',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accentIcon: <FaGem className="text-[12px]" />,
    },
    caution: {
      wrap: 'bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 ring-amber-100',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      accentIcon: <FaTriangleExclamation className="text-[12px]" />,
    },
    default: {
      wrap: 'bg-gray-50 text-gray-700 ring-gray-100',
      badge: 'bg-gray-50 text-gray-700 border-gray-200',
      accentIcon: null,
    },
  }
  const currentTheme = themeStyles[theme] || themeStyles.default

  if (!visibleRestaurants.length) {
    return emptyMsg ? (
      <div className="py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
        <p className="text-gray-400 dark:text-gray-500 text-sm">{emptyMsg}</p>
      </div>
    ) : null
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ring-1 dark:ring-0 dark:bg-gray-800 ${currentTheme.wrap}`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
              {currentTheme.accentIcon && (
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 ${currentTheme.badge}`}>
                  {currentTheme.accentIcon}
                </span>
              )}
            </div>
            {badge && (
              <span className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 ${currentTheme.badge}`}>
                {badge}
              </span>
            )}
          </div>
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600 hover:shadow-md active:scale-[0.98]"
          >
            {viewAllLabel}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleRestaurants.map(r => (
          <div key={r.id} className="transition-transform duration-300 hover:-translate-y-1 cursor-pointer">
            <RestaurantCard restaurant={r} onClick={() => onSelect(r.id)} />
          </div>
        ))}
      </div>
    </section>
  )
}
