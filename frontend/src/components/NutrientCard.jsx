import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const levelConfig = {
  Low: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', icon: TrendingDown, label: 'Low' },
  Medium: { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', icon: Minus, label: 'Medium' },
  High: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', icon: TrendingUp, label: 'High' },
}

export default function NutrientCard({ name, value, level, advice, symbol, darkMode }) {
  const config = levelConfig[level] || levelConfig['Medium']
  const Icon = config.icon
  const pct = Math.min(100, (value / 140) * 100)

  return (
    <div className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: config.bg,
        border: `1.5px solid ${config.border}`,
      }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
            style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}>
            {symbol}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: config.color }}>{name}</p>
            <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Macronutrient</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: config.bg, border: `1px solid ${config.border}`, color: config.color }}>
          <Icon className="w-3 h-3" />
          {config.label}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
          <span>Value</span>
          <span className="font-bold" style={{ color: config.color }}>{value} kg/ha</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${config.color}, ${config.color}88)` }} />
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: '#64748b' }}>
          <span>0</span>
          <span>140</span>
        </div>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>{advice}</p>
    </div>
  )
}
