import { FiGrid, FiArrowRight } from 'react-icons/fi'
import DashboardSection from './DashboardSection'

import pizzaImg from '../assets/cuisines/Pizza.png'
import chineseImg from '../assets/cuisines/Chinese.png'
import burgersImg from '../assets/cuisines/Burgers.png'
import dessertsImg from '../assets/cuisines/Desserts.png'
import cafeImg from '../assets/cuisines/Cafe.png'
import streetImg from '../assets/cuisines/Street Food.png'
import southIndianImg from '../assets/cuisines/South Indian.png'
import drinksImg from '../assets/cuisines/Drinks.png'

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

export default function CuisinesSection({
  city,
  selectedCuisine,
  onSelectCuisine,
  viewAllRestaurants,
  searchResults,
  onSelectRestaurant
}) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 select-none">
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
            onClick={() => onSelectCuisine('All Categories')}
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
              onClick={() => onSelectCuisine(c)}
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
          <button
            type="button"
            onClick={() => viewAllRestaurants()}
            className="text-sm font-bold text-orange-600 flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
          >
            View All <FiArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CUISINE_CATEGORIES.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => onSelectCuisine(cat.name)}
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
            type="button"
            onClick={() => viewAllRestaurants()}
            className="flex items-center gap-2 px-8 py-4 bg-orange-50 text-orange-600 rounded-2xl font-bold text-sm border border-orange-100 hover:bg-orange-100 transition-all shadow-sm cursor-pointer"
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

          <DashboardSection
            title={`${selectedCuisine} Restaurants`}
            icon={<FiGrid className="text-orange-500" />}
            restaurants={searchResults || []}
            onSelect={onSelectRestaurant}
            emptyMsg={`No ${selectedCuisine} restaurants found.`}
          />
        </div>
      )}
    </div>
  )
}
