import { useState } from 'react'
import { tripInfo, days, essentials } from './data/itinerary'

const themeColor = {
  arrival:   'bg-indigo-500',
  culture:   'bg-violet-500',
  food:      'bg-red-500',
  adventure: 'bg-emerald-500',
  travel:    'bg-sky-500',
  departure: 'bg-slate-500',
}

const locationColor = {
  'Phayao':             'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
  'Chiang Mai':         'bg-violet-900/60 text-violet-300 border-violet-700/50',
  'Phayao → Chiang Rai (day trip)': 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
  'Phayao → Chiang Mai': 'bg-sky-900/60 text-sky-300 border-sky-700/50',
  'Chiang Mai → Singapore': 'bg-slate-800 text-slate-300 border-slate-600/50',
}

function LegDivider({ label, dates, icon }) {
  return (
    <div className="flex items-center gap-3 my-3 px-1">
      <div className="flex-1 h-px bg-white/10" />
      <div className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-widest">
        <span>{icon}</span>
        <span>{label}</span>
        <span className="text-white/25">·</span>
        <span className="text-white/30 font-normal normal-case tracking-normal">{dates}</span>
      </div>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  )
}

function FlightCard({ flight, direction }) {
  const isOut = direction === 'Outbound'
  return (
    <div className="bg-surface border border-white/10 rounded-xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">{direction}</div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold">{isOut ? 'SIN' : 'CNX'}</span>
          <span className="text-3xl font-light">{flight.depart}</span>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand shrink-0" />
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-brand text-lg">✈</span>
          <div className="flex-1 h-px bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-brand shrink-0" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold">{isOut ? 'CNX' : 'SIN'}</span>
          <span className="text-3xl font-light">{flight.arrive}</span>
        </div>
      </div>
      <div className="flex justify-between text-xs text-white/40 border-t border-white/10 pt-3">
        <span>{flight.date}</span>
        <span>{flight.airline} · {flight.ref}</span>
      </div>
    </div>
  )
}

function DayCard({ day, isOpen, onToggle }) {
  const dot = themeColor[day.theme] ?? 'bg-indigo-500'
  const locStyle = locationColor[day.location] ?? 'bg-white/5 text-white/40 border-white/10'
  return (
    <div className={`bg-surface border rounded-xl overflow-hidden transition-colors ${isOpen ? 'border-brand' : 'border-white/10 hover:border-white/25'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-2xl shrink-0">{day.emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-xs text-white/40">Day {day.day} · {day.date}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${locStyle}`}>{day.location}</span>
            </div>
            <div className="text-sm font-semibold truncate">{day.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="hidden sm:block text-xs text-white/40 bg-surface2 px-2 py-1 rounded">{day.budget}</span>
          <span className="text-white/30 text-xs">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-5 border-t border-white/10">
          <div className="pt-4 flex flex-col gap-3">
            {day.activities.map((a, i) => (
              <div key={i} className="grid gap-2.5 items-start" style={{ gridTemplateColumns: '48px 12px 1fr' }}>
                <span className="text-xs font-semibold text-white/40 text-right pt-0.5">{a.time}</span>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dot}`} />
                <span className="text-sm leading-relaxed text-white/80">{a.label}</span>
              </div>
            ))}
          </div>
          {day.tips.length > 0 && (
            <div className="mt-4 bg-surface2 rounded-lg px-3 py-2.5 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 shrink-0">Tips</span>
              {day.tips.map((t, i) => (
                <span key={i} className="text-xs text-white/40 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EssentialsCard({ item }) {
  return (
    <div className="bg-surface border border-white/10 rounded-xl p-4">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-brand mb-3">{item.category}</h3>
      <ul className="flex flex-col gap-2">
        {item.items.map((it, i) => (
          <li key={i} className="text-sm text-white/50 pl-3 relative leading-snug before:content-['·'] before:absolute before:left-0 before:text-brand before:font-bold">{it}</li>
        ))}
      </ul>
    </div>
  )
}

const TABS = ['itinerary', 'flights', 'essentials']

const PHAYAO_DAYS = [1, 2, 3, 4, 5]
const CMX_DAYS    = [6, 7, 8, 9, 10]

export default function App() {
  const [openDay, setOpenDay] = useState(1)
  const [tab, setTab] = useState('itinerary')

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#1a0a2e] via-[#16213e] to-[#0f3460] border-b border-white/10 px-5 py-6">
        <div className="max-w-2xl mx-auto flex items-center gap-4 flex-wrap">
          <span className="text-4xl">🇹🇭</span>
          <div>
            <h1 className="text-xl font-bold text-white">{tripInfo.title}</h1>
            <p className="text-xs text-blue-300 mt-0.5">{tripInfo.travelers} · {tripInfo.style}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/20">4 Jun</span>
            <span className="text-white/40 text-sm">→</span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/20">13 Jun 2026</span>
          </div>
        </div>
        {/* Trip legs */}
        <div className="max-w-2xl mx-auto mt-4 flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-700/40">
            <span>🏞️</span>
            <div>
              <div className="text-xs font-semibold text-emerald-300">Phayao</div>
              <div className="text-[10px] text-emerald-400/60">4–8 Jun · accommodation booked</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-900/40 border border-violet-700/40">
            <span>🏯</span>
            <div>
              <div className="text-xs font-semibold text-violet-300">Chiang Mai</div>
              <div className="text-[10px] text-violet-400/60">9–13 Jun · accommodation booked</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-surface border-b border-white/10">
        <div className="max-w-2xl mx-auto flex px-5 gap-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? 'text-brand border-brand' : 'text-white/40 border-transparent hover:text-white/70'}`}
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
            <div className="bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white/40 mb-1">
              <strong className="text-white/70">10 days · 2 provinces</strong> · Rainy season — brief afternoon showers, lush &amp; green, hotels 20% cheaper. Car rental Jun 4 at CNX airport.
            </div>

            <LegDivider label="Phayao" dates="4–8 Jun" icon="🏞️" />
            {days.filter(d => PHAYAO_DAYS.includes(d.day)).map(day => (
              <DayCard
                key={day.day}
                day={day}
                isOpen={openDay === day.day}
                onToggle={() => setOpenDay(openDay === day.day ? null : day.day)}
              />
            ))}

            <LegDivider label="Chiang Mai" dates="9–13 Jun" icon="🏯" />
            {days.filter(d => CMX_DAYS.includes(d.day)).map(day => (
              <DayCard
                key={day.day}
                day={day}
                isOpen={openDay === day.day}
                onToggle={() => setOpenDay(openDay === day.day ? null : day.day)}
              />
            ))}
          </div>
        )}

        {tab === 'flights' && (
          <div className="flex flex-col gap-3">
            <FlightCard flight={tripInfo.flight.outbound} direction="Outbound" />
            <FlightCard flight={tripInfo.flight.return} direction="Return" />
            <p className="text-center text-sm text-white/30 pt-1">
              Booking ref: <strong className="text-white/60">{tripInfo.flight.outbound.ref}</strong> · Scoot Airlines
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
