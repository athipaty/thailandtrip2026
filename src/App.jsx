import { useState } from 'react'
import { tripInfo, days, essentials } from './data/itinerary'
import MapView from './components/MapView'
import ActivityDetail from './components/ActivityDetail'

const THEME = {
  arrival:   { dot: 'bg-indigo-500',  bar: 'bg-indigo-500'  },
  culture:   { dot: 'bg-violet-500',  bar: 'bg-violet-500'  },
  food:      { dot: 'bg-rose-500',    bar: 'bg-rose-500'    },
  adventure: { dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  travel:    { dot: 'bg-sky-500',     bar: 'bg-sky-500'     },
  departure: { dot: 'bg-slate-400',   bar: 'bg-slate-400'   },
}

const LOCATION_BADGE = {
  'Phayao':                          'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Chiang Mai':                      'bg-violet-100 text-violet-800 border-violet-300',
  'Phayao → Chiang Rai (day trip)':  'bg-amber-100 text-amber-800 border-amber-300',
  'Phayao → Chiang Mai':             'bg-sky-100 text-sky-800 border-sky-300',
  'Chiang Mai → Singapore':          'bg-slate-100 text-slate-700 border-slate-300',
}

const ESSENTIALS_ICONS = {
  'For the Baby (7 months)': '👶',
  'For the Elders (70s)':    '🧓',
  'Car Rental (CNX Airport)':'🚗',
  'Pace & Weather':           '🌤️',
}

const TABS = [
  { id: 'itinerary',  label: 'Itinerary',  icon: '🗓️' },
  { id: 'map',        label: 'Map',        icon: '🗺️' },
  { id: 'flights',    label: 'Flights',    icon: '✈️'  },
  { id: 'essentials', label: 'Essentials', icon: '📋'  },
]

const PHAYAO_DAYS = [1, 2, 3, 4, 5]
const CMX_DAYS    = [6, 7, 8, 9, 10]

// ─── Section Header ────────────────────────────────────────────────────────────
function LegHeader({ label, dates, dayRange, icon, bgClass }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mt-2 mb-0.5 ${bgClass}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="font-bold text-gray-900 text-base leading-tight">{label}</div>
        <div className="text-xs text-gray-600 mt-0.5">{dates} · Days {dayRange}</div>
      </div>
    </div>
  )
}

