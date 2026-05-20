import { FiMapPin, FiLogOut } from 'react-icons/fi'

export default function UserNavbar({ city, cities, onCityChange, firstName, onLogout }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2">
          <FiMapPin className="text-orange-600" />
          <select
            className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
          >
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm font-semibold text-gray-600">Hi, {firstName}</span>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          aria-label="Logout"
          type="button"
        >
          <FiLogOut />
        </button>
      </div>
    </nav>
  )
}
