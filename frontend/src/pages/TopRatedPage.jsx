import { useOutletContext } from 'react-router-dom'
import { FiAward, FiSearch } from 'react-icons/fi'
import DashboardSection from '../components/DashboardSection'

export default function TopRatedPage() {
  const { searchResults, topRated, viewingAll, navigate } = useOutletContext()

  if (searchResults !== null) {
    return (
      <DashboardSection
        title={viewingAll ? 'All Items' : 'Search Results'}
        icon={<FiSearch className="text-blue-500" />}
        restaurants={searchResults}
        onSelect={(id) => navigate(`/restaurant/${id}`)}
        emptyMsg="No restaurants match your filters."
      />
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <DashboardSection
        title="Top Rated"
        icon={<FiAward className="text-orange-500" />}
        restaurants={topRated}
        onSelect={(id) => navigate(`/restaurant/${id}`)}
        badge="Best Choice"
      />
    </div>
  )
}
