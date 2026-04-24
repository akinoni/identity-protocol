import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  readDB, writeDB, declareAffirmation, logAnchorUse,
  markEvening, markNight, generateSuggestions, getLast30Days,
  todayKey, exportDB, resetDB,
} from './db.js'
import {
  MORNING, DAY_ANCHORS, EVENING_PROMPTS, NIGHT_LOOP, ROLES, IDENTITY_TRAITS,
} from './data.js'

// ─── Theme tokens ──────────────────────────────────────────────────────────────
const DARK = {
  bg:       '#070911',
  surface:  '#0c1020',
  card:     '#101828',
  border:   '#1c2840',
  gold:     '#c9a84c',
  goldL:    '#f0d07a',
  goldDim:  'rgba(201,168,76,0.15)',
  text:     '#e2dcd0',
  muted:    '#78788a',
  sub:      '#a8a098',
  blue:     '#7baed0',
  blueD:    'rgba(123,174,208,0.12)',
  green:    '#4a8a4a',
  greenBg:  '#0c1a0c',
  greenBd:  '#2a5a2a',
  greenT:   '#7acc7a',
  warn:     '#c97c4c',
  warnBg:   '#1a0e08',
  warnBd:   '#5a3020',
  scrollT:  'rgba(201,168,76,0.25)',
}

const LIGHT = {
  bg:       '#f5f0e8',
  surface:  '#fffdf7',
  card:     '#ffffff',
  border:   '#e0d8c8',
  gold:     '#9a6e1a',
  goldL:    '#7a5010',
  goldDim:  'rgba(154,110,26,0.1)',
  text:     '#2a2218',
  muted:    '#887060',
  sub:      '#5a4a38',
  blue:     '#2a6090',
  blueD:    'rgba(42,96,144,0.08)',
  green:    '#2a6a2a',
  greenBg:  '#f0f8f0',
  greenBd:  '#a0d0a0',
  greenT:   '#2a6a2a',
  warn:     '#9a5010',
  warnBg:   '#fff8f0',
  warnBd:   '#d0a060',
  scrollT:  'rgba(154,110,26,0.3)',
}

