import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IoEyeOff, IoEye } from 'react-icons/io5'
import Navbar from '../components/Navbar' 
import Footer from '../components/Footer'

export default function LoginPage({ initialTab = 'login' }) {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState(initialTab)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return }
        await signup(name, email, password)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Navbar ── */}
      <Navbar 
        onLogin={() => navigate('/login')} 
        onSignUp={() => navigate('/signup')} 
      />

      {/* ── Main Content ── */}
      <main
        className="flex-grow flex items-center justify-center pt-28 pb-16 px-4 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/loginpage.png')" }}
      >
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          
          {/* Logo Section */}
          <div className="pt-10 pb-6 text-center">
            <div className="text-3xl font-black tracking-tight">
              <span className="text-orange-600">Foodly</span>
              <span className="text-gray-900">tics</span>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
              Restaurant Analytics
            </p>
          </div>

          {/* Tabs */}
          <div className="flex px-8 mb-8">
            <button 
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${tab === 'login' ? 'border-orange-600 text-orange-600' : 'border-gray-100 text-gray-400 hover:text-gray-600'}`}
              onClick={() => { navigate('/login'); setError('') }}
            >
              Sign In
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${tab === 'signup' ? 'border-orange-600 text-orange-600' : 'border-gray-100 text-gray-400 hover:text-gray-600'}`}
              onClick={() => { navigate('/signup'); setError('') }}
            >
              Sign Up
            </button>
          </div>

          <div className="px-8 pb-10">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {tab === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                  <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Nirmal Mahto" 
                    required 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-gray-300 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="abc@gmail.com" 
                  required 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-gray-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-gray-300 text-sm"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <IoEye size={20} /> : <IoEyeOff size={20} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  tab === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-gray-400">
                {tab === 'login' ? "Don't have an account?" : "Already have an account?"}
              </span>
              <button 
                type="button" 
                className="ml-2 text-orange-600 font-bold hover:underline"
                onClick={() => { navigate(tab === 'login' ? '/signup' : '/login'); setError('') }}
              >
                {tab === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <Footer onLogin={() => navigate('/login')} />
    </div>
  )
}