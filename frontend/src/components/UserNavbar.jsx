import { useState, useRef, useEffect } from 'react'
import { FiMapPin, FiLogOut, FiMenu, FiChevronDown, FiCheck } from 'react-icons/fi'

export default function UserNavbar({ city, cities, onCityChange, firstName, onLogout, onToggleMobileSidebar }) {
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLocationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex items-center justify-between gap-4 transition-colors duration-300 shadow-sm">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <FiMenu size={20} />
        </button>
        
        {/* Premium Location Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsLocationOpen(!isLocationOpen)}
            className={`group flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 transition-all duration-300 ease-out
              ${isLocationOpen 
                ? 'bg-orange-50/80 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 shadow-[0_4px_20px_-4px_rgba(249,115,22,0.15)]' 
                : 'bg-white/60 dark:bg-gray-800/60 border-gray-200/60 dark:border-gray-700/60 hover:bg-white dark:hover:bg-gray-800 hover:border-orange-200 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md'
              }`}
          >
            <div className={`p-1.5 rounded-full transition-colors duration-300 ${isLocationOpen ? 'bg-orange-100 dark:bg-orange-500/20' : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10'}`}>
              <FiMapPin className={`transition-colors duration-300 ${isLocationOpen ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-orange-500'}`} size={16} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase leading-none mb-1">Delivering to</span>
              <span className="text-sm font-extrabold text-gray-800 dark:text-gray-100 leading-none flex items-center gap-1">
                {city} 
                <FiChevronDown className={`transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] ${isLocationOpen ? 'rotate-180 text-orange-500' : 'text-gray-400'}`} size={16} />
              </span>
            </div>
          </button>

          {/* Dropdown Menu */}
          <div 
            className={`absolute top-full left-0 mt-3 w-64 rounded-3xl border border-white/40 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 origin-top-left
              ${isLocationOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`
            }
          >
            <div className="p-3">
              <div className="px-3 pb-2 pt-1 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Select City
              </div>
              <div className="flex flex-col gap-1">
                {cities.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      onCityChange(c)
                      setIsLocationOpen(false)
                    }}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200
                      ${city === c 
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800/80 hover:text-orange-600 dark:hover:text-white'
                      }`}
                  >
                    <span>{c}</span>
                    {city === c && <FiCheck size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Welcome back</span>
          <span className="text-sm font-black text-gray-800 dark:text-gray-100">{firstName}</span>
        </div>
        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
        <button
          onClick={onLogout}
          className="group flex items-center justify-center p-2.5 text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
          aria-label="Logout"
          title="Logout"
          type="button"
        >
          <FiLogOut size={18} className="group-hover:scale-110 transition-transform duration-300" />
        </button>
      </div>
    </nav>
  )
}
