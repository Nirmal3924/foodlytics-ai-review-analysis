import { useOutletContext } from 'react-router-dom'
import { FiAward, FiTarget, FiTrendingDown, FiSearch } from 'react-icons/fi'
import { FaBrain, FaGem } from 'react-icons/fa'
import DashboardSection from '../components/DashboardSection'

export default function UserDashboard() {
  const { searchResults, topRated, hiddenGems, overrated, viewingAll, navigate } = useOutletContext()

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
        title="Top rated"
        icon={<FiAward className="text-orange-500" />}
        restaurants={topRated}
        onSelect={(id) => navigate(`/restaurant/${id}`)}
        badge="Best Choice"
        maxItems={4}
        onViewAll={() => navigate('/dashboard/top-rated')}
      />
      <DashboardSection
        title="Hidden Gems"
        icon={<FaGem className="text-emerald-500" />}
        restaurants={hiddenGems}
        onSelect={(id) => navigate(`/restaurant/${id}`)}
        badge="High Sentiment"
        maxItems={4}
        onViewAll={() => navigate('/dashboard/hidden-gems')}
      />
      <DashboardSection
        title="Proceed with Caution"
        icon={<FiTrendingDown className="text-amber-500" />}
        restaurants={overrated}
        onSelect={(id) => navigate(`/restaurant/${id}`)}
        badge="Mixed Reviews"
        maxItems={4}
        onViewAll={() => navigate('/dashboard/overrated')}
      />
    </div>
  )
}
