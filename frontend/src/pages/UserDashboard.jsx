import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { restaurantService } from '../services/api'
import RestaurantCard from '../components/RestaurantCard'
import Footer from '../components/Footer'
import pizzaImg from '../assets/cuisines/Pizza.png'
import chineseImg from '../assets/cuisines/Chinese.png'
import burgersImg from '../assets/cuisines/Burgers.png'
import dessertsImg from '../assets/cuisines/Desserts.png'
import cafeImg from '../assets/cuisines/Cafe.png'
import streetImg from '../assets/cuisines/Street Food.png'
import southIndianImg from '../assets/cuisines/South Indian.png'
import drinksImg from '../assets/cuisines/Drinks.png'
import { FaCrown, FaGem, FaTriangleExclamation } from 'react-icons/fa6'
import {
  FiAward,
  FiTarget,
  FiAlertTriangle,
  FiSearch,
  FiSliders,
  FiChevronDown,
  FiLogOut,
  FiHome,
  FiMapPin,
  FiBookmark,
  FiClock,
  FiGrid,
  FiArrowRight,
} from 'react-icons/fi'

const CUISINE_CATEGORIES = [
  { id: 'pizza', name: 'Pizza', count: '128+', image: pizzaImg, gradient: 'from-orange-50 to-red-50', icon: '🍕' },
  { id: 'chinese', name: 'Chinese', count: '96+', image: chineseImg, gradient: 'from-purple-50 to-blue-50', icon: '🍜' },
  { id: 'burgers', name: 'Burgers', count: '78+', image: burgersImg, gradient: 'from-yellow-50 to-orange-50', icon: '🍔' },
  { id: 'desserts', name: 'Desserts', count: '64+', image: dessertsImg, gradient: 'from-pink-50 to-rose-50', icon: '🍰' },
  { id: 'cafe', name: 'Cafe', count: '84+', image: cafeImg, gradient: 'from-stone-50 to-orange-50', icon: '☕' },
  { id: 'street', name: 'Street Food', count: '112+', image: streetImg, gradient: 'from-amber-50 to-yellow-50', icon: '🌮' },
  { id: 'south_indian', name: 'South Indian', count: '92+', image: southIndianImg, gradient: 'from-emerald-50 to-green-50', icon: '🍛' },
  { id: 'drinks', name: 'Drinks', count: '56+', image: drinksImg, gradient: 'from-blue-50 to-cyan-50', icon: '🍹' },
]

