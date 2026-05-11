import { FaLocationDot } from 'react-icons/fa6'
import { FiStar } from 'react-icons/fi'
import { getRestaurantImage } from '../utils/restaurantImages'

const CAT_COLORS = {
  'Top Restaurant': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Popular: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Hidden Gem': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Overrated: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
}

function getCuisineFallback(cuisines = '') {
  return cuisines.split(',')[0]?.trim() || 'Restaurant'
}

export default function RestaurantCard({ restaurant: r, onClick }) {
  const cat = CAT_COLORS[r.category] || CAT_COLORS.Popular
  const imageSrc = getRestaurantImage(r.name)

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      aria-label={`${r.name}, rated ${r.avg_rating} out of 5`}
      className="group cursor-pointer overflow-hidden rounded-[14px] border border-black/10 bg-white transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(0,0,0,0.11)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E8401C] focus-visible:outline-offset-2"
    >
      <div className={`relative flex h-[140px] items-center justify-center overflow-hidden ${cat.bg}`}>
        {imageSrc ? (
          <>
            <img
              src={imageSrc}
              alt={r.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
          </>
        ) : (
          <span className={`rounded-full border px-4 py-2 text-sm font-bold ${cat.text} ${cat.border} bg-white/70`}>
            {getCuisineFallback(r.cuisines)}
          </span>
        )}

        <span
          className={`absolute right-[10px] top-[10px] rounded-[20px] border px-[9px] py-[3px] text-[11px] font-semibold ${cat.text} ${cat.bg} ${cat.border}`}
        >
          {r.category}
        </span>
      </div>

      <div className="p-[14px]">
        <h3 className="mb-[3px] overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-semibold text-[#1a1a1a]">
          {r.name}
        </h3>
        <p className="mb-[6px] flex items-center gap-[4px] overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-[#888]">
          <FaLocationDot className="shrink-0 text-red-500" aria-hidden="true" />
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{r.location}</span>
        </p>
        <p className="mb-[10px] overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-[#888]">
          {r.cuisines}
        </p>

        <div className="mb-[6px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-[4px] text-[13px]">
            <FiStar className="text-[#f59e0b]" fill="currentColor" aria-hidden="true" />
            <strong className="font-bold">{r.avg_rating?.toFixed(1)}</strong>
            <span className="text-[12px] font-normal text-[#aaa]">({r.review_count})</span>
          </div>
          <span className="whitespace-nowrap text-[13px] text-[#666]">
            Rs {r.cost?.toLocaleString()} for 2
          </span>
        </div>
      </div>
    </article>
  )
}
