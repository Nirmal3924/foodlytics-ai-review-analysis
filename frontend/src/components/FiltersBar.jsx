const CATEGORIES = ['Top Restaurant', 'Popular', 'Hidden Gem', 'Overrated']

export default function FiltersBar({
  areas,
  area,
  onArea,
  rating,
  onRating,
  category,
  onCategory,
  price,
  onPrice,
  hasFilter,
  resultCount,
  onClear,
  onViewAll,
}) {
  const selectClass = 'h-10 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 cursor-pointer shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-md focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/15'

  return (
    <div className="w-full rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(140px,1fr)_minmax(130px,1fr)_minmax(150px,1fr)_minmax(170px,1fr)_auto_auto_auto] lg:items-center">
        <select
          className={selectClass}
          value={area}
          onChange={e => onArea(e.target.value)}
        >
          <option value="">All Areas</option>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <select
          className={selectClass}
          value={rating}
          onChange={e => onRating(e.target.value)}
        >
          <option value="">All Ratings</option>
          <option value="4.5">4.5+ Star rated</option>
          <option value="4.0">4.0+ Star rated</option>
          <option value="3.5">3.5+ Star rated</option>
        </select>

        <select
          className={selectClass}
          value={category}
          onChange={e => onCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className={selectClass}
          value={price}
          onChange={e => onPrice(e.target.value)}
        >
          <option value="">Any Price</option>
          <option value="budget">Budget: under Rs 500</option>
          <option value="mid">Mid-range: Rs 500-1,200</option>
          <option value="premium">Premium: Rs 1,200+</option>
        </select>

        <button
          className="h-10 w-full whitespace-nowrap rounded-lg border border-orange-600 bg-orange-600 px-4 text-[13px] font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-md lg:w-auto"
          onClick={onViewAll}
        >
          View All
        </button>

        {hasFilter && (
          <button
            className="h-10 w-full whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-semibold text-gray-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 hover:shadow-md lg:w-auto"
            onClick={onClear}
          >
            Clear
          </button>
        )}

        {resultCount !== null && (
          <span className="flex h-10 items-center justify-center whitespace-nowrap rounded-lg bg-gray-50 px-3 text-[13px] font-medium text-gray-400 sm:col-span-2 lg:col-span-1 lg:justify-start lg:bg-transparent lg:px-0">
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
