import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MiniMap({ coords, name }) {
  const ref = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!ref.current || mapRef.current) return
    const map = L.map(ref.current, { center: coords, zoom: 15, zoomControl: true, attributionControl: false })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map)
    L.marker(coords).addTo(map).bindPopup(name, { closeButton: false }).openPopup()
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: 300 }}>
        <div ref={ref} style={{ height: '100%', width: '100%' }} />
      </div>
      <a
        href={`https://maps.google.com/?q=${coords[0]},${coords[1]}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 transition-colors"
      >
        <span>🗺️</span> Open in Google Maps
      </a>
    </div>
  )
}

function WikiPhoto({ wiki, name }) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!wiki) { setStatus('none'); return }
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki)}`)
      .then(r => r.json())
      .then(d => {
        if (d.thumbnail) { setData(d); setStatus('ok') }
        else setStatus('none')
      })
      .catch(() => setStatus('error'))
  }, [wiki])

  if (status === 'loading') return (
    <div className="flex items-center justify-center h-48 text-white/30 text-sm">Loading photo…</div>
  )
  if (status === 'none' || status === 'error') return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-white/30 text-sm">
      <span className="text-3xl">🖼️</span>
      No reference photo available
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl overflow-hidden border border-white/10">
        <img
          src={data.originalimage?.source || data.thumbnail.source}
          alt={data.title}
          className="w-full object-cover"
          style={{ maxHeight: 300 }}
        />
      </div>
      <p className="text-sm text-white/60 leading-relaxed px-1">{data.extract}</p>
      <a
        href={data.content_urls?.desktop?.page}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 transition-colors"
      >
        <span>📖</span> Read on Wikipedia
      </a>
    </div>
  )
}

export default function ActivityDetail({ activity, onClose }) {
  const [tab, setTab] = useState(activity._openTab || (activity.coords ? 'map' : 'photo'))

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg bg-[#1a1a24] border border-white/10 rounded-t-2xl sm:rounded-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-white/10">
          <div className="pr-8">
            <div className="text-xs text-white/40 mb-0.5 uppercase tracking-wider">{activity.time}</div>
            <div className="text-sm font-semibold leading-snug">{activity.name || activity.label.split(' — ')[0]}</div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none mt-0.5 shrink-0">✕</button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/10">
          {activity.coords && (
            <button
              onClick={() => setTab('map')}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${tab === 'map' ? 'text-brand border-brand' : 'text-white/40 border-transparent hover:text-white/60'}`}
            >
              🗺️ Map
            </button>
          )}
          {activity.wiki && (
            <button
              onClick={() => setTab('photo')}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${tab === 'photo' ? 'text-brand border-brand' : 'text-white/40 border-transparent hover:text-white/60'}`}
            >
              📷 Reference Photo
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {tab === 'map' && activity.coords && <MiniMap coords={activity.coords} name={activity.name || 'Location'} />}
          {tab === 'photo' && activity.wiki && <WikiPhoto wiki={activity.wiki} name={activity.name} />}
        </div>
      </div>
    </div>
  )
}
