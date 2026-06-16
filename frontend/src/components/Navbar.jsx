import { useState, useEffect } from 'react'
import { Leaf, Sun, Moon } from 'lucide-react'

export default function Navbar({ darkMode, toggleDark }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? (darkMode ? 'rgba(10, 15, 30, 0.9)' : 'rgba(240, 253, 244, 0.9)')
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(34, 197, 94, 0.15)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #16a34a, #059669)', boxShadow: '0 4px 15px rgba(22,163,74,0.4)' }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg gradient-text">AgriSmart</span>
              <span className="text-xs block" style={{ color: darkMode ? '#94a3b8' : '#64748b', marginTop: '-4px' }}>AI</span>
            </div>
          </div>

          {/* Right side - Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
              aria-label="Toggle dark mode"
            >
              {darkMode
                ? <Sun className="w-4 h-4 text-yellow-400" />
                : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
