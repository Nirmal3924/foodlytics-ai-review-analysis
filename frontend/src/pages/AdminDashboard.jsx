import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  FiBarChart2,
  FiGrid,
  FiLogOut,
  FiMoon,
  FiSettings,
  FiSun,
  FiUploadCloud,
  FiMenu,
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

import AdminSidebar from '../components/AdminSidebar'
import AdminOverview from '../components/admin/AdminOverview'
import AdminUpload from '../components/admin/AdminUpload'
import AdminAnalysis from '../components/admin/AdminAnalysis'
import AdminManage from '../components/admin/AdminManage'

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { key: 'upload', label: 'Upload Data', icon: FiUploadCloud },
  { key: 'analysis', label: 'Analysis', icon: FiBarChart2 },
  { key: 'manage', label: 'Manage', icon: FiSettings },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()

  const [tab, setTab] = useState('dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [lightMode, setLightMode] = useState(
    () => localStorage.getItem('zl_theme') !== 'dark'
  )

  const toggleLightMode = () => {
    setLightMode((value) => {
      const next = !value
      localStorage.setItem('zl_theme', next ? 'light' : 'dark')
      return next
    })
  }

  const content = {
    dashboard: (
      <AdminOverview
        lightMode={lightMode}
        onViewAll={() => setTab('manage')}
      />
    ),
    upload: <AdminUpload />,
    analysis: <AdminAnalysis />,
    manage: <AdminManage />,
  }

  return (
    <div
      className={`min-h-screen w-full lg:w-[90.909%] lg:origin-top-left lg:scale-110 overflow-x-hidden p-1.5 sm:p-3 transition-colors duration-500 ${
        lightMode
          ? 'bg-[#f7f9fc] text-[#12213d]'
          : 'bg-[#07111f] text-[#e8eef9]'
      }`}
    >
      <div className="mx-auto flex h-[calc(100vh-12px)] max-w-[1360px] gap-3 overflow-hidden sm:h-[calc(100vh-24px)]">
        <AdminSidebar
          tabs={TABS}
          activeTab={tab}
          onTabChange={setTab}
          user={user}
          onLogout={logout}
          lightMode={lightMode}
          onLightModeChange={toggleLightMode}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        <main
          className={`min-w-0 flex-1 overflow-y-auto rounded-[16px] px-1 py-1.5 sm:px-2 lg:px-3 transition-all duration-500 ${
            lightMode ? 'bg-[#f7f9fc]' : 'bg-[#07111f]'
          }`}
        >
          {/* Mobile Top Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mb-5 flex items-center justify-between rounded-2xl border p-4 shadow-[0_12px_30px_rgba(21,34,66,0.05)] lg:hidden ${
              lightMode
                ? 'border-[#e0e7f1] bg-white'
                : 'border-[#1c2d44] bg-[#0d1b2e]'
            }`}
          >
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className={`p-2 -ml-2 rounded-xl transition-colors ${lightMode ? 'text-[#102039] hover:bg-[#eef2f7]' : 'text-white hover:bg-[#1a2b45]'}`}
              >
                <FiMenu size={22} />
              </button>
              <div className="text-[24px] font-black tracking-[-0.02em]">
                <span className="text-[#ff4a13]">Foodly</span>
                <span className={lightMode ? 'text-[#102039]' : 'text-white'}>
                  tics
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.08, rotate: 10 }}
                onClick={toggleLightMode}
                className={`grid h-10 w-10 place-items-center rounded-xl ${
                  lightMode
                    ? 'text-[#52607a] hover:bg-[#eef2f7]'
                    : 'text-[#d9e5f5] hover:bg-[#1a2b45]'
                }`}
              >
                {lightMode ? <FiSun size={19} /> : <FiMoon size={19} />}
              </motion.button>

              {/* Logout Button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.08 }}
                onClick={logout}
                className="grid h-10 w-10 place-items-center rounded-xl text-[#ff3f3f] hover:bg-red-50"
              >
                <FiLogOut size={19} />
              </motion.button>
            </div>
          </motion.div>

          {/* Page Content Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35 }}
            >
              {content[tab]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}