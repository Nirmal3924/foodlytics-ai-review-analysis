import { useOutletContext } from 'react-router-dom'
import { FiTarget, FiSearch } from 'react-icons/fi'
import DashboardSection from '../components/DashboardSection'

export default function HiddenGemsPage() {
  const { searchResults, hiddenGems, viewingAll, navigate } = useOutletContext()

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
        title="Hidden Gems"
        icon={<FiTarget className="text-emerald-500" />}
        theme="gems"
        restaurants={hiddenGems}
        onSelect={(id) => navigate(`/restaurant/${id}`)}
        badge="High Sentiment"
      />
    </div>
  )
}
