import { Heart } from 'lucide-react'

export default function Footer({ darkMode }) {
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500'

  return (
    <footer style={{
      borderTop: '1px solid rgba(34,197,94,0.15)',
      background: darkMode ? 'rgba(6,9,15,0.8)' : 'rgba(240,253,244,0.8)',
      backdropFilter: 'blur(20px)',
    }} className="mt-20">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-3 text-sm ${textMuted}`}>
          <p>© 2026 AgriSmart AI — Smart Fertilizer Recommendation System</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for sustainable farming
          </p>
        </div>
      </div>
    </footer>
  )
}
