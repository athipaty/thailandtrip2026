import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const LOCATIONS = [
  {
    id: 'cnx',
    name: 'Chiang Mai Airport',
    sub: 'Arrival & departure',
    lat: 18.768, lng: 98.963,
    days: [1, 10],
    type: 'airport',
  },
  {
    id: 'phayao',
    name: 'Phayao',
    sub: 'KM Kwanphayao Hotel · Days 1–5',
    lat: 19.166, lng: 99.904,
    days: [1, 2, 3, 4, 5],
    type: 'stay',
    leg: 'phayao',
  },
  {
    id: 'chiangrai',
    name: 'Chiang Rai',
    sub: 'Day trip — White & Blue Temples',
    lat: 19.910, lng: 99.840,
    days: [3],
    type: 'daytrip',
  },
  {
    id: 'phusang',
    name: 'Phu Sang Waterfall',
    sub: 'Day trip — hot-spring waterfall',
    lat: 19.500, lng: 100.350,
    days: [4],
    type: 'daytrip',
  },
  {
    id: 'chiangkham',
    name: 'Chiang Kham',
    sub: 'Wat Nantaram — teakwood temple',
    lat: 19.516, lng: 100.302,
    days: [4],
    type: 'daytrip',
  },
  {
    id: 'nongchom',
    name: 'Chiang Mai — Nong Chom',
    sub: 'Home in Nong Chom · Days 5–10',
    lat: 18.843, lng: 99.034,
    days: [5, 6, 7, 8, 9, 10],
    type: 'stay',
    leg: 'chiangmai',
  },
  {
    id: 'oldcity',
    name: 'Chiang Mai Old City',
    sub: 'Temples, markets, Night Bazaar',
    lat: 18.787, lng: 98.985,
    days: [6, 7, 9],
    type: 'activity',
  },
  {
    id: 'nimman',
    name: 'Nimman',
    sub: 'Restaurants, cafes, nightlife',
    lat: 18.800, lng: 98.969,
    days: [5, 6],
    type: 'activity',
  },
  {
    id: 'doiinthanon',
    name: 'Doi Inthanon',
    sub: 'Day trip — waterfalls & summit',
    lat: 18.589, lng: 98.486,
    days: [9],
    type: 'daytrip',
  },
]

const ROUTE = [
  // Arrival drive
  [18.768, 98.963], // CNX
  [18.900, 99.200],
  [19.166, 99.904], // Phayao
  // Chiang Rai day trip
  [19.166, 99.904],
  [19.910, 99.840],
  [19.166, 99.904],
  // Phu Sang day trip
  [19.166, 99.904],
  [19.516, 100.302],
  [19.500, 100.350],
  [19.166, 99.904],
  // Drive back to Chiang Mai
  [19.166, 99.904],
  [19.000, 99.200],
  [18.843, 99.034], // Nong Chom
  // Doi Inthanon day trip
  [18.843, 99.034],
  [18.589, 98.486],
  [18.843, 99.034],
  // Airport departure
  [18.843, 99.034],
  [18.768, 98.963],
]

const COLORS = {
  stay:     { bg: '#7c3aed', border: '#a855f7' }, // purple
  airport:  { bg: '#e65c00', border: '#f97316' }, // orange
  daytrip:  { bg: '#059669', border: '#34d399' }, // green
  activity: { bg: '#0ea5e9', border: '#38bdf8' }, // sky
  current:  { bg: '#f59e0b', border: '#fbbf24' }, // amber — current
  next:     { bg: '#ef4444', border: '#f87171' }, // red — next
}

