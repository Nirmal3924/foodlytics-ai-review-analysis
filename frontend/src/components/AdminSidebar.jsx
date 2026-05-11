import {
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSun,
} from 'react-icons/fi'
import { useState } from 'react'

export default function AdminSidebar({ tabs, activeTab, onTabChange, user, onLogout, lightMode, onLightModeChange }) {
  const [collapsed, setCollapsed] = useState(false)
  const panel = lightMode ? 'border-[#e6ebf3] bg-white' : 'border-[#1c2d44] bg-[#0d1b2e]'
  const subtlePanel = lightMode ? 'border-[#e6ebf3] bg-white' : 'border-[#223650] bg-[#12233a]'
  const mutedText = lightMode ? 'text-[#67758f]' : 'text-[#9cadc5]'

  return (
    <aside className={`hidden shrink-0 flex-col overflow-hidden rounded-[14px] border shadow-[0_18px_50px_rgba(21,34,66,0.08)] transition-all duration-200 lg:flex ${panel} ${collapsed ? 'w-[74px]' : 'w-[210px]'}`}>
      <div className="flex items-center justify-between px-4 py-4">
        <div className={`text-[20px] font-black tracking-[-0.02em] ${collapsed ? 'hidden' : ''}`}>
          <span className="text-[#ff4a13]">Foodly</span>
          <span className={lightMode ? 'text-[#102039]' : 'text-white'}>tics</span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className={`grid h-9 w-9 place-items-center rounded-lg transition-all duration-200 hover:scale-[1.08] active:scale-[0.98] ${lightMode ? 'text-[#63708a] hover:bg-[#f4f6fa] hover:text-[#102039]' : 'text-[#9cadc5] hover:bg-[#1a2b45] hover:text-white'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <FiMenu size={20} />
        </button>
      </div>

      <nav className="space-y-1.5 px-2.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex h-[40px] w-full items-center gap-2.5 rounded-[9px] px-2.5 text-left text-[13px] font-semibold transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.98] ${
                isActive
                  ? 'bg-[#fff1eb] text-[#ff4a13] shadow-[inset_0_0_0_1px_rgba(255,74,19,0.04)]'
                  : lightMode
                    ? 'text-[#52607a] hover:bg-[#f7f9fc] hover:text-[#102039]'
                    : 'text-[#9cadc5] hover:bg-[#1a2b45] hover:text-white'
              }`}
              title={tab.label}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-lg ${
                  isActive ? 'text-[#ff4a13]' : 'text-[#5e6d89]'
                }`}
              >
                <Icon size={18} strokeWidth={1.9} />
              </span>
              {!collapsed && tab.label}
            </button>
          )
        })}
      </nav>

      {!collapsed && <div className="relative mx-3 mt-auto h-[145px] overflow-hidden">
        <div className="absolute left-1/2 top-[26px] h-[50px] w-[50px] -translate-x-1/2 rounded-full bg-[#ffb84d]/20 blur-sm" />
        <div className="absolute left-1/2 top-[32px] h-11 w-11 -translate-x-1/2 rounded-full border-[8px] border-[#ffc767] border-t-transparent shadow-[0_10px_24px_rgba(255,149,32,0.16)]" />
        <div className="absolute left-[30px] top-[78px] h-3 w-3 rounded-full bg-[#ef4444]/80" />
        <div className="absolute right-[34px] top-[82px] h-4 w-4 rounded-full bg-[#22c55e]/80" />
        <div className="absolute bottom-1 left-1/2 h-[54px] w-[112px] -translate-x-1/2 rounded-b-[54px] rounded-t-[18px] border border-[#dfe8f4] bg-gradient-to-b from-white to-[#eef5f7] shadow-[0_16px_28px_rgba(23,37,62,0.12)]" />
        <div className="absolute bottom-6 left-1/2 h-[38px] w-[92px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#f97316] via-[#f9c74f] to-[#22c55e] opacity-90" />
      </div>}

      <div className={`mt-auto space-y-2.5 px-4 pb-4 ${collapsed ? 'px-2.5' : ''}`}>
        <button
          type="button"
          onClick={onLightModeChange}
          className={`flex w-full items-center justify-between rounded-[9px] border px-3 py-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] ${subtlePanel} ${lightMode ? 'hover:bg-[#f7f9fc]' : 'hover:bg-[#1a2b45]'} ${collapsed ? 'justify-center px-2' : ''}`}
          title={lightMode ? 'Light mode on' : 'Light mode off'}
        >
          <div className={`flex items-center gap-3 text-[13px] font-medium ${mutedText} ${collapsed ? 'hidden' : ''}`}>
            {lightMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            {lightMode ? 'Light Mode' : 'Dark Mode'}
          </div>
          {collapsed && (lightMode ? <FiSun size={18} className={mutedText} /> : <FiMoon size={18} className={mutedText} />)}
          <div className={`flex h-7 w-12 items-center rounded-full p-1 transition ${lightMode ? 'bg-[#dbe6f7]' : 'bg-[#cbd5e1]'}`}>
            <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${lightMode ? 'translate-x-0' : 'translate-x-5'}`} />
          </div>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className={`flex items-center gap-2.5 px-3 py-1.5 text-[12px] font-semibold text-[#ff3f3f] transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] hover:text-[#d91f1f] ${collapsed ? 'justify-center px-0' : ''}`}
          title="Logout"
        >
          <FiLogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  )
}