// ─── Tiny hook: useDB ──────────────────────────────────────────────────────────
function useDB() {
  const [db, setDB] = useState(() => readDB())

  const commit = useCallback((updater) => {
    setDB(prev => {
      const next = updater({ ...prev, days: { ...prev.days } })
      writeDB(next)
      return next
    })
  }, [])

  return [db, commit]
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [db, commit]    = useDB()
  const [activeTab, setActiveTab] = useState('intro')
  const [menuOpen, setMenuOpen]   = useState(false)
  const [onboarding, setOnboarding] = useState(() => !readDB().onboarded)
  const [nameInput, setNameInput]   = useState('')
  const [showReset, setShowReset]   = useState(false)

  const T = db.theme === 'light' ? LIGHT : DARK
  const today   = todayKey()
  const todayDB = db.days[today] || null
  const declared = todayDB?.morning?.declared || []
  const morningCount = declared.length
  const allMorning = morningCount === MORNING.length

  const suggestions = useMemo(() => generateSuggestions(db), [db])
  const history30   = useMemo(() => getLast30Days(db), [db])

  // toggle theme
  const toggleTheme = () =>
    commit(d => ({ ...d, theme: d.theme === 'dark' ? 'light' : 'dark' }))

  // onboarding complete
  const completeOnboarding = () => {
    if (!nameInput.trim()) return
    commit(d => ({ ...d, userName: nameInput.trim(), onboarded: true }))
    setOnboarding(false)
  }

  const tabs = [
    { id: 'intro',    label: 'Home',         icon: '✦' },
    { id: 'morning',  label: 'Morning',       icon: '🌅' },
    { id: 'day',      label: 'Day Anchors',   icon: '⚓' },
    { id: 'evening',  label: 'Evening',       icon: '🌙' },
    { id: 'night',    label: 'Pre-Sleep',     icon: '✨' },
    { id: 'progress', label: 'Progress',      icon: '📊' },
    { id: 'suggest',  label: `Suggestions${suggestions.length ? ` (${suggestions.length})` : ''}`, icon: '💡' },
  ]

  // ── Global styles injected ──────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.background = T.bg
    document.body.style.color = T.text
  }, [T.bg, T.text])

  const css = `
    .tab-btn:hover { background: ${T.goldDim} !important; color: ${T.gold} !important; }
    .card-hover { transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease; }
    .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 28px ${T.goldDim}; }
    .anchor-row { transition: background 0.18s ease, transform 0.18s ease; }
    .anchor-row:hover { background: ${T.goldDim} !important; transform: translateX(3px); cursor: pointer; }
    .declare-btn { transition: all 0.18s ease; cursor: pointer; }
    .declare-btn:hover { filter: brightness(1.15); transform: scale(1.02); }
    .tab-content { animation: fadeUp 0.3s ease; }
    .orb { animation: breathe 5s ease-in-out infinite; }
    .streak-num { animation: countUp 0.5s ease; }
    .night-card { transition: border-color 0.2s ease; }
    .night-card:hover { border-color: ${T.gold}55 !important; }
    .nav-link { transition: all 0.18s ease; }
    .suggest-card { transition: border-color 0.2s ease, transform 0.2s ease; }
    .suggest-card:hover { transform: translateY(-1px); }
    ::-webkit-scrollbar-thumb { background: ${T.scrollT}; }
    input, textarea { 
      background: ${T.surface}; border: 1px solid ${T.border}; 
      color: ${T.text}; font-family: 'Lato', sans-serif;
      border-radius: 8px; padding: 10px 14px; width: 100%;
      font-size: 14px; transition: border-color 0.2s ease;
    }
    input:focus, textarea:focus { outline: none; border-color: ${T.gold}66; }
    @media (max-width: 600px) {
      .desktop-nav { display: none !important; }
      .mobile-menu-btn { display: flex !important; }
    }
    @media (min-width: 601px) {
      .mobile-nav { display: none !important; }
      .mobile-menu-btn { display: none !important; }
    }
  `

  // ── Onboarding screen ────────────────────────────────────────────────────────
  if (onboarding) {
    return (
      <>
        <style>{css}</style>
        <div style={{
          minHeight: '100vh', background: T.bg, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div style={{
            maxWidth: '480px', width: '100%', background: T.surface,
            border: `1px solid ${T.border}`, borderRadius: '16px',
            padding: '40px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>✦</div>
            <p style={{ fontSize: '10px', letterSpacing: '4px', color: T.gold, textTransform: 'uppercase', fontWeight: 700, marginBottom: '16px' }}>
              Identity Protocol
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, color: T.goldL, marginBottom: '14px', lineHeight: 1.3 }}>
              Welcome to Your<br />Transformation System
            </h1>
            <p style={{ color: T.sub, fontSize: '14px', lineHeight: '1.8', marginBottom: '28px' }}>
              This is a scripture-anchored, neuroscience-backed daily protocol for reprogramming your subconscious identity. Before we begin — what shall we call you?
            </p>
            <input
              placeholder="Your name or how you want to be addressed..."
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && completeOnboarding()}
              style={{ marginBottom: '16px', textAlign: 'center' }}
            />
            <button
              onClick={completeOnboarding}
              disabled={!nameInput.trim()}
              style={{
                width: '100%', padding: '14px', borderRadius: '8px',
                background: nameInput.trim() ? T.goldDim : 'transparent',
                border: `1px solid ${nameInput.trim() ? T.gold : T.border}`,
                color: nameInput.trim() ? T.gold : T.muted,
                fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
                fontWeight: 900, cursor: nameInput.trim() ? 'pointer' : 'default',
                fontFamily: "'Lato', sans-serif", transition: 'all 0.2s ease',
              }}
            >
              Begin the Protocol →
            </button>
            <p style={{ color: T.muted, fontSize: '11px', marginTop: '16px' }}>
              All data stays on your device. Nothing is sent anywhere.
            </p>
          </div>
        </div>
      </>
    )
  }

  // ── Main layout ──────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: '100vh', background: T.bg, color: T.text }}>

        {/* ── TOP HEADER ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: T.bg + 'ee', backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${T.border}`,
          padding: '0 20px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          height: '56px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: T.goldL, fontWeight: 600 }}>
              Identity Protocol
            </span>
            {db.streaks.current > 0 && (
              <div style={{
                background: T.goldDim, border: `1px solid ${T.gold}44`,
                borderRadius: '20px', padding: '3px 10px',
                fontSize: '11px', color: T.gold, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                🔥 {db.streaks.current}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Theme toggle */}
            <button onClick={toggleTheme} title="Toggle theme" style={{
              background: 'transparent', border: `1px solid ${T.border}`,
              borderRadius: '8px', padding: '6px 10px',
              cursor: 'pointer', fontSize: '14px', lineHeight: 1,
              transition: 'all 0.2s ease', color: T.muted,
            }}>
              {db.theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Mobile menu */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'none', background: 'transparent',
                border: `1px solid ${T.border}`, borderRadius: '8px',
                padding: '6px 10px', cursor: 'pointer', color: T.muted,
                fontSize: '18px', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </header>

        {/* ── MOBILE NAV OVERLAY ── */}
        {menuOpen && (
          <div className="mobile-nav" style={{
            position: 'fixed', top: '56px', left: 0, right: 0, bottom: 0,
            background: T.bg + 'f5', backdropFilter: 'blur(16px)',
            zIndex: 99, padding: '20px',
          }}>
            {tabs.map(tab => (
              <button key={tab.id} className="nav-link" onClick={() => { setActiveTab(tab.id); setMenuOpen(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '16px 20px', marginBottom: '6px', borderRadius: '10px',
                  background: activeTab === tab.id ? T.goldDim : 'transparent',
                  border: `1px solid ${activeTab === tab.id ? T.gold + '44' : T.border}`,
                  color: activeTab === tab.id ? T.gold : T.text, cursor: 'pointer',
                  fontSize: '15px', fontFamily: "'Lato', sans-serif",
                  fontWeight: activeTab === tab.id ? 700 : 400,
                }}>
                {tab.icon}  {tab.label}
              </button>
            ))}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${T.border}` }}>
              <button onClick={exportDB.bind(null, db)} style={{
                background: 'transparent', border: `1px solid ${T.border}`,
                color: T.muted, padding: '10px 16px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '12px', fontFamily: "'Lato', sans-serif",
                width: '100%', marginBottom: '8px',
              }}>⬇ Export Backup</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', maxWidth: '1100px', margin: '0 auto' }}>

          {/* ── SIDEBAR NAV (desktop) ── */}
          <nav className="desktop-nav" style={{
            width: '220px', flexShrink: 0, padding: '24px 16px',
            position: 'sticky', top: '56px', height: 'calc(100vh - 56px)',
            overflowY: 'auto', borderRight: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: '10px', letterSpacing: '2px', color: T.muted, textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px', paddingLeft: '10px' }}>
              {db.userName ? `Hello, ${db.userName}` : 'Navigate'}
            </div>
            {tabs.map(tab => (
              <button key={tab.id} className="tab-btn nav-link"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 12px', marginBottom: '3px', borderRadius: '8px',
                  background: activeTab === tab.id ? T.goldDim : 'transparent',
                  border: `1px solid ${activeTab === tab.id ? T.gold + '44' : 'transparent'}`,
                  color: activeTab === tab.id ? T.gold : T.muted, cursor: 'pointer',
                  fontSize: '13px', fontFamily: "'Lato', sans-serif",
                  fontWeight: activeTab === tab.id ? 700 : 400, letterSpacing: '0.3px',
                }}>
                {tab.icon}  {tab.label}
              </button>
            ))}

            {/* Daily status */}
            <div style={{ marginTop: '24px', padding: '14px 12px', background: T.surface, borderRadius: '10px', border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: '10px', letterSpacing: '2px', color: T.muted, textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>Today</div>
              {[
                { label: 'Morning', done: allMorning, icon: '🌅' },
                { label: 'Evening', done: todayDB?.evening?.completed, icon: '🌙' },
                { label: 'Pre-Sleep', done: todayDB?.night?.completed, icon: '✨' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: T.sub }}>{item.icon} {item.label}</span>
                  <span style={{ fontSize: '11px', color: item.done ? T.greenT : T.border, fontWeight: 700 }}>
                    {item.done ? '✓' : '○'}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '16px' }}>
              <button onClick={() => exportDB(db)} style={{
                width: '100%', padding: '8px', background: 'transparent',
                border: `1px solid ${T.border}`, borderRadius: '8px',
                color: T.muted, fontSize: '11px', cursor: 'pointer',
                fontFamily: "'Lato', sans-serif',", letterSpacing: '0.5px',
              }}>⬇ Export Data</button>
            </div>
          </nav>

          {/* ── MAIN CONTENT ── */}
          <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>

            {/* ═════════ INTRO / HOME ═════════ */}
            {activeTab === 'intro' && (
              <div className="tab-content">
                {/* Hero */}
                <div style={{ position: 'relative', overflow: 'hidden', textAlign: 'center', paddingBottom: '28px', marginBottom: '24px', borderBottom: `1px solid ${T.border}` }}>
                  <div className="orb" style={{
                    position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
                    width: '300px', height: '200px', background: `radial-gradient(ellipse, ${T.goldDim}, transparent 70%)`,
                    pointerEvents: 'none',
                  }} />
                  <p style={{ fontSize: '10px', letterSpacing: '5px', color: T.gold, textTransform: 'uppercase', fontWeight: 700, marginBottom: '14px' }}>
                    Scripture-Anchored Identity Transformation
                  </p>
                  <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 300, color: T.goldL, lineHeight: 1.25, marginBottom: '10px' }}>
                    Subconscious Reprogramming<br />Protocol
                  </h1>
                  <p style={{ color: T.muted, fontSize: '12px', letterSpacing: '2px' }}>Romans 8 · 2 Corinthians 10 · 2 Timothy 1 · Psalm 57</p>
                </div>

                {/* Streak dashboard */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { label: 'Current Streak', value: `${db.streaks.current}d`, icon: '🔥', color: T.gold },
                    { label: 'Longest Streak', value: `${db.streaks.longest}d`, icon: '🏆', color: T.blue },
                    { label: 'Declarations', value: db.stats.totalDeclarations, icon: '📣', color: T.greenT },
                    { label: 'Evenings Done', value: db.stats.totalEvenings, icon: '🌙', color: T.muted },
                  ].map(stat => (
                    <div key={stat.label} className="card-hover" style={{
                      background: T.surface, border: `1px solid ${T.border}`,
                      borderRadius: '12px', padding: '18px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '20px', marginBottom: '8px' }}>{stat.icon}</div>
                      <div className="streak-num" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: stat.color, fontWeight: 300, marginBottom: '4px' }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: '10px', letterSpacing: '1px', color: T.muted, textTransform: 'uppercase' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Team */}
                <div className="card-hover" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '24px', marginBottom: '18px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '3px', color: T.gold, textTransform: 'uppercase', fontWeight: 700, marginBottom: '18px' }}>Your Transformation Team</div>
                  {ROLES.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', paddingBottom: i < ROLES.length - 1 ? '14px' : 0, marginBottom: i < ROLES.length - 1 ? '14px' : 0, borderBottom: i < ROLES.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '1px' }}>{r.emoji}</span>
                      <div>
                        <div style={{ color: T.goldL, fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>{r.title}</div>
                        <div style={{ color: T.muted, fontSize: '12px' }}>{r.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Framework */}
                <div className="card-hover" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '24px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '3px', color: T.gold, textTransform: 'uppercase', fontWeight: 700, marginBottom: '18px' }}>The Daily Framework</div>
                  {[
                    { time: '🌅 Morning (10 min)', desc: 'Speak each declaration aloud with emotion. Check each Declared. The emotion is the accelerant.' },
                    { time: '☀️ Throughout the Day', desc: 'ANCHOR is your trigger word. When a negative state rises — find your trigger, deploy the phrase instantly.' },
                    { time: '🌙 Evening (10–15 min)', desc: 'Write honest responses to the reflection prompts. This closes the daily identity loop.' },
                    { time: '✨ Pre-Sleep (5–10 min)', desc: 'Whisper or mentally loop the 5 phrases as you drift. The theta window is the deepest channel.' },
                  ].map((item, i) => (
                    <div key={i} style={{ paddingBottom: i < 3 ? '16px' : 0, marginBottom: i < 3 ? '16px' : 0, borderBottom: i < 3 ? `1px solid ${T.border}` : 'none' }}>
                      <div style={{ color: T.gold, fontSize: '12px', fontWeight: 700, marginBottom: '5px' }}>{item.time}</div>
                      <div style={{ color: T.sub, fontSize: '13px', lineHeight: '1.7' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═════════ MORNING ═════════ */}
            {activeTab === 'morning' && (
              <div className="tab-content">
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: T.goldL, fontWeight: 300, marginBottom: '6px' }}>Morning Declarations</h2>
                <p style={{ color: T.muted, fontSize: '13px', marginBottom: '20px' }}>Speak each one aloud. Feel the truth as you speak it.</p>

                {/* Breath cue */}
                <div style={{ background: T.surface, border: `1px solid ${T.gold}33`, borderRadius: '10px', padding: '14px 18px', marginBottom: '18px' }}>
                  <p style={{ color: T.sub, fontSize: '13px', lineHeight: '1.8' }}>
                    <span style={{ color: T.gold, fontWeight: 700 }}>Before you begin: </span>
                    3 breaths — 4 counts in · 4 hold · 4 out. Stand upright. Speak aloud. Feel every word.
                  </p>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '2px', color: T.muted, textTransform: 'uppercase' }}>Morning Progress</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: allMorning ? T.gold : T.muted }}>
                      {allMorning ? '✦ All Declared' : `${morningCount} / ${MORNING.length}`}
                    </span>
                  </div>
                  <div style={{ height: '3px', background: T.border, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: `linear-gradient(90deg, ${T.gold}, ${T.goldL})`, width: `${(morningCount / MORNING.length) * 100}%`, transition: 'width 0.4s ease', borderRadius: '2px' }} />
                  </div>
                </div>

                {allMorning && (
                  <div style={{ background: T.greenBg, border: `1px solid ${T.greenBd}`, borderRadius: '10px', padding: '16px 20px', marginBottom: '22px', textAlign: 'center' }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', color: T.greenT, fontStyle: 'italic' }}>
                      "My heart, O God, is quiet and confident." — Psalm 57<br />
                      <span style={{ fontSize: '13px' }}>Every declaration spoken. Go walk in it.</span>
                    </p>
                  </div>
                )}

                {MORNING.map(item => {
                  const done = declared.includes(item.id)
                  return (
                    <div key={item.id} className="card-hover" style={{
                      background: done ? T.greenBg : T.card, border: `1px solid ${done ? T.greenBd : T.border}`,
                      borderRadius: '12px', padding: '22px', marginBottom: '14px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>{item.icon}</span>
                          <div style={{ fontSize: '10px', letterSpacing: '2px', color: T.gold, textTransform: 'uppercase', fontWeight: 700 }}>{item.theme}</div>
                        </div>
                        <div style={{ fontSize: '10px', color: T.blue, letterSpacing: '0.5px', textAlign: 'right', flexShrink: 0 }}>{item.scripture}</div>
                      </div>

                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(15px, 2.2vw, 18px)', lineHeight: '1.85', color: done ? T.greenT : T.text, marginBottom: '14px', fontStyle: 'italic' }}>
                        "{item.affirmation}"
                      </p>

                      <div style={{ background: T.blueD, borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', borderLeft: `2px solid ${T.blue}44` }}>
                        <p style={{ fontSize: '11px', color: T.blue, lineHeight: '1.7', fontStyle: 'italic' }}>{item.verse}</p>
                      </div>

                      <button className="declare-btn"
                        onClick={() => commit(d => declareAffirmation(d, item.id, MORNING.length))}
                        style={{
                          background: done ? T.greenBg : 'transparent',
                          border: `1px solid ${done ? T.greenBd : T.border}`,
                          color: done ? T.greenT : T.muted,
                          padding: '9px 18px', borderRadius: '6px',
                          fontSize: '11px', fontFamily: "'Lato', sans-serif",
                          fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase',
                        }}>
                        {done ? '✓  DECLARED' : 'DECLARE THIS'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ═════════ DAY ANCHORS ═════════ */}
            {activeTab === 'day' && (
              <div className="tab-content">
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: T.goldL, fontWeight: 300, marginBottom: '6px' }}>Day Anchors</h2>
                <p style={{ color: T.muted, fontSize: '13px', marginBottom: '20px' }}>Tap any anchor when its trigger arises. Deploy instantly.</p>

                <div style={{ background: T.surface, border: `1px solid ${T.gold}33`, borderRadius: '10px', padding: '14px 18px', marginBottom: '22px' }}>
                  <p style={{ color: T.sub, fontSize: '13px', lineHeight: '1.8' }}>
                    <span style={{ color: T.gold, fontWeight: 700 }}>Trigger word: ANCHOR.</span> The moment a negative state rises, say "ANCHOR" — find your match below — deploy the phrase aloud or internally. Tap to log usage.
                  </p>
                </div>

                {DAY_ANCHORS.map(item => {
                  const used = todayDB?.anchors?.used?.includes(item.id)
                  const totalUses = db.stats.anchorUsage[item.id] || 0
                  return (
                    <div key={item.id} className="anchor-row" onClick={() => commit(d => logAnchorUse(d, item.id))}
                      style={{
                        background: used ? T.goldDim : T.card,
                        border: `1px solid ${used ? T.gold + '44' : T.border}`,
                        borderRadius: '10px', padding: '16px 18px',
                        display: 'flex', gap: '14px', alignItems: 'flex-start',
                        marginBottom: '10px',
                      }}>
                      <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                          <div style={{ fontSize: '10px', letterSpacing: '2px', color: T.gold, fontWeight: 700, textTransform: 'uppercase' }}>When: {item.trigger}</div>
                          {totalUses > 0 && <div style={{ fontSize: '10px', color: T.muted }}>Used {totalUses}×</div>}
                        </div>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', color: T.text, lineHeight: '1.6', fontStyle: 'italic', marginBottom: '5px' }}>"{item.anchor}"</p>
                        <div style={{ fontSize: '10px', color: T.blue }}>{item.ref}</div>
                      </div>
                      {used && <div style={{ color: T.gold, fontSize: '14px', flexShrink: 0 }}>✓</div>}
                    </div>
                  )
                })}
              </div>
            )}

            {/* ═════════ EVENING ═════════ */}
            {activeTab === 'evening' && (
              <div className="tab-content">
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: T.goldL, fontWeight: 300, marginBottom: '6px' }}>Evening Reflection</h2>
                <p style={{ color: T.muted, fontSize: '13px', marginBottom: '20px' }}>10–15 minutes. Raw honesty. Pen on paper.</p>

                <div style={{ background: T.surface, border: `1px solid ${T.gold}33`, borderRadius: '10px', padding: '14px 18px', marginBottom: '22px' }}>
                  <p style={{ color: T.sub, fontSize: '13px', lineHeight: '1.8' }}>
                    <span style={{ color: T.gold, fontWeight: 700 }}>No performance here. </span>
                    These prompts complete the daily identity loop. Use these in your physical journal — depth beats speed, and honesty beats polish.
                  </p>
                </div>

                {EVENING_PROMPTS.map((item, i) => (
                  <div key={item.id} className="card-hover" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: T.surface, border: `1px solid ${T.gold}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>{item.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', letterSpacing: '2px', color: T.gold, fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>Reflection {i + 1}</div>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', color: T.text, lineHeight: '1.8' }}>{item.prompt}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mark complete */}
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <button className="declare-btn"
                    onClick={() => commit(d => markEvening(d, !todayDB?.evening?.completed))}
                    style={{
                      background: todayDB?.evening?.completed ? T.greenBg : 'transparent',
                      border: `1px solid ${todayDB?.evening?.completed ? T.greenBd : T.border}`,
                      color: todayDB?.evening?.completed ? T.greenT : T.muted,
                      padding: '12px 28px', borderRadius: '8px',
                      fontSize: '11px', fontFamily: "'Lato', sans-serif",
                      fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase',
                    }}>
                    {todayDB?.evening?.completed ? '✓ Evening Completed' : 'Mark Evening Complete'}
                  </button>
                </div>
              </div>
            )}

            {/* ═════════ PRE-SLEEP ═════════ */}
            {activeTab === 'night' && (
              <div className="tab-content">
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: T.goldL, fontWeight: 300, marginBottom: '6px' }}>Pre-Sleep Loop</h2>
                <p style={{ color: T.muted, fontSize: '13px', marginBottom: '20px' }}>Whisper or loop internally as you drift into sleep.</p>

                <div style={{ background: T.surface, border: `1px solid ${T.gold}33`, borderRadius: '10px', padding: '14px 18px', marginBottom: '26px' }}>
                  <p style={{ color: T.sub, fontSize: '13px', lineHeight: '1.8' }}>
                    <span style={{ color: T.gold, fontWeight: 700 }}>You are entering theta state. </span>
                    The critical filter is dropping. These phrases write directly onto subconscious architecture. Loop them gently 3–5 times through until sleep takes you.
                  </p>
                </div>

                {NIGHT_LOOP.map((item, i) => (
                  <div key={item.id} className="night-card card-hover" style={{
                    background: T.card, border: `1px solid ${T.border}`,
                    borderRadius: '14px', padding: 'clamp(20px, 4vw, 32px) 24px',
                    textAlign: 'center', position: 'relative', overflow: 'hidden',
                    marginBottom: '12px',
                  }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(ellipse, ${T.goldDim}, transparent 70%)`, pointerEvents: 'none' }} />
                    <div style={{ fontSize: '10px', letterSpacing: '4px', color: T.gold + '66', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 700 }}>Loop {i + 1}</div>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 300, color: T.text, lineHeight: 1.6, marginBottom: '10px', letterSpacing: '0.5px' }}>
                      {item.phrase}
                    </p>
                    <div style={{ fontSize: '10px', color: T.blue + '88', letterSpacing: '1px' }}>{item.ref}</div>
                  </div>
                ))}

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                  <button className="declare-btn"
                    onClick={() => commit(d => markNight(d, !todayDB?.night?.completed))}
                    style={{
                      background: todayDB?.night?.completed ? T.greenBg : 'transparent',
                      border: `1px solid ${todayDB?.night?.completed ? T.greenBd : T.border}`,
                      color: todayDB?.night?.completed ? T.greenT : T.muted,
                      padding: '12px 28px', borderRadius: '8px',
                      fontSize: '11px', fontFamily: "'Lato', sans-serif",
                      fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase',
                    }}>
                    {todayDB?.night?.completed ? '✓ Pre-Sleep Done' : 'Mark Pre-Sleep Complete'}
                  </button>
                </div>
              </div>
            )}

            {/* ═════════ PROGRESS ═════════ */}
            {activeTab === 'progress' && (
              <div className="tab-content">
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: T.goldL, fontWeight: 300, marginBottom: '6px' }}>Progress</h2>
                <p style={{ color: T.muted, fontSize: '13px', marginBottom: '24px' }}>Your 30-day transformation map.</p>

                {/* Streak cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
                  {[
                    { label: 'Current Streak', value: `${db.streaks.current} days`, icon: '🔥', tip: db.streaks.current === 0 ? 'Start today' : db.streaks.current >= 7 ? 'Elite zone' : 'Building momentum' },
                    { label: 'Longest Streak', value: `${db.streaks.longest} days`, icon: '🏆', tip: 'Personal best' },
                    { label: 'Declarations Spoken', value: db.stats.totalDeclarations, icon: '📣', tip: '66+ = habit formed' },
                    { label: 'Nights Completed', value: db.stats.totalNights, icon: '✨', tip: 'Theta reprogramming sessions' },
                  ].map(stat => (
                    <div key={stat.label} className="card-hover" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                        <span style={{ fontSize: '10px', color: T.muted }}>{stat.tip}</span>
                      </div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: T.goldL, fontWeight: 300, marginBottom: '4px' }}>{stat.value}</div>
                      <div style={{ fontSize: '10px', letterSpacing: '1px', color: T.muted, textTransform: 'uppercase' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* 30-day calendar */}
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '3px', color: T.gold, textTransform: 'uppercase', fontWeight: 700, marginBottom: '18px' }}>30-Day Activity Map</div>

                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    {[
                      { color: T.gold,    label: 'Morning' },
                      { color: T.blue,    label: 'Evening' },
                      { color: T.greenT,  label: 'Pre-Sleep' },
                    ].map(leg => (
                      <div key={leg.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: leg.color, opacity: 0.7 }} />
                        <span style={{ fontSize: '11px', color: T.muted }}>{leg.label}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(38px, 1fr))', gap: '6px' }}>
                    {history30.map(day => (
                      <div key={day.key} title={day.key} style={{
                        borderRadius: '8px', padding: '6px 4px',
                        background: day.isToday ? T.goldDim : T.card,
                        border: `1px solid ${day.isToday ? T.gold + '44' : T.border}`,
                        textAlign: 'center', cursor: 'default',
                      }}>
                        <div style={{ fontSize: '9px', color: T.muted, marginBottom: '4px' }}>{day.shortLabel}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: day.morning ? T.gold : T.border, opacity: day.morning ? 0.9 : 0.3 }} />
                          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: day.evening ? T.blue : T.border, opacity: day.evening ? 0.9 : 0.3 }} />
                          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: day.night ? T.greenT : T.border, opacity: day.night ? 0.9 : 0.3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Identity traits progress */}
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '3px', color: T.gold, textTransform: 'uppercase', fontWeight: 700, marginBottom: '18px' }}>Identity Activation</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                    {IDENTITY_TRAITS.map(trait => {
                      const relatedDecl = MORNING.filter(m => m.identity === trait.id)
                      const totalDeclForTrait = relatedDecl.reduce((acc, m) => acc + (db.stats.declarationUsage[m.id] || 0), 0)
                      const maxPossible = 30
                      const pct = Math.min(100, Math.round((totalDeclForTrait / maxPossible) * 100))
                      return (
                        <div key={trait.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', marginBottom: '6px' }}>{trait.icon}</div>
                          <div style={{ fontSize: '11px', color: T.text, fontWeight: 700, marginBottom: '8px' }}>{trait.label}</div>
                          <div style={{ height: '3px', background: T.border, borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${T.gold}, ${T.goldL})`, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                          </div>
                          <div style={{ fontSize: '9px', color: T.muted }}>{pct}%</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Export / Reset */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={() => exportDB(db)} style={{
                    flex: 1, minWidth: '140px', padding: '12px', borderRadius: '8px',
                    background: 'transparent', border: `1px solid ${T.border}`,
                    color: T.muted, fontSize: '12px', cursor: 'pointer',
                    fontFamily: "'Lato', sans-serif", letterSpacing: '1px', fontWeight: 700,
                  }}>⬇ Export Backup</button>
                  <button onClick={() => setShowReset(true)} style={{
                    flex: 1, minWidth: '140px', padding: '12px', borderRadius: '8px',
                    background: 'transparent', border: `1px solid ${T.warnBd}`,
                    color: T.warn, fontSize: '12px', cursor: 'pointer',
                    fontFamily: "'Lato', sans-serif", letterSpacing: '1px', fontWeight: 700,
                  }}>⚠ Reset All Data</button>
                </div>

                {showReset && (
                  <div style={{ marginTop: '14px', background: T.warnBg, border: `1px solid ${T.warnBd}`, borderRadius: '10px', padding: '16px' }}>
                    <p style={{ color: T.warn, fontSize: '13px', marginBottom: '12px' }}>This will permanently delete all progress, streaks, and history. Are you certain?</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => { const fresh = resetDB(); writeDB(fresh); window.location.reload() }} style={{ padding: '8px 16px', background: T.warn, border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: "'Lato', sans-serif" }}>Yes, Reset</button>
                      <button onClick={() => setShowReset(false)} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: '6px', color: T.muted, cursor: 'pointer', fontSize: '12px', fontFamily: "'Lato', sans-serif" }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═════════ SUGGESTIONS ═════════ */}
            {activeTab === 'suggest' && (
              <div className="tab-content">
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', color: T.goldL, fontWeight: 300, marginBottom: '6px' }}>Suggestions</h2>
                <p style={{ color: T.muted, fontSize: '13px', marginBottom: '24px' }}>Personalized guidance based on your patterns.</p>

                {suggestions.length === 0 ? (
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>✦</div>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: T.goldL, fontStyle: 'italic', marginBottom: '8px' }}>All clear. Keep going.</p>
                    <p style={{ color: T.muted, fontSize: '13px' }}>No pressing suggestions right now. Complete your daily protocol and check back.</p>
                  </div>
                ) : (
                  suggestions.map((s, i) => (
                    <div key={s.id} className="suggest-card card-hover" style={{
                      background: T.surface,
                      border: `1px solid ${s.priority === 0 ? T.gold + '55' : s.priority === 1 ? T.warn + '44' : T.border}`,
                      borderRadius: '12px', padding: '22px', marginBottom: '14px',
                      animation: `slideIn 0.3s ease ${i * 0.06}s both`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '20px' }}>{s.icon}</span>
                          <div style={{
                            fontSize: '9px', letterSpacing: '2px', fontWeight: 700,
                            textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px',
                            background: s.priority === 0 ? T.goldDim : s.priority === 1 ? T.warnBg : T.blueD,
                            color: s.priority === 0 ? T.gold : s.priority === 1 ? T.warn : T.blue,
                            border: `1px solid ${s.priority === 0 ? T.gold + '44' : s.priority === 1 ? T.warnBd : T.blue + '33'}`,
                          }}>
                            {s.tag}
                          </div>
                        </div>
                      </div>

                      <p style={{ color: T.sub, fontSize: '13px', lineHeight: '1.85', marginBottom: s.action ? '16px' : 0 }}>
                        {s.text}
                      </p>

                      {s.action && s.tab && (
                        <button className="declare-btn" onClick={() => setActiveTab(s.tab)} style={{
                          background: T.goldDim, border: `1px solid ${T.gold}44`,
                          color: T.gold, padding: '8px 16px', borderRadius: '6px',
                          fontSize: '11px', fontFamily: "'Lato', sans-serif",
                          fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase',
                          cursor: 'pointer',
                        }}>
                          {s.action} →
                        </button>
                      )}
                    </div>
                  ))
                )}

                {/* Anchor usage chart */}
                {Object.keys(db.stats.anchorUsage).length > 0 && (
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '24px', marginTop: '24px' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '3px', color: T.gold, textTransform: 'uppercase', fontWeight: 700, marginBottom: '18px' }}>Anchor Usage Patterns</div>
                    {DAY_ANCHORS.map(anchor => {
                      const count = db.stats.anchorUsage[anchor.id] || 0
                      const max = Math.max(...DAY_ANCHORS.map(a => db.stats.anchorUsage[a.id] || 0), 1)
                      if (!count) return null
                      return (
                        <div key={anchor.id} style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', color: T.sub }}>{anchor.icon} {anchor.trigger}</span>
                            <span style={{ fontSize: '11px', color: T.muted }}>{count}×</span>
                          </div>
                          <div style={{ height: '4px', background: T.border, borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(count / max) * 100}%`, background: `linear-gradient(90deg, ${T.gold}, ${T.goldL})`, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  )
}
