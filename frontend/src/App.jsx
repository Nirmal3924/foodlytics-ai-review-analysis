import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LandingPage    from './pages/LandingPage'
import LoginPage    from './pages/LoginPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import RestaurantDetailPage from './pages/RestaurantDetailPage'

function LoadingScreen() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:28, fontWeight:700, color:'#E8401C' }}>Foodlytics</div>
      <div style={{ color:'#aaa', fontSize:14 }}>Loading...</div>
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/" element={
        !user ? <LandingPage onLogin={() => navigate('/login')} onSignUp={() => navigate('/signup')} /> : <Navigate to="/dashboard" />
      } />
      <Route path="/login" element={
        !user ? <LoginPage initialTab="login" /> : <Navigate to="/dashboard" />
      } />
      <Route path="/signup" element={
        !user ? <LoginPage initialTab="signup" /> : <Navigate to="/dashboard" />
      } />
      <Route path="/dashboard" element={
        user ? (user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />) : <Navigate to="/login" />
      } />
      <Route path="/restaurant/:id" element={
        user ? <RestaurantDetailPage /> : <Navigate to="/login" />
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