// ─── Flight Card ───────────────────────────────────────────────────────────────
function FlightCard({ flight, direction }) {
  const isOut = direction === 'Outbound'
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className={`h-1 w-full ${isOut ? 'bg-brand' : 'bg-emerald-500'}`} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border
            ${isOut ? 'bg-orange-50 text-brand border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            {isOut ? '✈️  Outbound' : '✈️  Return'}
          </span>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">
            {flight.date}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center min-w-[64px]">
            <span className="text-base font-bold text-gray-500">{isOut ? 'SIN' : 'CNX'}</span>
            <span className="text-3xl font-bold text-gray-900 leading-tight">{flight.depart}</span>
            <span className="text-[11px] text-gray-500 mt-1 text-center">{isOut ? 'Singapore' : 'Chiang Mai'}</span>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="flex w-full items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-gray-200" />
              <span className="text-gray-500 text-base">✈</span>
              <div className="flex-1 border-t-2 border-dashed border-gray-200" />
              <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
            </div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
              {flight.airline} · {flight.ref}
            </span>
          </div>

          <div className="flex flex-col items-center min-w-[64px]">
            <span className="text-base font-bold text-gray-500">{isOut ? 'CNX' : 'SIN'}</span>
            <span className="text-3xl font-bold text-gray-900 leading-tight">{flight.arrive}</span>
            <span className="text-[11px] text-gray-500 mt-1 text-center">{isOut ? 'Chiang Mai' : 'Singapore'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Day Card ──────────────────────────────────────────────────────────────────
function DayCard({ day, isOpen, onToggle }) {
  const [selected, setSelected] = useState(null)
  const theme = THEME[day.theme] ?? THEME.culture
  const badge = LOCATION_BADGE[day.location] ?? 'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <>
      <div className={`bg-white border rounded-2xl overflow-hidden transition-all
        ${isOpen ? 'border-gray-300 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>

        {/* Accent stripe */}
        <div className={`h-1 w-full ${theme.bar}`} />

        {/* Header row */}
        <button onClick={onToggle}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors">

          <div className="text-xl w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 shrink-0">
            {day.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Day {day.day}</span>
              <span className="text-[11px] text-gray-500">{day.date}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge}`}>{day.location}</span>
            </div>
            <div className="text-sm font-semibold text-gray-800 leading-snug">{day.title}</div>
            {!isOpen && (
              <div className="text-xs text-gray-500 mt-0.5">{day.activities.length} activities · {day.budget}</div>
            )}
          </div>

          <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
            ${isOpen ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'}`}>
            {isOpen ? '▲' : '▼'}
          </div>
        </button>

        {/* Expanded */}
        {isOpen && (
          <div className="border-t border-gray-100 px-4 pb-5">

            {/* Timeline */}
            <div className="relative pt-4">
              {/* Vertical connecting line */}
              <div className="absolute top-4 bottom-6 w-px bg-gray-200" style={{ left: '63px' }} />

              <div className="flex flex-col">
                {day.activities.map((a, i) => (
                  <div key={i} className="flex items-start pb-4 last:pb-0">
                    {/* Time */}
                    <div className="w-[52px] text-right shrink-0 pt-0.5 pr-2.5">
                      <span className="text-xs font-bold text-gray-600">{a.time}</span>
                    </div>
                    {/* Dot — sits on the line */}
                    <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ring-2 ring-white relative z-10 ${theme.dot}`} />
                    {/* Content */}
                    <div className="flex-1 pl-3 min-w-0">
                      <p className="text-sm text-gray-700 leading-relaxed">{a.label}</p>
                      {(a.coords || a.wiki || a.photos || a.commonsCategory) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {a.coords && (
                            <button onClick={() => setSelected(a)}
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors">
                              🗺️ Map
                            </button>
                          )}
                          {(a.wiki || a.photos || a.commonsCategory) && (
                            <button onClick={() => setSelected({ ...a, _openTab: 'photo' })}
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 transition-colors">
                              📷 Photos
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {day.tips.length > 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="text-base">💡</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">Tips for this day</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {day.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 shrink-0 mt-0.5 font-bold">·</span>
                      <span className="text-xs text-amber-900 leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Budget */}
            <div className="mt-3 flex justify-end">
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                💰 {day.budget}
              </span>
            </div>
          </div>
        )}
      </div>

      {selected && <ActivityDetail activity={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

// ─── Essentials Card ───────────────────────────────────────────────────────────
function EssentialsCard({ item }) {
  const icon = ESSENTIALS_ICONS[item.category] || '📌'
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
        <span className="text-xl">{icon}</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">{item.category}</h3>
      </div>
      <ul className="flex flex-col gap-2">
        {item.items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-snug">
            <span className="text-brand font-bold shrink-0 mt-0.5">·</span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [openDay, setOpenDay] = useState(1)
  const [tab, setTab]         = useState('itinerary')

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">

      {/* Header */}
      <header className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 px-5 py-6 shadow-lg">
        <div className="max-w-2xl mx-auto">

          {/* Title row */}
          <div className="flex items-start gap-4 flex-wrap">
            <span className="text-5xl">🇹🇭</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white drop-shadow">{tripInfo.title}</h1>
              <p className="text-sm text-white/90 mt-1">{tripInfo.travelers}</p>
            </div>
            <div className="flex items-center gap-2 text-center">
              <div className="px-3 py-2 bg-white/20 border border-white/30 rounded-xl">
                <div className="text-xs font-bold text-white">4 Jun</div>
                <div className="text-[10px] text-white/70">Depart</div>
              </div>
              <span className="text-white/80 font-bold">→</span>
              <div className="px-3 py-2 bg-white/20 border border-white/30 rounded-xl">
                <div className="text-xs font-bold text-white">13 Jun</div>
                <div className="text-[10px] text-white/70">Return</div>
              </div>
            </div>
          </div>

          {/* Hotel legs */}
          <div className="flex gap-3 mt-3 flex-wrap">
            {tripInfo.legs.map((leg, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/25 border border-white/30">
                <span className="text-lg">{leg.icon}</span>
                <div>
                  <div className="text-xs font-bold text-white">{leg.label} · {leg.dates}</div>
                  <div className="text-[10px] text-white/90">{leg.hotel}</div>
                  <div className="text-[10px] text-white/70">{leg.hotelNote}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex px-4">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold border-b-2 transition-colors
                ${tab === t.id
                  ? 'text-brand border-brand'
                  : 'text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200'}`}>
              <span className="text-base">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-24">

        {tab === 'itinerary' && (
          <div className="flex flex-col gap-2">

            <LegHeader label="Phayao" dates="4–8 Jun" dayRange="1–5" icon="🏞️"
              bgClass="bg-emerald-50 border border-emerald-200" />
            {days.filter(d => PHAYAO_DAYS.includes(d.day)).map(day => (
              <DayCard key={day.day} day={day}
                isOpen={openDay === day.day}
                onToggle={() => setOpenDay(openDay === day.day ? null : day.day)} />
            ))}

            <LegHeader label="Chiang Mai" dates="9–13 Jun" dayRange="6–10" icon="🏯"
              bgClass="bg-violet-50 border border-violet-200" />
            {days.filter(d => CMX_DAYS.includes(d.day)).map(day => (
              <DayCard key={day.day} day={day}
                isOpen={openDay === day.day}
                onToggle={() => setOpenDay(openDay === day.day ? null : day.day)} />
            ))}
          </div>
        )}

        {tab === 'map' && <MapView activeDay={openDay ?? 1} />}

        {tab === 'flights' && (
          <div className="flex flex-col gap-3">
            <FlightCard flight={tripInfo.flight.outbound} direction="Outbound" />
            <FlightCard flight={tripInfo.flight.return}   direction="Return" />
            <div className="text-center pt-1">
              <span className="inline-block text-xs text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm">
                Booking ref: <strong className="text-gray-900">{tripInfo.flight.outbound.ref}</strong> · Scoot Airlines
              </span>
            </div>
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
