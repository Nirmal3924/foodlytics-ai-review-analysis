import { FiSearch, FiSliders, FiChevronDown, FiClock } from 'react-icons/fi'

function Pill({ label, active = false, onClick, icon = null }) {
  const common =
    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 border whitespace-nowrap cursor-pointer select-none'

  const className = active
    ? `${common} bg-orange-50 border-orange-300 text-orange-700 shadow-[0_2px_10px_rgba(249,115,22,0.12)]`
    : `${common} bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm`

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      disabled={!onClick}
      aria-disabled={!onClick}
    >
      {icon}
      {label}
    </button>
  )
}

export default function UserHero({
  firstName,
  city,
  search,
  onSearchChange,
  onViewAll,
  onAskAi,
  showAiModal,
  hasFilter,
  onClearFilters,
  price,
  onPriceSelect,
  rating,
  onRatingSelect,
  isVeg,
  onVegToggle,
  isOpenNow,
  onOpenNowToggle,
  outdoorSeating,
  onOutdoorSeatingToggle
}) {
  return (
    <header className="pb-6 px-6 md:px-12 max-w-7xl mx-auto pt-8 select-none">
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-[28px] border border-orange-100 min-h-[280px] bg-[#fff8f2]">
          <div
            className="absolute inset-y-0 right-0 hidden w-[48%] md:block"
            style={{
              backgroundImage: "url('/navbar.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center right',
            }}
          />
          <div className="relative z-10 flex min-h-[280px] items-center p-6 md:p-8">
            <div className="max-w-2xl p-4 md:p-6">
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                Hello, {firstName}! <span className="inline-block">👋</span>
              </h1>
              <div className="mt-2 text-2xl md:text-5xl font-black text-gray-900 leading-tight">
                Discover {city}'s smartest food picks powered by <span className="text-orange-500">AI.</span>
              </div>
              <p className="mt-4 text-sm md:text-lg text-gray-500 leading-relaxed font-medium">
                Real reviews. Smart analysis. Better choices.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative w-full max-w-5xl flex flex-col md:flex-row items-center gap-4">
            <div className="w-full flex-1 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for restaurants, cuisines or dishes..."
                  className="w-full rounded-xl bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none font-medium"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-orange-600 hover:shadow-md active:scale-[0.98]"
              >
                Search
              </button>
            </div>
            <button
              type="button"
              onClick={onViewAll}
              className="w-full md:w-auto inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition-all duration-200 hover:bg-orange-600 hover:shadow-orange-200 active:scale-[0.95]"
            >
              View All
            </button>
            <button
              type="button"
              onClick={onAskAi}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:bg-orange-700 hover:shadow-xl active:scale-[0.98] whitespace-nowrap"
            >
              <span className="text-lg">✨</span> Ask AI Concierge
            </button>
          </div>

          {/* Quick pill filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Pill
              label="✨ AI Concierge"
              active={showAiModal}
              onClick={onAskAi}
            />
            <Pill
              label="All"
              active={!hasFilter}
              icon={<FiSliders className="text-sm" />}
              onClick={onClearFilters}
            />
            <Pill
              label="Budget"
              active={price === 'budget'}
              icon={<FiChevronDown className="text-sm" />}
              onClick={() => onPriceSelect('budget')}
            />
            <Pill
              label="Rating 4+"
              active={rating === '4.0' || rating === '4.5'}
              icon={<span className="text-amber-500">★</span>}
              onClick={() => onRatingSelect('4.0')}
            />
            <Pill
              label="Pure Veg"
              active={isVeg}
              icon={<span className="text-green-600">●</span>}
              onClick={onVegToggle}
            />
            <Pill
              label="Open Now"
              active={isOpenNow}
              icon={<FiClock className="text-sm" />}
              onClick={onOpenNowToggle}
            />
            <Pill
              label="Outdoor Seating"
              active={outdoorSeating}
              onClick={onOutdoorSeatingToggle}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
