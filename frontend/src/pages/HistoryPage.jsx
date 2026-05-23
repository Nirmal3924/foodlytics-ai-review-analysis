import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiClock } from 'react-icons/fi'
import DashboardSection from '../components/DashboardSection'
import EmptyPanel from '../components/EmptyPanel'

export default function HistoryPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('view_history') || '[]')
    setHistory(savedHistory)
  }, [])

  const clearHistory = () => {
    localStorage.removeItem('view_history')
    setHistory([])
  }

  if (history.length === 0) {
    return (
      <div className="animate-in fade-in duration-500 py-12">
        <EmptyPanel title="History" subtitle="You haven't viewed any restaurants yet. Your recently viewed restaurants will appear here." />
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <DashboardSection
        title="Recently Viewed"
        icon={<FiClock className="text-orange-500" />}
        restaurants={history}
        onSelect={(id) => navigate(`/restaurant/${id}`)}
        onViewAll={clearHistory}
        viewAllLabel="Clear History"
      />
    </div>
  )
}
