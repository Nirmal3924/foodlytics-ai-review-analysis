import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { IoEyeOff, IoEye } from 'react-icons/io5'
import Navbar from '../components/Navbar' 
import Footer from '../components/Footer'

export default function LoginPage({ initialTab = 'login' }) {
  const { login, signup, resetPassword, verifyOtp, resendSignupOtp } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState(initialTab)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setTab(initialTab)
    setError('')
    setSuccess('')
    setOtp('')
  }, [initialTab])

  const rememberOtpDelivery = (res) => {
    setSuccess(res?.message || 'Verification code sent to your email.')
  }

  const handleResendOtp = async () => {
    if (!email) {
      setError('Enter your email address first')
      return
    }
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await resendSignupOtp(email)
      rememberOtpDelivery(res)
    } catch (err) {
      setError(err.message || 'Could not resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else if (tab === 'signup') {
        if (!name.trim()) { setError('Name is required'); setLoading(false); return }
        const res = await signup(name, email, password)
        rememberOtpDelivery(res)
        setTimeout(() => {
          setTab('verify')
          setError('')
        }, 2500)
      } else if (tab === 'verify') {
        if (!otp || otp.length !== 6) {
          setError('Please enter a valid 6-digit OTP code')
          setLoading(false)
          return
        }
        await verifyOtp(email, otp)
        setSuccess('Email verified successfully! Logging you in...')
        setTimeout(() => {
          setError('')
          setSuccess('')
          navigate('/dashboard')
        }, 2000)
      } else if (tab === 'forgot') {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }
        await resetPassword(email, password)
        setSuccess('Password updated successfully! Redirecting to Sign In...')
        setTimeout(() => {
          setError('')
          setSuccess('')
          setPassword('')
          setConfirmPassword('')
          setTab('login')
          navigate('/login')
        }, 2500)
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('not verified')) {
        setError(
          <span>
            Your account is not verified.{' '}
            <button
              type="button"
              onClick={() => { setTab('verify'); setError(''); setSuccess('') }}
              className="underline font-bold text-red-700 hover:text-red-950 ml-1 cursor-pointer"
            >
              Verify Email Now
            </button>
          </span>
        )
      } else {
        setError(err.message || 'Something went wrong')
      }
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

          {/* Tabs / Header */}
          {tab === 'forgot' ? (
            <div className="text-center px-8 mb-8">
              <h2 className="text-xl font-extrabold text-gray-900">Reset your password</h2>
              <p className="text-gray-400 text-xs mt-1">Enter your registered email and new password</p>
            </div>
          ) : tab === 'verify' ? (
            <div className="text-center px-8 mb-8">
              <h2 className="text-xl font-extrabold text-gray-900">Verify your Email</h2>
              <p className="text-gray-400 text-xs mt-1">We've sent a 6-digit verification code to your email</p>
            </div>
          ) : (
            <div className="flex px-8 mb-8">
              <button 
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${tab === 'login' ? 'border-orange-600 text-orange-600' : 'border-gray-100 text-gray-400 hover:text-gray-600'}`}
                onClick={() => { navigate('/login'); setError(''); setSuccess('') }}
              >
                Sign In
              </button>
              <button 
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${tab === 'signup' ? 'border-orange-600 text-orange-600' : 'border-gray-100 text-gray-400 hover:text-gray-600'}`}
                onClick={() => { navigate('/signup'); setError(''); setSuccess('') }}
              >
                Sign Up
              </button>
            </div>
          )}

          <div className="px-8 pb-10">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl text-center font-medium">
                {success}
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

              {tab === 'verify' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Verification Code (6-Digit OTP)</label>
                  <input 
                    value={otp} 
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                    placeholder="123456" 
                    required 
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all tracking-[0.25em] text-center font-black placeholder:tracking-normal placeholder:font-normal placeholder:text-gray-300 text-lg"
                  />
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="mt-3 text-xs font-semibold text-orange-600 hover:underline disabled:opacity-60"
                  >
                    Resend OTP
                  </button>
                </div>
              )}

              {tab !== 'verify' && (
                <div>
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {tab === 'forgot' ? 'New Password' : 'Password'}
                    </label>
                    {tab === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setTab('forgot'); navigate('/forgot-password'); setError(''); setSuccess('') }}
                        className="text-xs font-semibold text-orange-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
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
              )}

              {tab === 'forgot' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-gray-300 text-sm"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <IoEye size={20} /> : <IoEyeOff size={20} />}
                    </button>
                  </div>
                </div>
              )}

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
                  tab === 'login' ? 'Sign In' : tab === 'signup' ? 'Create Account' : tab === 'verify' ? 'Verify OTP' : 'Reset Password'
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              {tab === 'forgot' || tab === 'verify' ? (
                <button 
                  type="button" 
                  className="text-orange-600 font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                  onClick={() => { setTab('login'); navigate('/login'); setError(''); setSuccess('') }}
                >
                  ← Back to Sign In
                </button>
              ) : (
                <>
                  <span className="text-gray-400">
                    {tab === 'login' ? "Don't have an account?" : "Already have an account?"}
                  </span>
                  <button 
                    type="button" 
                    className="ml-2 text-orange-600 font-bold hover:underline"
                    onClick={() => { navigate(tab === 'login' ? '/signup' : '/login'); setError(''); setSuccess('') }}
                  >
                    {tab === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                  
                  {tab === 'login' && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <button 
                        type="button" 
                        className="text-orange-600 font-semibold hover:underline text-xs"
                        onClick={() => { setTab('verify'); setError(''); setSuccess('') }}
                      >
                        Verify an unverified account (Enter OTP)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <Footer onLogin={() => navigate('/login')} />
    </div>
  )
}
