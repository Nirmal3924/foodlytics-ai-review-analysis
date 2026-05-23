import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBookmark } from 'react-icons/fi'
import DashboardSection from '../components/DashboardSection'
import EmptyPanel from '../components/EmptyPanel'

export default function SavedPage() {
  const navigate = useNavigate()
  const [savedRestaurants, setSavedRestaurants] = useState([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved_restaurants') || '[]')
    setSavedRestaurants(saved)
  }, [])

  if (savedRestaurants.length === 0) {
    return (
      <div className="animate-in fade-in duration-500 py-12">
        <EmptyPanel title="Saved restaurants" subtitle="You haven't saved any restaurants yet. Click the bookmark icon on a restaurant to save it." />
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <DashboardSection
        title="Saved Restaurants"
        icon={<FiBookmark className="text-orange-500" />}
        restaurants={savedRestaurants}
        onSelect={(id) => navigate(`/restaurant/${id}`)}
      />
    </div>
  )
}
