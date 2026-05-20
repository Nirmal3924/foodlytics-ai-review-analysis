import { FiHome, FiAward, FiTarget, FiGrid, FiBookmark, FiClock } from 'react-icons/fi'
import { useNavigate, useLocation } from 'react-router-dom'

export default function UserSidebar({ hasFilter, viewAllRestaurants, onClearFilters }) {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: FiHome, path: '/dashboard' },
    { id: 'aiConcierge', label: 'AI Concierge', icon: FiAward, badge: '✨ NEW', path: '/dashboard/ai-concierge' },
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
    <aside className="hidden md:flex w-64 flex-col sticky top-0 h-screen border-r border-gray-100 bg-white select-none">
      <div className="px-6 pt-5 pb-3">
        <div 
          onClick={() => { if (onClearFilters) onClearFilters(); navigate('/dashboard'); }}
          className="text-xl font-black tracking-tight cursor-pointer"
        >
          <span className="text-orange-600">Foodly</span>
          <span className="text-gray-900">tics</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">Discover smart picks with AI</div>
      </div>

      <nav className="px-3 py-3">
        <ul className="space-y-1">
          {sidebarItems.map(({ id, label, icon: Icon, badge, path }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  if (onClearFilters) onClearFilters()
                  navigate(path)
                }}
                className={[
                  'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer',
                  activeTab === id ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-700 hover:bg-gray-50 font-semibold',
                ].join(' ')}
              >
                <span className="flex items-center gap-3">
                  <Icon className={activeTab === id ? 'text-orange-600' : 'text-gray-400'} />
                  <span className="text-sm">{label}</span>
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
              onClick={() => {
                navigate('/dashboard')
                if (viewAllRestaurants) viewAllRestaurants()
              }}
              className="flex-1 rounded-xl border border-orange-200 bg-orange-600 px-3 py-2 text-xs font-bold text-white hover:bg-orange-700 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
