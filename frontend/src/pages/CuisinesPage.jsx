import { useOutletContext } from 'react-router-dom'
import CuisinesSection from '../components/CuisinesSection'

export default function CuisinesPage() {
  const { city, selectedCuisine, setSelectedCuisine, viewAllRestaurants, searchResults, navigate } = useOutletContext()

  return (
    <div className="animate-in fade-in duration-500">
      <CuisinesSection
        city={city}
        selectedCuisine={selectedCuisine}
        onSelectCuisine={setSelectedCuisine}
        viewAllRestaurants={viewAllRestaurants}
        searchResults={searchResults}
        onSelectRestaurant={(id) => navigate(`/restaurant/${id}`)}
      />
    </div>
  )
}
