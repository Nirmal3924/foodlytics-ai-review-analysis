import { useOutletContext } from 'react-router-dom'
import { FiAlertTriangle, FiSearch } from 'react-icons/fi'
import DashboardSection from '../components/DashboardSection'

export default function OverratedPage() {
  const { searchResults, overrated, viewingAll, navigate } = useOutletContext()

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
        title="Proceed with Caution"
        icon={<FiAlertTriangle className="text-amber-500" />}
        theme="caution"
        restaurants={overrated}
        onSelect={(id) => navigate(`/restaurant/${id}`)}
        badge="Mixed Reviews"
      />
    </div>
  )
}
