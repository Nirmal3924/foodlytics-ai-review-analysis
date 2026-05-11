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
      className={`min-h-screen w-[90.909%] origin-top-left scale-110 overflow-x-hidden p-1.5 sm:p-3 transition-colors duration-500 ${
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
            className={`mb-5 rounded-2xl border p-4 shadow-[0_12px_30px_rgba(21,34,66,0.05)] lg:hidden ${
              lightMode
                ? 'border-[#e0e7f1] bg-white'
                : 'border-[#1c2d44] bg-[#0d1b2e]'
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-[24px] font-black tracking-[-0.02em]">
                <span className="text-[#ff4a13]">Foodly</span>
                <span className={lightMode ? 'text-[#102039]' : 'text-white'}>
                  tics
                </span>
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
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TABS.map((tabItem) => {
                const Icon = tabItem.icon
                const isActive = tab === tabItem.key

                return (
                  <motion.button
                    key={tabItem.key}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -2 }}
                    onClick={() => setTab(tabItem.key)}
                    className={`relative flex h-11 items-center justify-center gap-2 rounded-xl text-[12px] font-bold overflow-hidden ${
                      isActive
                        ? 'bg-[#fff1eb] text-[#ff4a13]'
                        : lightMode
                        ? 'bg-[#f7f9fc] text-[#52607a] hover:bg-[#eef2f7]'
                        : 'bg-[#132238] text-[#a9b7cc] hover:bg-[#1a2b45]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-xl border border-[#ff4a13]"
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 25,
                        }}
                      />
                    )}

                    <Icon size={16} className="relative z-10" />
                    <span className="relative z-10">{tabItem.label}</span>
                  </motion.button>
                )
              })}
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