function uniqueById(restaurants = []) {
  return Array.from(
    new Map(restaurants.filter(r => r?.id != null).map(r => [r.id, r])).values()
  )
}

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [topRated, setTopRated] = useState([])
  const [hiddenGems, setHiddenGems] = useState([])
  const [overrated, setOverrated] = useState([])
  const [searchResults, setSearchResults] = useState(null)
  const [viewingAll, setViewingAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [locations, setLocations] = useState([])

  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [rating, setRating] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [isOpenNow, setIsOpenNow] = useState(false)
  const [isVeg, setIsVeg] = useState(false)
  const [outdoorSeating, setOutdoorSeating] = useState(false)

  // Header display city (UI-only). Filters mode uses `location`.
  const [city, setCity] = useState('Hyderabad')
  const [activeTab, setActiveTab] = useState('home')
  const [selectedCuisine, setSelectedCuisine] = useState('All Categories')

  const firstName = user?.name?.split(' ')[0] || 'User'

  useEffect(() => {
    Promise.all([
      restaurantService.getTop(),
      restaurantService.getHiddenGems(),
      restaurantService.getOverrated(),
      restaurantService.getLocations(),
    ]).then(([top, gems, over, locs]) => {
      setTopRated(uniqueById(top))
      setHiddenGems(uniqueById(gems))
      setOverrated(uniqueById(over))
      setLocations(locs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const hasFilter = search || location || rating || category || price || isOpenNow || isVeg || outdoorSeating || (selectedCuisine !== 'All Categories')
    if (!hasFilter) {
      if (!viewingAll) setSearchResults(null)
      return
    }

    setViewingAll(false)

    const timer = setTimeout(async () => {
      const params = { search, location, category }
      if (selectedCuisine !== 'All Categories') params.cuisine = selectedCuisine
      if (rating) params.min_rating = rating
      if (isOpenNow) params.open_now = true
      if (isVeg) params.is_veg = true
      if (outdoorSeating) params.outdoor_seating = true
      if (price === 'budget') { params.max_cost = 499 }
      if (price === 'mid') { params.min_cost = 500; params.max_cost = 1199 }
      if (price === 'premium') { params.min_cost = 1200 }

      try {
        const res = await restaurantService.getAll(params)
        setSearchResults(uniqueById(res.restaurants))
      } catch (e) { setSearchResults([]) }
    }, 300)

    return () => clearTimeout(timer)
  }, [search, location, rating, category, price, viewingAll, isOpenNow, isVeg, outdoorSeating, selectedCuisine])

  const clearFilters = () => {
    setSearch(''); setLocation(''); setRating(''); setCategory(''); setPrice('')
    setIsOpenNow(false); setIsVeg(false); setOutdoorSeating(false); setSelectedCuisine('All Categories')
    setViewingAll(false)
    setSearchResults(null)
    setActiveTab('home')
  }

  const viewAllRestaurants = async (tabId = 'allItems') => {
    const nextTabId = typeof tabId === 'string' ? tabId : 'allItems'
    setSearch(''); setLocation(''); setRating(''); setCategory(''); setPrice(''); setIsOpenNow(false); setIsVeg(false); setOutdoorSeating(false); setSelectedCuisine('All Categories')
    setActiveTab(nextTabId)
    setViewingAll(true)
    setSearchResults([])

    try {
      const perPage = 50
      const firstPage = await restaurantService.getAll({ page: 1, per_page: perPage })
      const totalPages = Math.ceil((firstPage.total || firstPage.restaurants.length) / perPage)

      if (totalPages <= 1) {
        setSearchResults(uniqueById(firstPage.restaurants))
        return
      }

      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          restaurantService.getAll({ page: index + 2, per_page: perPage })
        )
      )

      setSearchResults(uniqueById([
        ...firstPage.restaurants,
        ...remainingPages.flatMap(page => page.restaurants),
      ]))
    } catch (e) {
      setSearchResults([])
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-400 text-sm font-medium">Loading Foodlytics...</p>
    </div>
  )

  const showSections = searchResults === null
  const hasFilter = search || location || rating || category || price

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: FiHome },
    { id: 'topRated', label: 'Top Rated', icon: FiAward },
    { id: 'hiddenGems', label: 'Hidden Gems', icon: FiTarget },
    { id: 'cuisines', label: 'Cuisines', icon: FiGrid },
    { id: 'saved', label: 'Saved', icon: FiBookmark },
    { id: 'history', label: 'History', icon: FiClock },
  ]

  const onSidebarClick = (id) => {
    setActiveTab(id)

    if (id === 'home') {
      clearFilters()
      return
    }

    if (id === 'topRated') {
      clearFilters()
      setActiveTab('topRated')
      return
    }

    if (id === 'hiddenGems') {
      clearFilters()
      setActiveTab('hiddenGems')
      return
    }

    if (id === 'cuisines') {
      clearFilters()
      setActiveTab('cuisines')
      setSelectedCuisine('All Categories')
      return
    }

    if (id === 'nearMe') {
      setSearch('')
      setRating('')
      setCategory('')
      setPrice('')
      setViewingAll(false)
      setSearchResults(null)
      setLocation(city)
      return
    }

    // Saved / History are UI placeholders for now.
    clearFilters()
    setActiveTab(id)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col sticky top-0 h-screen border-r border-gray-100 bg-white">
          <div className="px-6 pt-5 pb-3">
            <div className="text-xl font-black tracking-tight cursor-pointer select-none">
              <span className="text-orange-600">Foodly</span>
              <span className="text-gray-900">tics</span>
            </div>
            <div className="mt-2 text-xs text-gray-400">Discover smart picks with AI</div>
          </div>

          <nav className="px-3 py-3">
            <ul className="space-y-1">
              {sidebarItems.map(({ id, label, icon: Icon, badge }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onSidebarClick(id)}
                    className={[
                      'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors',
                      activeTab === id ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={activeTab === id ? 'text-orange-600' : 'text-gray-400'} />
                      <span className="text-sm font-semibold">{label}</span>
                    </span>
                    {badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-orange-100 text-orange-700 px-2 py-[2px]">
                        {badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto px-6 pb-6">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-xs font-bold text-gray-500">AI Recommendation</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">
                {hasFilter ? 'Refining picks...' : 'Personalized just for you'}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => viewAllRestaurants()}
                  className="flex-1 rounded-xl border border-orange-200 bg-orange-600 px-3 py-2 text-xs font-bold text-white hover:bg-orange-700 transition-colors"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2">
                <FiMapPin className="text-orange-600" />
                <select
                  className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  {locations.length ? (
                    locations.map(l => <option key={l} value={l}>{l}</option>)
                  ) : (
                    <option value="Hyderabad">Hyderabad</option>
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm font-semibold text-gray-600">Hi, {firstName}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                aria-label="Logout"
                type="button"
              >
                <FiLogOut />
              </button>
            </div>
          </nav>

          <div className="flex-grow">
            {/* Hero + Search */}
            <header className="pb-6 px-6 md:px-12 max-w-7xl mx-auto pt-8">
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
                      <p className="mt-4 text-sm md:text-lg text-gray-500 leading-relaxed">
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
                          className="w-full rounded-xl bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
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
                      onClick={() => viewAllRestaurants('allItems')}
                      className="w-full md:w-auto inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-100 transition-all duration-200 hover:bg-orange-600 hover:shadow-orange-200 active:scale-[0.95]"
                    >
                      View All
                    </button>
                  </div>

                  {/* Quick pill filters (UI-focused) */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Pill
                      label="All"
                      active={!hasFilter}
                      icon={<FiSliders className="text-sm" />}
                      onClick={() => {
                        clearFilters()
                      }}
                    />
                    <Pill
                      label="Budget"
                      active={price === 'budget'}
                      icon={<FiChevronDown className="text-sm" />}
                      onClick={() => {
                        setSearchResults(null)
                        setActiveTab('home')
                        setViewingAll(false)
                        setPrice('budget')
                      }}
                    />
                    <Pill
                      label="Rating 4+"
                      active={rating === '4.0' || rating === '4.5'}
                      icon={<span className="text-amber-500">★</span>}
                      onClick={() => {
                        setSearchResults(null)
                        setActiveTab('home')
                        setViewingAll(false)
                        setRating('4.0')
                      }}
                    />
                    <Pill
                      label="Pure Veg"
                      active={isVeg}
                      icon={<span className="text-green-600">●</span>}
                      onClick={() => {
                        setSearchResults(null)
                        setActiveTab('home')
                        setViewingAll(false)
                        setIsVeg(!isVeg)
                      }}
                    />
                    <Pill
                      label="Open Now"
                      active={isOpenNow}
                      icon={<FiClock className="text-sm" />}
                      onClick={() => {
                        setSearchResults(null)
                        setActiveTab('home')
                        setViewingAll(false)
                        setIsOpenNow(!isOpenNow)
                      }}
                    />
                    <Pill
                      label="Outdoor Seating"
                      active={outdoorSeating}
                      onClick={() => {
                        setSearchResults(null)
                        setActiveTab('home')
                        setViewingAll(false)
                        setOutdoorSeating(!outdoorSeating)
                      }}
                    />
                  </div>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
              {!showSections ? (
                <Section
                  title={viewingAll ? 'All Items' : (activeTab === 'nearMe' ? 'Top Rated Near You' : 'Search Results')}
                  icon={<FiSearch className="text-blue-500" />}
                  restaurants={searchResults}
                  onSelect={(id) => navigate(`/restaurant/${id}`)}
                  emptyMsg="No restaurants match your filters."
                />
              ) : (
                <div className="space-y-12">
                  {activeTab === 'home' && (
                    <>
                      <Section
                        title="AI Picks For You"
                        icon={<FiAward className="text-orange-500" />}
                        theme="picks"
                        restaurants={topRated}
                        onSelect={(id) => navigate(`/restaurant/${id}`)}
                        badge="Best Choice"
                        maxItems={4}
                        onViewAll={() => {
                          clearFilters()
                          setActiveTab('topRated')
                        }}
                      />
                      <Section
                        title="Hidden Gems"
                        icon={<FiTarget className="text-emerald-500" />}
                        theme="gems"
                        restaurants={hiddenGems}
                        onSelect={(id) => navigate(`/restaurant/${id}`)}
                        badge="High Sentiment"
                        maxItems={4}
                        onViewAll={() => {
                          clearFilters()
                          setActiveTab('hiddenGems')
                        }}
                      />
                      <Section
                        title="Proceed with Caution"
                        icon={<FiAlertTriangle className="text-amber-500" />}
                        theme="caution"
                        restaurants={overrated}
                        onSelect={(id) => navigate(`/restaurant/${id}`)}
                        badge="Mixed Reviews"
                        maxItems={4}
                        onViewAll={() => {
                          clearFilters()
                          setActiveTab('overrated')
                        }}
                      />
                    </>
                  )}

                  {activeTab === 'topRated' && (
                    <Section
                      title="AI Picks For You"
                      icon={<FiAward className="text-orange-500" />}
                      theme="picks"
                      restaurants={topRated}
                      onSelect={(id) => navigate(`/restaurant/${id}`)}
                      badge="Best Choice"
                    />
                  )}

                  {activeTab === 'hiddenGems' && (
                    <Section
                      title="Hidden Gems"
                      icon={<FiTarget className="text-emerald-500" />}
                      theme="gems"
                      restaurants={hiddenGems}
                      onSelect={(id) => navigate(`/restaurant/${id}`)}
                      badge="High Sentiment"
                    />
                  )}

                  {activeTab === 'cuisines' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {/* Cuisine Header */}
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                            {selectedCuisine === 'All Categories' ? 'Explore Cuisines' : `${selectedCuisine} Cuisine`}
                            {selectedCuisine !== 'All Categories' && <span className="ml-3">🍜</span>}
                          </h2>
                          <p className="mt-2 text-gray-500 font-medium">
                            Explore the best {selectedCuisine === 'All Categories' ? 'categories' : selectedCuisine.toLowerCase() + ' restaurants'} in {city}
                          </p>
                        </div>
                        
                        {/* Cuisine Quick Tabs */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                          <button
                            onClick={() => setSelectedCuisine('All Categories')}
                            className={`flex flex-col items-center justify-center min-w-[100px] p-4 rounded-2xl transition-all duration-300 border ${
                              selectedCuisine === 'All Categories'
                                ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-lg shadow-orange-100 scale-105'
                                : 'bg-white border-gray-100 text-gray-400 hover:border-orange-100 hover:text-orange-400'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 ${selectedCuisine === 'All Categories' ? 'bg-orange-500 text-white' : 'bg-gray-50'}`}>
                              <FiGrid />
                            </div>
                            <span className="text-xs font-bold whitespace-nowrap">All Categories</span>
                          </button>
                          {['North Indian', 'Chinese', 'Italian', 'South Indian', 'Fast Food', 'Desserts'].map((c) => (
                            <button
                              key={c}
                              onClick={() => setSelectedCuisine(c)}
                              className={`flex flex-col items-center justify-center min-w-[90px] p-4 rounded-2xl transition-all duration-300 border ${
                                selectedCuisine === c
                                  ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-lg shadow-orange-100 scale-105'
                                  : 'bg-white border-gray-100 text-gray-400 hover:border-orange-100 hover:text-orange-400'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 ${selectedCuisine === c ? 'bg-orange-500 text-white' : 'bg-gray-50'}`}>
                                {c === 'North Indian' && '🍛'}
                                {c === 'Chinese' && '🍜'}
                                {c === 'Italian' && '🍕'}
                                {c === 'South Indian' && '🍲'}
                                {c === 'Fast Food' && '🍔'}
                                {c === 'Desserts' && '🍰'}
                              </div>
                              <span className="text-xs font-bold whitespace-nowrap">{c}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Expanded Categories Grid (Always visible) */}
                      <div className="space-y-8">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">All Categories</h3>
                              <p className="text-sm text-gray-400 font-medium">Explore a variety of cuisines and find your next favorite</p>
                            </div>
                            <button className="text-sm font-bold text-orange-600 flex items-center gap-1 hover:gap-2 transition-all">
                              View All <FiArrowRight size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {CUISINE_CATEGORIES.map((cat) => (
                              <div 
                                key={cat.id}
                                onClick={() => {
                                  setSelectedCuisine(cat.name)
                                }}
                                className={`group relative h-48 rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-br ${cat.gradient} border border-white/50 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-2`}
                              >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10 p-6 h-full flex flex-col">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{cat.icon}</span>
                                    <h4 className="font-bold text-gray-900 text-lg">{cat.name}</h4>
                                  </div>
                                  <p className="text-xs font-bold text-gray-400 tracking-wider">
                                    <span className="text-gray-900">{cat.count}</span> RESTAURANTS
                                  </p>
                                  
                                  <div className="mt-auto self-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                                    <img 
                                      src={cat.image} 
                                      alt={cat.name}
                                      className="h-28 w-28 object-contain drop-shadow-2xl"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-center pt-4">
                            <button 
                              onClick={() => viewAllRestaurants()}
                              className="flex items-center gap-2 px-8 py-4 bg-orange-50 text-orange-600 rounded-2xl font-bold text-sm border border-orange-100 hover:bg-orange-100 transition-all shadow-sm"
                            >
                              ✨ Explore 50+ Cuisines <FiArrowRight />
                            </button>
                          </div>
                        </div>

                      {/* Selected Cuisine Results */}
                      {selectedCuisine !== 'All Categories' && (
                        <div className="space-y-12">
                          {/* Mock Insight Cards for the selected cuisine */}
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                              { label: 'Avg Rating', val: '4.2 / 5', sub: 'Based on 1.2K+ reviews', icon: '⭐' },
                              { label: 'Avg Cost for Two', val: '₹400', sub: 'Cost range: ₹250 - ₹800', icon: '💰' },
                              { label: 'Sentiment Score', val: '78%', sub: 'Positive reviews', icon: '😊' },
                              { label: 'Trending Dish', val: 'Hakka Noodles', sub: 'Most ordered this week', icon: '🔥' }
                            ].map((stat, i) => (
                              <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg">{stat.icon}</div>
                                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                                </div>
                                <div className="text-2xl font-black text-gray-900 mb-1">{stat.val}</div>
                                <div className="text-[10px] font-bold text-gray-400">{stat.sub}</div>
                              </div>
                            ))}
                          </div>

                          <Section
                            title={`${selectedCuisine} Restaurants`}
                            icon={<FiGrid className="text-orange-500" />}
                            restaurants={searchResults || []}
                            onSelect={(id) => navigate(`/restaurant/${id}`)}
                            emptyMsg={`No ${selectedCuisine} restaurants found.`}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'overrated' && (
                    <Section
                      title="Proceed with Caution"
                      icon={<FiAlertTriangle className="text-amber-500" />}
                      theme="caution"
                      restaurants={overrated}
                      onSelect={(id) => navigate(`/restaurant/${id}`)}
                      badge="Mixed Reviews"
                    />
                  )}

                  {activeTab === 'nearMe' && (
                    <EmptyPanel
                      title="Select city to see picks"
                      subtitle="Use the location selector in the top bar, then click Near Me."
                    />
                  )}

                  {(activeTab === 'saved' || activeTab === 'history') && (
                    <EmptyPanel
                      title={activeTab === 'saved' ? 'Saved restaurants' : 'History'}
                      subtitle={activeTab === 'saved' ? 'Coming soon. You’ll see your saved picks here.' : 'Coming soon. Your recent searches will appear here.'}
                    />
                  )}
                </div>
              )}
            </main>
          </div>

          <Footer onLogin={() => { }} />
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon, restaurants, onSelect, emptyMsg, badge, onViewAll, viewAllLabel = 'View All', maxItems, theme = 'default' }) {
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
      <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
        <p className="text-gray-400 text-sm">{emptyMsg}</p>
      </div>
    ) : null
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ring-1 ${currentTheme.wrap}`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              {currentTheme.accentIcon && (
                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${currentTheme.badge}`}>
                  {currentTheme.accentIcon}
                </span>
              )}
            </div>
            {badge && (
              <span className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${currentTheme.badge}`}>
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

function EmptyPanel({ title, subtitle }) {
  return (
    <div className="py-14 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
      <div className="mx-auto max-w-xl px-6">
        <div className="text-gray-900 text-lg font-bold">{title}</div>
        <div className="mt-2 text-sm text-gray-500 leading-relaxed">{subtitle}</div>
      </div>
    </div>
  )
}

function Pill({ label, active = false, onClick, icon = null }) {
  const common =
    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 border whitespace-nowrap'

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
