export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-14 h-14', lg: 'w-20 h-20' }
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative">
        <div className={`${sizes[size]} loading-spinner`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>
      {text && <p className="text-sm font-medium text-slate-400 animate-pulse">{text}</p>}
    </div>
  )
}
