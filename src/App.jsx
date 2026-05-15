import { useState } from 'react'
import { tripInfo, days, essentials } from './data/itinerary'
import './App.css'

const themeColors = {
  arrival: '#4f46e5',
  culture: '#7c3aed',
  food: '#dc2626',
  adventure: '#059669',
  departure: '#64748b',
}

function FlightCard({ flight, direction }) {
  return (
    <div className="flight-card">
      <div className="flight-direction">{direction}</div>
      <div className="flight-main">
        <div className="flight-city">
          <span className="flight-code">{direction === 'Outbound' ? 'SIN' : 'CNX'}</span>
          <span className="flight-time">{flight.depart}</span>
        </div>
        <div className="flight-line">
          <div className="flight-dot" />
          <div className="flight-dash" />
          <span className="flight-plane">✈</span>
          <div className="flight-dash" />
          <div className="flight-dot" />
        </div>
        <div className="flight-city">
          <span className="flight-code">{direction === 'Outbound' ? 'CNX' : 'SIN'}</span>
          <span className="flight-time">{flight.arrive}</span>
        </div>
      </div>
      <div className="flight-meta">
        <span>{flight.date}</span>
        <span>{flight.airline} · {flight.ref}</span>
      </div>
    </div>
  )
}

function DayCard({ day, isOpen, onToggle }) {
  const color = themeColors[day.theme] || '#4f46e5'
  return (
    <div className={`day-card ${isOpen ? 'open' : ''}`} style={{ '--accent': color }}>
      <button className="day-header" onClick={onToggle}>
        <div className="day-header-left">
          <span className="day-emoji">{day.emoji}</span>
          <div>
            <div className="day-label">Day {day.day} · {day.date}</div>
            <div className="day-title">{day.title}</div>
          </div>
        </div>
        <div className="day-header-right">
          <span className="day-budget">{day.budget}</span>
          <span className="day-chevron">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>
      {isOpen && (
        <div className="day-body">
          <div className="timeline">
            {day.activities.map((a, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-time">{a.time}</div>
                <div className="timeline-dot" style={{ background: color }} />
                <div className="timeline-label">{a.label}</div>
              </div>
            ))}
          </div>
          {day.tips.length > 0 && (
            <div className="day-tips">
              <span className="tips-label">Tips</span>
              {day.tips.map((t, i) => <span key={i} className="tip">{t}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EssentialsCard({ item }) {
  return (
    <div className="essential-card">
      <h3>{item.category}</h3>
      <ul>
        {item.items.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    </div>
  )
}

export default function App() {
  const [openDay, setOpenDay] = useState(1)
  const [tab, setTab] = useState('itinerary')

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-flag">🇹🇭</div>
          <div>
            <h1>{tripInfo.title}</h1>
            <p className="header-sub">{tripInfo.destination} · {tripInfo.travelers} · {tripInfo.style}</p>
          </div>
          <div className="header-dates">
            <span className="date-badge">4 Jun</span>
            <span className="date-sep">→</span>
            <span className="date-badge">13 Jun 2026</span>
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        {['itinerary', 'flights', 'essentials'].map(t => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'itinerary' && (
          <div className="itinerary">
            <div className="itinerary-intro">
              <strong>10 days</strong> · Chiang Mai base · Rainy season (brief afternoon showers, lush & green, 20% cheaper hotels)
            </div>
            {days.map(day => (
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
          <div className="flights-tab">
            <FlightCard flight={tripInfo.flight.outbound} direction="Outbound" />
            <FlightCard flight={tripInfo.flight.return} direction="Return" />
            <div className="flight-note">
              Booking ref: <strong>{tripInfo.flight.outbound.ref}</strong> · Scoot Airlines
            </div>
          </div>
        )}

        {tab === 'essentials' && (
          <div className="essentials-grid">
            {essentials.map((e, i) => <EssentialsCard key={i} item={e} />)}
          </div>
        )}
      </main>
    </div>
  )
}
