import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Zap, Info, Lightbulb, Award, ChevronDown } from 'lucide-react'
import NutrientCard from '../components/NutrientCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const SOIL_TYPES = ['Sandy', 'Loamy', 'Black', 'Red', 'Clayey']
const CROP_TYPES = ['Maize', 'Sugarcane', 'Cotton', 'Tobacco', 'Paddy', 'Barley', 'Wheat', 'Millets', 'Oil seeds', 'Pulses', 'Ground Nuts']

const DEFAULT_FORM = {
  nitrogen: '',
  phosphorous: '',
  potassium: '',
  temperature: '',
  humidity: '',
  moisture: '',
  soil_type: '',
  crop_type: '',
}

const SAMPLE_DATA = {
  nitrogen: 37,
  phosphorous: 0,
  potassium: 0,
  temperature: 26.5,
  humidity: 52.0,
  moisture: 38.0,
  soil_type: 'Sandy',
  crop_type: 'Wheat',
}

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export default function Predict({ darkMode }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const isDark = darkMode
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a'
  const textMuted = isDark ? '#94a3b8' : '#64748b'
  const inputClass = isDark ? 'input-field' : 'input-field-light'

  const validate = () => {
    const e = {}
    if (form.nitrogen === '' || form.nitrogen < 0 || form.nitrogen > 140) e.nitrogen = 'Must be 0–140'
    if (form.phosphorous === '' || form.phosphorous < 0 || form.phosphorous > 140) e.phosphorous = 'Must be 0–140'
    if (form.potassium === '' || form.potassium < 0 || form.potassium > 140) e.potassium = 'Must be 0–140'
    if (form.temperature === '' || form.temperature < -10 || form.temperature > 60) e.temperature = 'Must be -10 to 60°C'
    if (form.humidity === '' || form.humidity < 0 || form.humidity > 100) e.humidity = 'Must be 0–100%'
    if (form.moisture === '' || form.moisture < 0 || form.moisture > 100) e.moisture = 'Must be 0–100%'
    if (!form.soil_type) e.soil_type = 'Select soil type'
    if (!form.crop_type) e.crop_type = 'Select crop type'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix form errors'); return }
    setLoading(true)
    setResult(null)
    try {
      const payload = {
        nitrogen: Number(form.nitrogen),
        phosphorous: Number(form.phosphorous),
        potassium: Number(form.potassium),
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
        moisture: Number(form.moisture),
        soil_type: form.soil_type,
        crop_type: form.crop_type,
      }
      const { data } = await axios.post(`${API_BASE}/predict`, payload, { timeout: 15000 })
      setResult(data)

      // Save to history
      const history = JSON.parse(localStorage.getItem('predictions') || '[]')
      history.unshift({ ...payload, ...data, id: Date.now() })
      localStorage.setItem('predictions', JSON.stringify(history.slice(0, 100)))
      toast.success(`Recommended: ${data.fertilizer}!`)

      setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      if (err.response?.status === 503) {
        toast.error('Model not loaded. Please run: python model/train.py')
      } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        toast.error('Backend offline. Start with: uvicorn app:app --reload')
      } else {
        toast.error(err.response?.data?.detail || 'Prediction failed. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => {
    setForm(SAMPLE_DATA)
    setErrors({})
    toast.success('Sample data loaded!')
  }

  const radarData = result ? [
    { subject: 'N', value: result.nitrogen_analysis?.value || 0, max: 140 },
    { subject: 'P', value: result.phosphorous_analysis?.value || 0, max: 140 },
    { subject: 'K', value: result.potassium_analysis?.value || 0, max: 140 },
    { subject: 'Temp', value: Number(form.temperature) || 0, max: 60 },
    { subject: 'Humidity', value: Number(form.humidity) || 0, max: 100 },
    { subject: 'Moisture', value: Number(form.moisture) || 0, max: 100 },
  ] : []

  const top3Data = result?.top3?.map(t => ({ name: t.fertilizer, confidence: t.confidence })) || []

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm font-medium"
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
          <Zap className="w-4 h-4" />
          AI Prediction Engine
        </div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4" style={{ color: textPrimary }}>
          Fertilizer <span className="gradient-text">Recommendation</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: textMuted }}>
          Enter your soil and environmental data to get AI-powered fertilizer recommendations
        </p>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="card p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl" style={{ color: textPrimary }}>
                🌿 Soil & Crop Parameters
              </h2>
              <button type="button" onClick={loadSample}
                className="text-xs px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
                Load Sample
              </button>
            </div>

            {/* NPK Row */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#22c55e' }}>
                🧪 Macronutrients (kg/ha)
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { key: 'nitrogen', label: 'Nitrogen (N)', placeholder: '0–140', emoji: '🟢' },
                  { key: 'phosphorous', label: 'Phosphorous (P)', placeholder: '0–140', emoji: '🟡' },
                  { key: 'potassium', label: 'Potassium (K)', placeholder: '0–140', emoji: '🔴' },
                ].map(({ key, label, placeholder, emoji }) => (
                  <div key={key}>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: textMuted }}>
                      {emoji} {label}
                    </label>
                    <input
                      type="number" step="0.1" min="0" max="140"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className={inputClass}
                    />
                    {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key]}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Environmental Row */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#06b6d4' }}>
                🌡️ Environmental Conditions
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { key: 'temperature', label: 'Temperature (°C)', placeholder: '-10 to 60', emoji: '🌡️' },
                  { key: 'humidity', label: 'Humidity (%)', placeholder: '0–100', emoji: '💧' },
                  { key: 'moisture', label: 'Moisture (%)', placeholder: '0–100', emoji: '🌊' },
                ].map(({ key, label, placeholder, emoji }) => (
                  <div key={key}>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: textMuted }}>
                      {emoji} {label}
                    </label>
                    <input
                      type="number" step="0.1"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className={inputClass}
                    />
                    {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key]}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Type dropdowns */}
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#f59e0b' }}>
                🌾 Soil & Crop Type
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: 'soil_type', label: 'Soil Type', options: SOIL_TYPES, emoji: '🏔️' },
                  { key: 'crop_type', label: 'Crop Type', options: CROP_TYPES, emoji: '🌾' },
                ].map(({ key, label, options, emoji }) => (
                  <div key={key}>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: textMuted }}>
                      {emoji} {label}
                    </label>
                    <div className="relative">
                      <select
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className={inputClass}
                        style={{ appearance: 'none' }}
                      >
                        <option value="">Select {label}</option>
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: textMuted }} />
                    </div>
                    {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key]}</p>}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <div className="w-5 h-5 loading-spinner border-white border-t-transparent" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Get Fertilizer Recommendation
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading state */}
        {loading && (
          <div className="card p-12 text-center">
            <LoadingSpinner size="lg" text="AI is analyzing your soil data..." />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div id="result-section" className="space-y-6 animate-fade-in">
            {/* Main Result Card */}
            <div className="card p-8 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top right, rgba(34,197,94,0.08) 0%, transparent 60%)' }} />
              <div className="relative">
                <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <div className="badge badge-green mb-3 text-sm">
                      <Award className="w-3 h-3" />
                      Recommended Fertilizer
                    </div>
                    <h2 className="font-display font-black text-4xl sm:text-5xl gradient-text mb-2">
                      {result.fertilizer}
                    </h2>
                    <p className="text-sm" style={{ color: textMuted }}>
                      For {form.crop_type} on {form.soil_type} soil
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="relative w-28 h-28 mx-auto">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                        <circle cx="60" cy="60" r="50" fill="none" stroke="url(#grad)" strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 50 * result.confidence / 100} ${2 * Math.PI * 50}`} />
                        <defs>
                          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-display font-black text-2xl" style={{ color: '#22c55e' }}>{result.confidence}%</span>
                        <span className="text-xs" style={{ color: textMuted }}>confidence</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="rounded-xl p-4 mb-4"
                  style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{result.explanation}</p>
                  </div>
                </div>

                {/* Top 3 */}
                {result.top3?.length > 1 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: textMuted }}>
                      Top Alternatives
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {result.top3.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                          style={{ background: i === 0 ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${i === 0 ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                          <span className="font-bold" style={{ color: i === 0 ? '#22c55e' : textMuted }}>#{i + 1}</span>
                          <span style={{ color: textPrimary }}>{t.fertilizer}</span>
                          <span className="font-bold" style={{ color: i === 0 ? '#22c55e' : textMuted }}>{t.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nutrient Analysis */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-xl mb-6" style={{ color: textPrimary }}>
                🧪 Soil Nutrient Analysis
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <NutrientCard
                  name="Nitrogen" symbol="N" darkMode={isDark}
                  value={result.nitrogen_analysis?.value}
                  level={result.nitrogen_analysis?.level}
                  advice={result.nitrogen_analysis?.advice}
                />
                <NutrientCard
                  name="Phosphorous" symbol="P" darkMode={isDark}
                  value={result.phosphorous_analysis?.value}
                  level={result.phosphorous_analysis?.level}
                  advice={result.phosphorous_analysis?.advice}
                />
                <NutrientCard
                  name="Potassium" symbol="K" darkMode={isDark}
                  value={result.potassium_analysis?.value}
                  level={result.potassium_analysis?.level}
                  advice={result.potassium_analysis?.advice}
                />
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div className="card p-6">
                <h3 className="font-display font-bold text-lg mb-4" style={{ color: textPrimary }}>
                  📊 Soil Profile Radar
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: textMuted, fontSize: 12 }} />
                    <Radar name="Soil Profile" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Top 3 Bar Chart */}
              <div className="card p-6">
                <h3 className="font-display font-bold text-lg mb-4" style={{ color: textPrimary }}>
                  🏆 Confidence Comparison
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={top3Data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: textMuted, fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fill: textMuted, fontSize: 11 }} width={100} />
                    <Tooltip
                      contentStyle={{ background: '#0d1929', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', color: '#f1f5f9' }}
                      formatter={(v) => [`${v}%`, 'Confidence']}
                    />
                    <Bar dataKey="confidence" fill="#22c55e" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tips */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h3 className="font-display font-bold text-xl" style={{ color: textPrimary }}>
                  Farming Tips & Best Practices
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {result.farming_tips?.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
