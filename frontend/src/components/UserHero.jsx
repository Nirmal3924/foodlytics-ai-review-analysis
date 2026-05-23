import { useState, useEffect } from 'react'
import { FiSearch, FiSliders, FiChevronDown, FiClock } from 'react-icons/fi'

function Pill({ label, active = false, onClick, icon = null }) {
  const common =
    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 border whitespace-nowrap cursor-pointer select-none'

  const className = active
    ? `${common} bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-500/50 text-orange-700 dark:text-orange-500 shadow-[0_2px_10px_rgba(249,115,22,0.12)]`
    : `${common} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm`

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
  const slides = [
    {
      img: '/chicken_biryani_hero.png',
      bgColor: 'bg-[#1e1511]', // Dark warm background matching the cinematic image
      title: <>Discover {city}'s smartest food picks powered by <span className="text-orange-500">AI.</span></>,
      desc: 'Real reviews. Smart analysis. Better choices.'
    },
    {
      img: '/gourmet_pizza_hero.png',
      bgColor: 'bg-[#18110b]', // Rustic dark oven warmth
      title: <>Find the best <span className="text-orange-500">hidden gems</span> near you instantly.</>,
      desc: 'Explore top-rated restaurants with precision.'
    },
    {
      img: '/premium_steak_hero.png',
      bgColor: 'bg-[#111111]', // Moody sophisticated dining
      title: <>Make data-driven <span className="text-green-500">dining decisions</span> easily.</>,
      desc: 'Analyze sentiment from thousands of real reviews.'
    }
  ]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isBudgetOpen, setIsBudgetOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <header className="pb-6 px-6 md:px-12 max-w-7xl mx-auto pt-8 select-none">
      <div className="space-y-5">
        <div className={`relative overflow-hidden rounded-[28px] border border-orange-100 min-h-[280px] transition-colors duration-1000 ${slides[currentIndex].bgColor} dark:bg-gray-800 dark:border-gray-700`}>
          {slides.map((slide, index) => (
            <div
              key={slide.img}
              className={`absolute inset-y-0 right-0 w-full md:w-[60%] lg:w-[50%] pointer-events-none transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-80 md:opacity-100' : 'opacity-0'
                }`}
              style={{
                backgroundImage: `url('${slide.img}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center right',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
                maskImage: 'linear-gradient(to right, transparent 0%, black 50%)'
              }}
            />
          ))}
          <div className="relative z-10 flex min-h-[280px] items-center p-6 md:p-8 w-full">
            {/* Hidden dummy element to keep layout height stable */}
            <div className="max-w-2xl p-4 md:p-6 invisible pointer-events-none">
              <h1 className="text-3xl md:text-5xl font-black leading-tight text-white">
                Hello, {firstName}! <span className="inline-block">👋</span>
              </h1>
              <div className="mt-2 text-2xl md:text-5xl font-black leading-tight text-white">
                Discover {city}'s smartest food picks powered by AI.
              </div>
              <p className="mt-4 text-sm md:text-lg leading-relaxed font-medium text-gray-300">
                Real reviews. Smart analysis. Better choices.
              </p>
            </div>

            {/* Actual animated text */}
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute left-6 md:left-8 top-1/2 -translate-y-1/2 max-w-2xl p-4 md:p-6 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
              >
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                  Hello, {firstName}! <span className="inline-block">👋</span>
                </h1>
                <div className="mt-2 text-2xl md:text-5xl font-black text-white leading-tight">
                  {slide.title}
                </div>
                <p className="mt-4 text-sm md:text-lg text-gray-200 leading-relaxed font-medium">
                  {slide.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative w-full max-w-5xl flex flex-col md:flex-row items-center gap-4">
            <div className="w-full flex-1 flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1.5 shadow-sm transition-colors">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for restaurants, cuisines or dishes..."
                  className="w-full rounded-xl bg-white dark:bg-gray-800 py-3 pl-10 pr-4 text-sm text-gray-700 dark:text-gray-200 outline-none font-medium transition-colors"
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
            <div className="relative">
              <Pill
                label={price && price !== 'budget' ? `Up to ₹${price}` : "Budget"}
                active={!!price}
                icon={<FiChevronDown className={`text-sm transition-transform ${isBudgetOpen ? 'rotate-180' : ''}`} />}
                onClick={() => setIsBudgetOpen(!isBudgetOpen)}
              />
              {isBudgetOpen && (
                <div className="absolute top-full left-0 mt-2 w-36 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50">
                  {['200', '500', '800', '1200', '2000'].map(b => (
                    <button
                      key={b}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 transition-colors"
                      onClick={() => {
                        onPriceSelect(b);
                        setIsBudgetOpen(false);
                      }}
                    >
                      Up to ₹{b}
                    </button>
                  ))}
                  {price && (
                    <button
                      className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700 mt-1 pt-2"
                      onClick={() => {
                        onPriceSelect('');
                        setIsBudgetOpen(false);
                      }}
                    >
                      Clear Budget
                    </button>
                  )}
                </div>
              )}
            </div>
            <Pill
              label="Rating 4+"
              active={rating === '4.0' || rating === '4.5'}
              icon={<span className="text-amber-500">★</span>}
              onClick={() => onRatingSelect('4.0')}
            />
            <Pill
              label="Open Now"
              active={isOpenNow}
              icon={<FiClock className="text-sm" />}
              onClick={onOpenNowToggle}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
