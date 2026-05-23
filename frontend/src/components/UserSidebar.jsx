import { FiHome, FiAward, FiTarget, FiGrid, FiBookmark, FiClock, FiMenu, FiSun, FiMoon, FiX } from 'react-icons/fi'
import { FaBrain } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function UserSidebar({ hasFilter, viewAllRestaurants, onClearFilters, isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname

  const [isNightMode, setIsNightMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    if (isNightMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isNightMode])

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: FiHome, path: '/dashboard' },
    { id: 'aiConcierge', label: 'AI Concierge', icon: FaBrain, badge: '✨ NEW', path: '/dashboard/ai-concierge' },
    { id: 'topRated', label: 'Top Rated', icon: FiAward, path: '/dashboard/top-rated' },
    { id: 'hiddenGems', label: 'Hidden Gems', icon: FiTarget, path: '/dashboard/hidden-gems' },
    { id: 'cuisines', label: 'Cuisines', icon: FiGrid, path: '/dashboard/cuisines' },
    { id: 'saved', label: 'Saved', icon: FiBookmark, path: '/dashboard/saved' },
    { id: 'history', label: 'History', icon: FiClock, path: '/dashboard/history' },
  ]

  const activeTab = pathname === '/dashboard' ? 'home' :
                    pathname.includes('/ai-concierge') ? 'aiConcierge' :
                    pathname.includes('/top-rated') ? 'topRated' :
                    pathname.includes('/hidden-gems') ? 'hiddenGems' :
                    pathname.includes('/cuisines') ? 'cuisines' :
                    pathname.includes('/saved') ? 'saved' :
                    pathname.includes('/history') ? 'history' :
                    pathname.includes('/overrated') ? 'overrated' : 'home'

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={onMobileClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 md:sticky md:top-0 h-screen border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 select-none transition-all duration-300 ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'} ${isCollapsed && !isMobileOpen ? 'md:w-20' : 'md:w-64'} flex flex-col`}>
        <div className={`pt-5 pb-3 ${isCollapsed && !isMobileOpen ? 'px-0' : 'px-6'}`}>
          <div className={`flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center flex-col gap-4' : 'justify-between'}`}>
            {!(isCollapsed && !isMobileOpen) && (
              <div 
                onClick={() => { if (onClearFilters) onClearFilters(); navigate('/dashboard'); if (onMobileClose) onMobileClose(); }}
                className="text-xl font-black tracking-tight cursor-pointer"
              >
                <span className="text-orange-600">Foodly</span>
                <span className="text-gray-900 dark:text-white">tics</span>
              </div>
            )}
            <button 
              onClick={onToggleCollapse}
              className="hidden md:block text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FiMenu size={20} />
            </button>
            <button 
              onClick={onMobileClose}
              className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
          {!(isCollapsed && !isMobileOpen) && <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">Discover smart picks with AI</div>}
        </div>

      <nav className={`py-3 ${isCollapsed && !isMobileOpen ? 'px-2' : 'px-3'}`}>
        <ul className="space-y-1">
          {sidebarItems.map(({ id, label, icon: Icon, badge, path }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  if (onClearFilters) onClearFilters()
                  navigate(path)
                  if (onMobileClose) onMobileClose()
                }}
                title={isCollapsed && !isMobileOpen ? label : ''}
                className={[
                  'w-full flex items-center gap-3 py-3 rounded-xl transition-colors cursor-pointer',
                  isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'justify-between px-4',
                  activeTab === id ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-500 font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold',
                ].join(' ')}
              >
                <span className={`flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center' : 'gap-3'}`}>
                  <Icon size={isCollapsed && !isMobileOpen ? 22 : 18} className={activeTab === id ? 'text-orange-600' : 'text-gray-400'} />
                  {!(isCollapsed && !isMobileOpen) && <span className="text-sm">{label}</span>}
                </span>
                {!isCollapsed && !isMobileOpen && badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-orange-100 text-orange-700 px-2 py-[2px]">
                    {badge}
                  </span>
                )}
              </button>
            </li>
          ))}

          {/* Night Mode Toggle */}
          <li className="pt-2 mt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsNightMode(!isNightMode)}
              title={isCollapsed && !isMobileOpen ? (isNightMode ? 'Light Mode' : 'Night Mode') : ''}
              className={[
                'w-full flex items-center gap-3 py-3 rounded-xl transition-colors cursor-pointer',
                isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'justify-between px-4',
                'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold',
              ].join(' ')}
            >
              <span className={`flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center' : 'gap-3'}`}>
                {isNightMode ? (
                  <FiSun size={isCollapsed && !isMobileOpen ? 22 : 18} className="text-gray-400" />
                ) : (
                  <FiMoon size={isCollapsed && !isMobileOpen ? 22 : 18} className="text-gray-400" />
                )}
                {!(isCollapsed && !isMobileOpen) && <span className="text-sm">{isNightMode ? 'Light Mode' : 'Night Mode'}</span>}
              </span>
            </button>
          </li>
        </ul>
      </nav>

      <div className={`mt-auto pb-6 ${isCollapsed && !isMobileOpen ? 'px-3' : 'px-6'}`}>
        {!(isCollapsed && !isMobileOpen) ? (
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-4">
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400">AI Recommendation</div>
            <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
              {hasFilter ? 'Refining picks...' : 'Personalized just for you'}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigate('/dashboard')
                  if (viewAllRestaurants) viewAllRestaurants()
                  if (onMobileClose) onMobileClose()
                }}
                className="flex-1 rounded-xl border border-orange-200 bg-orange-600 px-3 py-2 text-xs font-bold text-white hover:bg-orange-700 transition-colors cursor-pointer"
              >
                View All
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => {
                navigate('/dashboard')
                if (viewAllRestaurants) viewAllRestaurants()
                if (onMobileClose) onMobileClose()
              }}
              title="View All Recommendations"
              className="p-3 rounded-xl border border-orange-200 bg-orange-600 text-white hover:bg-orange-700 transition-colors cursor-pointer"
            >
              <FiAward size={20} />
            </button>
          </div>
        )}
      </div>
    </aside>
    </>
  )
}
