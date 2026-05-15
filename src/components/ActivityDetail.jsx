import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ─── Mini Map ─────────────────────────────────────────────────────────────────
function MiniMap({ coords, name }) {
  const ref    = useRef(null)
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
        target="_blank" rel="noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 transition-colors"
      >
        🗺️ Open in Google Maps
      </a>
    </div>
  )
}

// ─── Photo Gallery ────────────────────────────────────────────────────────────
const SKIP_PATTERN = /\.(svg|gif)$|icon|logo|flag|seal|coat.of.arm|locator|map|wikimedia|commons-logo|edit|button/i

function WikiGallery({ wiki }) {
  const [images,  setImages]  = useState([])
  const [summary, setSummary] = useState(null)
  const [status,  setStatus]  = useState('loading')
  const [active,  setActive]  = useState(0)

  useEffect(() => {
    if (!wiki) { setStatus('none'); return }
    setStatus('loading')
    setImages([])
    setActive(0)

    Promise.all([
      fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(wiki)}`)
        .then(r => r.json()).catch(() => ({ items: [] })),
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki)}`)
        .then(r => r.json()).catch(() => null),
    ]).then(([media, sum]) => {
      setSummary(sum)

      // Filter to real photos only
      const photos = (media.items || [])
        .filter(item =>
          item.type === 'image' &&
          item.original?.source &&
          !SKIP_PATTERN.test(item.title) &&
          (item.original.width ?? 0) >= 400
        )
        .slice(0, 10)
        .map(item => ({
          full:  item.original.source,
          thumb: item.thumbnail?.source || item.original.source,
          title: item.title.replace(/^File:/, '').replace(/_/g, ' ').replace(/\.[a-z]+$/i, ''),
        }))

      // If media-list gave nothing, fall back to summary thumbnail
      if (photos.length === 0 && sum?.thumbnail) {
        photos.push({
          full:  sum.originalimage?.source || sum.thumbnail.source,
          thumb: sum.thumbnail.source,
          title: sum.title,
        })
      }

      if (photos.length === 0) { setStatus('none'); return }
      setImages(photos)
      setStatus('ok')
    })
  }, [wiki])

  if (status === 'loading') return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="rounded-xl bg-white/5 border border-white/10" style={{ height: 260 }} />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => <div key={i} className="flex-1 rounded-lg bg-white/5" style={{ height: 60 }} />)}
      </div>
    </div>
  )

  if (status === 'none') return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-white/30 text-sm">
      <span className="text-3xl">🖼️</span>
      No reference photos available
    </div>
  )

  const current = images[active]

  return (
    <div className="flex flex-col gap-3">

      {/* Main image */}
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black" style={{ height: 260 }}>
        <img
          key={current.full}
          src={current.full}
          alt={current.title}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={e => { e.target.style.display = 'none' }}
        />
        {/* Counter badge */}
        <div className="absolute top-2 right-2 bg-black/60 text-white/70 text-xs px-2 py-0.5 rounded-full">
          {active + 1} / {images.length}
        </div>
        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive(i => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >‹</button>
            <button
              onClick={() => setActive(i => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >›</button>
          </>
        )}
      </div>

      {/* Caption */}
      {current.title && (
        <p className="text-xs text-white/30 px-1 truncate">{current.title}</p>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === active ? 'border-brand' : 'border-transparent opacity-50 hover:opacity-80'}`}
              style={{ width: 64, height: 48 }}
            >
              <img
                src={img.thumb}
                alt={img.title}
                className="w-full h-full object-cover"
                onError={e => { e.target.closest('button').style.display = 'none' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Description */}
      {summary?.extract && (
        <p className="text-sm text-white/50 leading-relaxed px-1 line-clamp-4">{summary.extract}</p>
      )}

      {/* Wikipedia link */}
      {summary?.content_urls?.desktop?.page && (
        <a
          href={summary.content_urls.desktop.page}
          target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 transition-colors"
        >
          📖 Read on Wikipedia
        </a>
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-[#1a1a24] border border-white/10 rounded-t-2xl sm:rounded-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-white/10">
          <div className="pr-8">
            <div className="text-xs text-white/40 mb-0.5 uppercase tracking-wider">{activity.time}</div>
            <div className="text-sm font-semibold leading-snug">{activity.name || activity.label.split(' — ')[0]}</div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none mt-0.5 shrink-0">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {activity.coords && (
            <button
              onClick={() => setTab('map')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'map' ? 'text-brand border-brand' : 'text-white/40 border-transparent hover:text-white/60'}`}
            >
              🗺️ Map
            </button>
          )}
          {activity.wiki && (
            <button
              onClick={() => setTab('photo')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'photo' ? 'text-brand border-brand' : 'text-white/40 border-transparent hover:text-white/60'}`}
            >
              📷 Photos
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '65vh' }}>
          {tab === 'map'   && activity.coords && <MiniMap     coords={activity.coords} name={activity.name || 'Location'} />}
          {tab === 'photo' && activity.wiki   && <WikiGallery wiki={activity.wiki} />}
        </div>
      </div>
    </div>
  )
}