function makeIcon(color, size = 12) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color.bg};border:2px solid ${color.border};box-shadow:0 0 8px ${color.border}88;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function makePulseIcon(color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:${color.bg};opacity:0.3;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:absolute;inset:3px;border-radius:50%;background:${color.bg};border:2px solid ${color.border};box-shadow:0 0 10px ${color.border};"></div>
      </div>
      <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export default function MapView({ activeDay }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layersRef = useRef([])

  // Determine current & next location for the active day
  const currentLocs = LOCATIONS.filter(l => l.days.includes(activeDay))
  const nextDayLocs = LOCATIONS.filter(l => l.days.includes(activeDay + 1) && !l.days.includes(activeDay))
  const primaryCurrent = currentLocs.find(l => l.type === 'stay') || currentLocs[0]
  const primaryNext = nextDayLocs.find(l => l.type === 'stay' || l.type === 'daytrip') || nextDayLocs[0]

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    const map = L.map(mapRef.current, {
      center: [19.0, 99.5],
      zoom: 8,
      zoomControl: true,
    })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18,
    }).addTo(map)
    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear previous layers
    layersRef.current.forEach(l => map.removeLayer(l))
    layersRef.current = []

    // Draw route
    const routeLine = L.polyline(ROUTE, { color: '#ffffff', weight: 1, opacity: 0.12, dashArray: '6 8' }).addTo(map)
    layersRef.current.push(routeLine)

    // Draw all location markers
    LOCATIONS.forEach(loc => {
      const isCurrent = loc === primaryCurrent
      const isNext = loc === primaryNext
      let icon
      if (isCurrent) icon = makePulseIcon(COLORS.current)
      else if (isNext) icon = makeIcon(COLORS.next, 14)
      else icon = makeIcon(COLORS[loc.type] || COLORS.activity, 10)

      const marker = L.marker([loc.lat, loc.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;min-width:140px">
            <strong style="font-size:13px">${loc.name}</strong>
            ${isCurrent ? '<span style="color:#f59e0b;font-size:11px;display:block">📍 You are here</span>' : ''}
            ${isNext ? '<span style="color:#ef4444;font-size:11px;display:block">➡️ Next stop</span>' : ''}
            <span style="color:#888;font-size:11px;display:block;margin-top:2px">${loc.sub}</span>
          </div>`,
          { closeButton: false }
        )
      layersRef.current.push(marker)

      if (isCurrent) {
        marker.openPopup()
        map.setView([loc.lat, loc.lng], 10, { animate: true })
      }
    })
  }, [activeDay, primaryCurrent, primaryNext])

  return (
    <div className="flex flex-col gap-3">
      {/* Status bar */}
      <div className="flex gap-2 flex-wrap">
        {primaryCurrent && (
          <div className="flex items-center gap-2 bg-amber-900/40 border border-amber-700/40 rounded-lg px-3 py-2 flex-1 min-w-0">
            <span className="text-amber-400 text-lg shrink-0">📍</span>
            <div className="min-w-0">
              <div className="text-[10px] text-amber-400/60 uppercase tracking-wider">Day {activeDay} · You are here</div>
              <div className="text-sm font-semibold text-amber-300 truncate">{primaryCurrent.name}</div>
              <div className="text-xs text-amber-400/50 truncate">{primaryCurrent.sub}</div>
            </div>
          </div>
        )}
        {primaryNext && (
          <div className="flex items-center gap-2 bg-red-900/40 border border-red-700/40 rounded-lg px-3 py-2 flex-1 min-w-0">
            <span className="text-red-400 text-lg shrink-0">➡️</span>
            <div className="min-w-0">
              <div className="text-[10px] text-red-400/60 uppercase tracking-wider">Day {activeDay + 1} · Next stop</div>
              <div className="text-sm font-semibold text-red-300 truncate">{primaryNext.name}</div>
              <div className="text-xs text-red-400/50 truncate">{primaryNext.sub}</div>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: 420 }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {[
          { color: COLORS.current.bg, label: 'Current (Day ' + activeDay + ')' },
          { color: COLORS.next.bg, label: 'Next stop' },
          { color: COLORS.stay.bg, label: 'Accommodation' },
          { color: COLORS.daytrip.bg, label: 'Day trip' },
          { color: COLORS.activity.bg, label: 'Activity' },
          { color: COLORS.airport.bg, label: 'Airport' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-xs text-white/40">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
