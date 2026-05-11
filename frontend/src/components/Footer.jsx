import { FiInstagram, FiTwitter, FiLinkedin, FiGithub } from 'react-icons/fi'

const SOCIAL_LINKS = [
  { icon: FiInstagram, label: 'Instagram' },
  { icon: FiTwitter, label: 'Twitter' },
  { icon: FiLinkedin, label: 'LinkedIn' },
  { icon: FiGithub, label: 'GitHub' },
]

const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#help' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#about' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#help' },
      { label: 'Privacy', href: '#' },
    ],
  },
]

export default function Footer({ onLogin, onSignUp }) {
  return (
    <footer className="bg-[#111315] px-6 py-12 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-orange-300">
              Restaurant Intelligence
            </div>

            <div className="mb-2 text-3xl font-black tracking-tight">
              <span className="text-orange-500">Foodly</span>
              <span className="text-white">tics</span>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-gray-400">
              Analyzing restaurant reviews, ratings, and trends with sentiment analysis and clear dashboards.
            </p>

            <div className="mt-6 flex gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/70 hover:bg-orange-500 hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_GROUPS.map(group => (
              <div key={group.title}>
                <h4 className="mb-4 text-sm font-bold text-white">{group.title}</h4>
                <div className="space-y-3 text-sm">
                  {group.links.map(link => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="block text-gray-400 transition-colors hover:text-orange-300"
                    >
                      {link.label}
                    </a>
                  ))}
                  {group.title === 'Product' && (
                    <button
                      onClick={onLogin}
                      className="block text-left text-gray-400 transition-colors hover:text-orange-300"
                    >
                      Dashboard
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <div>Copyright 2026 Foodlytics. All rights reserved.</div>
          <div className="text-gray-400">Made with care in India</div>
        </div>
      </div>
    </footer>
  )
}
