import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { restaurantService } from '../services/api'
import { uniqueById } from '../utils/helpers'

import UserSidebar from '../components/UserSidebar'
import UserNavbar from '../components/UserNavbar'
import UserHero from '../components/UserHero'
import Footer from '../components/Footer'

export default function UserLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [topRated, setTopRated] = useState([])
  const [hiddenGems, setHiddenGems] = useState([])
  const [overrated, setOverrated] = useState([])
  const [searchResults, setSearchResults] = useState(null)
  const [viewingAll, setViewingAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [areas, setAreas] = useState([])
  const [cities, setCities] = useState(['Hyderabad'])

  const [search, setSearch] = useState('')
  const [area, setArea] = useState('')
  const [rating, setRating] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [isOpenNow, setIsOpenNow] = useState(false)
  const [isVeg, setIsVeg] = useState(false)
  const [outdoorSeating, setOutdoorSeating] = useState(false)

  const [city, setCity] = useState('Hyderabad')
  const [selectedCuisine, setSelectedCuisine] = useState('All Categories')

  const firstName = user?.name?.split(' ')[0] || 'User'

  useEffect(() => {
    Promise.all([
      restaurantService.getTop(),
      restaurantService.getHiddenGems(),
      restaurantService.getOverrated(),
      restaurantService.getAreas(),
      restaurantService.getCities(),
    ]).then(([top, gems, over, areaList, cityList]) => {
      setTopRated(uniqueById(top))
      setHiddenGems(uniqueById(gems))
      setOverrated(uniqueById(over))
      setAreas(areaList)
      if (cityList?.length) setCities(cityList)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const hasFilter = search || area || rating || category || price || isOpenNow || isVeg || outdoorSeating || (selectedCuisine !== 'All Categories')
    if (!hasFilter) {
      if (!viewingAll) setSearchResults(null)
      return
    }

    setViewingAll(false)

    // Automatically redirect to dashboard index or cuisines if searching from another page
    if (location.pathname !== '/dashboard' && !location.pathname.includes('/cuisines')) {
      navigate('/dashboard')
    }

    const timer = setTimeout(async () => {
      const params = { search, area, category }
      if (city) params.city = city
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
  }, [search, area, city, rating, category, price, viewingAll, isOpenNow, isVeg, outdoorSeating, selectedCuisine])

  const clearFilters = () => {
    setSearch(''); setArea(''); setRating(''); setCategory(''); setPrice('')
    setIsOpenNow(false); setIsVeg(false); setOutdoorSeating(false); setSelectedCuisine('All Categories')
    setViewingAll(false)
    setSearchResults(null)
  }

  const viewAllRestaurants = async () => {
    clearFilters()
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

  const hasFilter = search || area || rating || category || price || isOpenNow || isVeg || outdoorSeating || (selectedCuisine !== 'All Categories')
  const showHero = location.pathname === '/dashboard' || location.pathname.includes('/top-rated') || location.pathname.includes('/hidden-gems') || location.pathname.includes('/overrated')

  const outletContext = {
    city, setCity, cities,
    topRated, hiddenGems, overrated, areas,
    search, setSearch,
    area, setArea,
    rating, setRating,
    category, setCategory,
    price, setPrice,
    isOpenNow, setIsOpenNow,
    isVeg, setIsVeg,
    outdoorSeating, setOutdoorSeating,
    selectedCuisine, setSelectedCuisine,
    searchResults, setSearchResults,
    viewingAll, setViewingAll,
    clearFilters, viewAllRestaurants,
    hasFilter, navigate
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <UserSidebar
          hasFilter={hasFilter}
          viewAllRestaurants={viewAllRestaurants}
          onClearFilters={clearFilters}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <UserNavbar
            city={city}
            cities={cities}
            onCityChange={setCity}
            firstName={firstName}
            onLogout={logout}
          />

          <div className="flex-grow">
            {showHero && (
              <UserHero
                firstName={firstName}
                city={city}
                search={search}
                onSearchChange={setSearch}
                onViewAll={viewAllRestaurants}
                onAskAi={() => navigate('/dashboard/ai-concierge')}
                showAiModal={location.pathname.includes('/ai-concierge')}
                hasFilter={hasFilter}
                onClearFilters={clearFilters}
                price={price}
                onPriceSelect={(p) => {
                  setSearchResults(null)
                  setViewingAll(false)
                  setPrice(p)
                }}
                rating={rating}
                onRatingSelect={(r) => {
                  setSearchResults(null)
                  setViewingAll(false)
                  setRating(r)
                }}
                isVeg={isVeg}
                onVegToggle={() => {
                  setSearchResults(null)
                  setViewingAll(false)
                  setIsVeg(!isVeg)
                }}
                isOpenNow={isOpenNow}
                onOpenNowToggle={() => {
                  setSearchResults(null)
                  setViewingAll(false)
                  setIsOpenNow(!isOpenNow)
                }}
                outdoorSeating={outdoorSeating}
                onOutdoorSeatingToggle={() => {
                  setSearchResults(null)
                  setViewingAll(false)
                  setOutdoorSeating(!outdoorSeating)
                }}
              />
            )}

            <main className="max-w-7xl mx-auto px-6 md:px-12 pb-20 pt-4">
              <Outlet context={outletContext} />
            </main>
          </div>

          <Footer onLogin={() => { }} />
        </div>
      </div>
    </div>
  )
}
