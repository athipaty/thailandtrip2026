import { useState } from 'react'
import { tripInfo, days, essentials } from './data/itinerary'
import MapView from './components/MapView'
import ActivityDetail from './components/ActivityDetail'

const themeColor = {
  arrival:   'bg-indigo-400',
  culture:   'bg-violet-400',
  food:      'bg-rose-400',
  adventure: 'bg-emerald-400',
  travel:    'bg-sky-400',
  departure: 'bg-slate-400',
}

const locationBadge = {
  'Phayao':                          'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Chiang Mai':                      'bg-violet-100 text-violet-700 border-violet-200',
  'Phayao → Chiang Rai (day trip)':  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Phayao → Chiang Mai':             'bg-sky-100 text-sky-700 border-sky-200',
  'Chiang Mai → Singapore':          'bg-slate-100 text-slate-500 border-slate-200',
}

function LegDivider({ label, dates, icon }) {
  return (
    <div className="flex items-center gap-3 my-2 px-1">
      <div className="flex-1 h-px bg-gray-200" />
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-widest">
        <span>{icon}</span>
        <span>{label}</span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-400 font-normal normal-case tracking-normal">{dates}</span>
      </div>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

function FlightCard({ flight, direction }) {
  const isOut = direction === 'Outbound'
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">{direction}</div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold text-gray-800">{isOut ? 'SIN' : 'CNX'}</span>
          <span className="text-3xl font-light text-gray-900">{flight.depart}</span>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand shrink-0" />
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-brand text-lg">✈</span>
          <div className="flex-1 h-px bg-gray-200" />
          <div className="w-2 h-2 rounded-full bg-brand shrink-0" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold text-gray-800">{isOut ? 'CNX' : 'SIN'}</span>
          <span className="text-3xl font-light text-gray-900">{flight.arrive}</span>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
        <span>{flight.date}</span>
        <span>{flight.airline} · {flight.ref}</span>
      </div>
    </div>
  )
}

function DayCard({ day, isOpen, onToggle }) {
  const [selected, setSelected] = useState(null)
  const dot    = themeColor[day.theme] ?? 'bg-indigo-400'
  const badge  = locationBadge[day.location] ?? 'bg-gray-100 text-gray-500 border-gray-200'

  return (
    <>
      <div className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-sm ${isOpen ? 'border-brand shadow-orange-100 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-orange-50/50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl shrink-0">{day.emoji}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-xs text-gray-400">Day {day.day} · {day.date}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${badge}`}>{day.location}</span>
              </div>
              <div className="text-sm font-semibold text-gray-800 truncate">{day.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-3">
            <span className="hidden sm:block text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">{day.budget}</span>
            <span className="text-gray-300 text-xs">{isOpen ? '▲' : '▼'}</span>
          </div>
        </button>

        {isOpen && (
          <div className="px-4 pb-5 border-t border-gray-100">
            <div className="pt-4 flex flex-col gap-3">
              {day.activities.map((a, i) => (
                <div key={i} className="grid gap-x-2.5 gap-y-1 items-start" style={{ gridTemplateColumns: '48px 12px 1fr' }}>
                  <span className="text-xs font-semibold text-gray-400 text-right pt-0.5">{a.time}</span>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dot}`} />
                  <div>
                    <span className="text-sm leading-relaxed text-gray-700">{a.label}</span>
                    {(a.coords || a.wiki || a.photos || a.commonsCategory) && (
                      <div className="flex gap-1.5 mt-1.5">
                        {a.coords && (
                          <button
                            onClick={() => setSelected(a)}
                            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            🗺️ Map
                          </button>
                        )}
                        {(a.wiki || a.photos || a.commonsCategory) && (
                          <button
                            onClick={() => setSelected({ ...a, _openTab: 'photo' })}
                            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 hover:bg-violet-100 transition-colors"
                          >
                            📷 Photos
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {day.tips.length > 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 shrink-0">Tips</span>
                {day.tips.map((t, i) => (
                  <span key={i} className="text-xs text-amber-700 bg-white border border-amber-200 px-2.5 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <ActivityDetail activity={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

function EssentialsCard({ item }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-brand mb-3">{item.category}</h3>
      <ul className="flex flex-col gap-2">
        {item.items.map((it, i) => (
          <li key={i} className="text-sm text-gray-600 pl-3 relative leading-snug before:content-['·'] before:absolute before:left-0 before:text-brand before:font-bold">{it}</li>
        ))}
      </ul>
    </div>
  )
}

const TABS = ['itinerary', 'map', 'flights', 'essentials']
const PHAYAO_DAYS = [1, 2, 3, 4, 5]
const CMX_DAYS    = [6, 7, 8, 9, 10]

export default function App() {
  const [openDay, setOpenDay] = useState(1)
  const [tab, setTab] = useState('itinerary')

  return (
    <div className="min-h-screen bg-orange-50/60 text-gray-900">

      {/* Header */}
      <header className="bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 px-5 py-6 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-4 flex-wrap">
          <span className="text-4xl drop-shadow">🇹🇭</span>
          <div>
            <h1 className="text-xl font-bold text-white drop-shadow">{tripInfo.title}</h1>
            <p className="text-xs text-orange-100 mt-0.5">{tripInfo.travelers}</p>
            <p className="text-xs text-orange-200/80 mt-0.5">{tripInfo.style}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/25 border border-white/40 text-white">4 Jun</span>
            <span className="text-white/60 text-sm">→</span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/25 border border-white/40 text-white">13 Jun 2026</span>
          </div>
        </div>

        {/* Trip legs */}
        <div className="max-w-2xl mx-auto mt-4 flex gap-3 flex-wrap">
          {tripInfo.legs.map((leg, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/25 border border-white/30 backdrop-blur-sm">
              <span className="text-lg">{leg.icon}</span>
              <div>
                <div className="text-xs font-bold text-white">{leg.label} · {leg.dates}</div>
                <div className="text-[10px] text-white/80">{leg.hotel}</div>
                <div className="text-[10px] text-white/60">{leg.hotelNote}</div>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex px-5 gap-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? 'text-brand border-brand' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-20">

        {tab === 'itinerary' && (
          <div className="flex flex-col gap-2.5">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-500 shadow-sm mb-1">
              <strong className="text-gray-700">10 days · 2 provinces</strong> · Rainy season — brief afternoon showers, lush &amp; green, hotels 20% cheaper. Car rental Jun 4 at CNX airport.
            </div>

            <LegDivider label="Phayao" dates="4–8 Jun" icon="🏞️" />
            {days.filter(d => PHAYAO_DAYS.includes(d.day)).map(day => (
              <DayCard key={day.day} day={day}
                isOpen={openDay === day.day}
                onToggle={() => setOpenDay(openDay === day.day ? null : day.day)}
              />
            ))}

            <LegDivider label="Chiang Mai" dates="9–13 Jun" icon="🏯" />
            {days.filter(d => CMX_DAYS.includes(d.day)).map(day => (
              <DayCard key={day.day} day={day}
                isOpen={openDay === day.day}
                onToggle={() => setOpenDay(openDay === day.day ? null : day.day)}
              />
            ))}
          </div>
        )}

        {tab === 'map' && <MapView activeDay={openDay ?? 1} />}

        {tab === 'flights' && (
          <div className="flex flex-col gap-3">
            <FlightCard flight={tripInfo.flight.outbound} direction="Outbound" />
            <FlightCard flight={tripInfo.flight.return}   direction="Return" />
            <p className="text-center text-sm text-gray-400 pt-1">
              Booking ref: <strong className="text-gray-600">{tripInfo.flight.outbound.ref}</strong> · Scoot Airlines
            </p>
          </div>
        )}

        {tab === 'essentials' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {essentials.map((e, i) => <EssentialsCard key={i} item={e} />)}
          </div>
        )}
      </main>
    </div>
  )
}
