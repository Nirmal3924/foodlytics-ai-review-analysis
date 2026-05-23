import { useState } from 'react'
import {
  FiArrowRight, FiBarChart2, FiSearch, FiShield, FiActivity, FiTrendingUp, FiAward,
  FiInfo, FiUser, FiLock, FiUpload, FiPieChart, FiSettings, FiZap,
  FiLogIn, FiFilter, FiGrid, FiStar
} from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function LandingPage({ onLogin, onSignUp }) {
  const [hoverFeature, setHoverFeature] = useState(null)

  const features = [
    { icon: <FiSearch size={24} />, title: 'Smart Search', desc: 'Find restaurants by name, cuisine, or location with real-time debounced search.' },
    { icon: <FiBarChart2 size={24} />, title: 'Analytics Dashboard', desc: 'Visualize ratings, reviews, and trends with interactive Chart.js dashboards.' },
    { icon: <FiActivity size={24} />, title: 'Sentiment Analysis', desc: 'Lexicon-based sentiment scoring with negation detection on every review.' },
    { icon: <FiTrendingUp size={24} />, title: 'Trend Analysis', desc: 'Identify patterns and trends over time with interactive graphs.' },
    { icon: <FiShield size={24} />, title: 'Role-Based Access', desc: 'Secure JWT authentication with separate User and Admin panels.' },
    { icon: <FiAward size={24} />, title: 'Restaurant Insights', desc: 'Get top-performing restaurants and hidden gems instantly.' }
  ]

  const userSteps = [
    { icon: <FiLogIn size={18} />, text: 'Sign in with your email and password' },
    { icon: <FiSearch size={18} />, text: 'Search restaurants by name or location' },
    { icon: <FiFilter size={18} />, text: 'Apply filters: Rating, Category, Price' },
    { icon: <FiGrid size={18} />, text: 'View details, reviews, and sentiment' },
    { icon: <FiStar size={18} />, text: 'Explore Top & Overrated sections' },
  ]

  const adminSteps = [
    { icon: <FiLock size={18} />, text: 'Access Admin Dashboard securely' },
    { icon: <FiUpload size={18} />, text: 'Upload CSV files via drag-and-drop' },
    { icon: <FiTrendingUp size={18} />, text: 'Run Analysis & K-Means Clustering' },
    { icon: <FiPieChart size={18} />, text: 'View live stats and distributions' },
    { icon: <FiSettings size={18} />, text: 'Manage restaurants via CRUD' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">
      <Navbar onLogin={onLogin} onSignUp={onSignUp} />

      {/* ── HERO SECTION ── */}
      <section className="flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto px-6 md:px-8 lg:px-12 py-12 lg:py-20 gap-8 lg:gap-12 pt-24 lg:pt-32">
        <div className="flex-1 text-center lg:text-left w-full">
          <div className="inline-block px-4 py-1.5 mb-4 lg:mb-6 bg-orange-100 text-orange-600 text-xs font-bold rounded-full uppercase tracking-wider">
            Using AI Insights
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-4 lg:mb-6 tracking-tight">
            Discover Insights from
            <span className="block text-orange-600"> Restaurant Data</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
            Foodlytics analyzes Zomato reviews using sentiment analysis and clustering to help you uncover trends and make data-driven dining decisions.
          </p>
          <div className="flex justify-center lg:justify-start gap-4">
            <button onClick={onSignUp} className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 w-full sm:w-auto bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition shadow-lg hover:-translate-y-0.5">
              Get Started <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Dashboard Card */}
        <div className="flex-1 flex justify-center lg:justify-end w-full mt-8 lg:mt-0">
          <div className="w-full max-w-sm md:max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">105</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold">Res.</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">10K</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold">Reviews</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">4.2</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold">Rating</div>
                </div>
              </div>
              <div className="flex items-end justify-center gap-1 sm:gap-2 h-20 sm:h-24">
                {[30, 60, 45, 80, 55, 70].map((h, i) => (
                  <div key={i} className="w-4 sm:w-6 rounded-t-md bg-orange-500" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-6xl mx-auto px-6 md:px-8 py-12 lg:py-16">
        <div className="text-center mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">Powerful Features</h2>
          <p className="text-gray-500 text-sm sm:text-base">Built with React, FastAPI, and Sentiment Analysis</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-5 sm:p-6 bg-white rounded-xl border border-gray-100 hover:shadow-xl transition-all cursor-default">
              <div className="w-10 h-10 flex items-center justify-center bg-orange-50 text-orange-600 rounded-lg mb-4">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ── HOW IT WORKS SECTION ── */}
      <section id="help" className="max-w-6xl mx-auto px-6 md:px-8 py-12 lg:py-20">
        <div className="text-center mb-10 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 sm:mb-4 tracking-tight">
            How <span className="text-orange-600">Foodlytics</span> Works
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg">Step-by-step guide for Users and Admins</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* USER COLUMN */}
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 w-fit px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-4 sm:mb-6 border border-blue-100 uppercase tracking-wide">
              <FiUser size={14} /> User
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 sm:mb-10">Browsing Restaurants</h3>

            <div className="space-y-6 sm:space-y-8">
              {userSteps.map((step, i) => (
                <div key={i} className="flex gap-4 sm:gap-6 items-center group">
                  {/* Number Badge */}
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-blue-200">
                    {i + 1}
                  </div>
                  {/* Icon Box */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-lg sm:text-xl border border-blue-100 group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  {/* Text */}
                  <p className="text-gray-600 text-sm sm:text-[15px] font-medium leading-tight">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ADMIN COLUMN */}
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 w-fit px-4 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-full mb-4 sm:mb-6 border border-orange-100 uppercase tracking-wide">
              <FiLock size={14} /> Admin
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 sm:mb-10">Managing the Platform</h3>

            <div className="space-y-6 sm:space-y-8">
              {adminSteps.map((step, i) => (
                <div key={i} className="flex gap-4 sm:gap-6 items-center group">
                  {/* Number Badge */}
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-orange-200">
                    {i + 1}
                  </div>
                  {/* Icon Box */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 text-lg sm:text-xl border border-orange-100 group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  {/* Text */}
                  <p className="text-gray-600 text-sm sm:text-[15px] font-medium leading-tight">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MOCK DASHBOARDS (Reduced Space) ── */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mt-12 lg:mt-20">
          {/* Search Mock */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="p-4 sm:p-8">
              <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8 flex items-center gap-2">
                <FiSearch /> Search restaurants...
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[4.5, 4.2, 4.7].map((rating, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0">
                    <div className="h-12 sm:h-20 w-12 sm:w-auto bg-gray-50 rounded-lg sm:rounded-xl sm:mb-4 shrink-0" />
                    <div className="flex-1 sm:flex-none">
                      <div className="text-[10px] font-bold text-amber-500 flex sm:justify-center gap-0.5">
                        <FiStar size={10} fill="currentColor" />
                        <FiStar size={10} fill="currentColor" />
                        <FiStar size={10} fill="currentColor" />
                        <FiStar size={10} fill="currentColor" />
                        <FiStar size={10} fill="currentColor" />
                      </div>
                      <div className="sm:text-center font-bold text-gray-700 mt-1">{rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Mock */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:inline-block">Dashboard Overview</span>
            </div>
            <div className="p-4 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
                {[
                  { v: '105', l: 'Restaurants' },
                  { v: '10K', l: 'Reviews' },
                  { v: '4.2', l: 'Rating' },
                  { v: '89%', l: 'Positive' }
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center border border-gray-100">
                    <div className="text-base sm:text-lg font-black text-gray-900 leading-none">{s.v}</div>
                    <div className="text-[8px] sm:text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-center gap-1.5 sm:gap-2 h-16 sm:h-20">
                {[40, 70, 55, 90, 65, 80].map((h, i) => (
                  <div key={i} className="w-full max-w-[16px] sm:max-w-[20px] rounded-t-lg bg-gradient-to-t from-orange-600 to-orange-400" style={{ height: `${h}%` }} />
                ))}
                <div className="ml-2 sm:ml-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-[5px] sm:border-[6px] border-orange-500 border-t-blue-500 border-l-green-500 rotate-45" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer onLogin={onLogin} onSignUp={onSignUp} />
    </div>
  )
}