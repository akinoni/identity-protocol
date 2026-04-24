// ─────────────────────────────────────────────────────────────
//  db.js  —  localStorage-backed database for Identity Protocol
//  Schema version: 2
// ─────────────────────────────────────────────────────────────

const DB_KEY = 'identity_protocol_v2'

const DEFAULT_STATE = {
  schemaVersion: 2,
  theme: 'dark',
  userName: '',
  onboarded: false,
  days: {},           // keyed by "YYYY-MM-DD"
  streaks: {
    current: 0,
    longest: 0,
    lastFullDay: null,
    lastMorningDay: null,
  },
  stats: {
    totalDeclarations: 0,
    totalEvenings: 0,
    totalNights: 0,
    anchorUsage: {},   // { anchorId: count }
    declarationUsage: {}, // { declarationId: count }
  },
}

// ── helpers ────────────────────────────────────────────────────
export function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function dayKey(date) {
  return date.toISOString().split('T')[0]
}

function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return dayKey(d)
}

// ── read / write ───────────────────────────────────────────────
export function readDB() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    const parsed = JSON.parse(raw)
    // merge with defaults to handle schema additions
    return {
      ...DEFAULT_STATE,
      ...parsed,
      streaks: { ...DEFAULT_STATE.streaks, ...(parsed.streaks || {}) },
      stats:   { ...DEFAULT_STATE.stats,   ...(parsed.stats   || {}) },
    }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

export function writeDB(state) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(state))
  } catch {
    console.error('Identity Protocol: could not write to localStorage')
  }
}

// ── day record helpers ─────────────────────────────────────────
export function ensureDay(db, key) {
  if (!db.days[key]) {
    db.days[key] = {
      date: key,
      morning: { declared: [], completedAll: false, completedAt: null },
      anchors: { used: [] },
      evening: { completed: false, completedAt: null },
      night:   { completed: false, completedAt: null },
      notes: '',
    }
  }
  return db.days[key]
}

// ── streak calculation ─────────────────────────────────────────
export function recalcStreak(db) {
  const today = todayKey()
  let streak = 0
  let cursor = today

  while (true) {
    const record = db.days[cursor]
    // count a day if morning was fully completed
    if (!record || !record.morning.completedAll) {
      // allow today to still be in progress
      if (cursor === today) {
        cursor = addDays(cursor, -1)
        continue
      }
      break
    }
    streak++
    cursor = addDays(cursor, -1)
  }

  db.streaks.current = streak
  db.streaks.longest = Math.max(db.streaks.longest, streak)

  // lastFullDay = most recent day where all 4 sections done
  const sortedDays = Object.values(db.days)
    .filter(d => d.morning.completedAll && d.evening.completed && d.night.completed)
    .sort((a, b) => b.date.localeCompare(a.date))

  db.streaks.lastFullDay = sortedDays[0]?.date ?? null
  return db
}

// ── morning actions ────────────────────────────────────────────
export function declareAffirmation(db, declarationId, totalCount) {
  const key = todayKey()
  const day = ensureDay(db, key)

  if (!day.morning.declared.includes(declarationId)) {
    day.morning.declared.push(declarationId)
    db.stats.totalDeclarations++
    db.stats.declarationUsage[declarationId] =
      (db.stats.declarationUsage[declarationId] || 0) + 1
  } else {
    // toggle off
    day.morning.declared = day.morning.declared.filter(id => id !== declarationId)
    db.stats.totalDeclarations = Math.max(0, db.stats.totalDeclarations - 1)
    db.stats.declarationUsage[declarationId] =
      Math.max(0, (db.stats.declarationUsage[declarationId] || 1) - 1)
  }

  const completedAll = day.morning.declared.length === totalCount
  day.morning.completedAll = completedAll
  if (completedAll) day.morning.completedAt = new Date().toISOString()

  return recalcStreak(db)
}

// ── anchor actions ─────────────────────────────────────────────
export function logAnchorUse(db, anchorId) {
  const key = todayKey()
  const day = ensureDay(db, key)
  if (!day.anchors.used.includes(anchorId)) day.anchors.used.push(anchorId)
  db.stats.anchorUsage[anchorId] = (db.stats.anchorUsage[anchorId] || 0) + 1
  return db
}

// ── evening / night ────────────────────────────────────────────
export function markEvening(db, value) {
  const key = todayKey()
  const day = ensureDay(db, key)
  day.evening.completed = value
  if (value) {
    day.evening.completedAt = new Date().toISOString()
    db.stats.totalEvenings++
  } else {
    db.stats.totalEvenings = Math.max(0, db.stats.totalEvenings - 1)
  }
  return recalcStreak(db)
}

export function markNight(db, value) {
  const key = todayKey()
  const day = ensureDay(db, key)
  day.night.completed = value
  if (value) {
    day.night.completedAt = new Date().toISOString()
    db.stats.totalNights++
  } else {
    db.stats.totalNights = Math.max(0, db.stats.totalNights - 1)
  }
  return recalcStreak(db)
}

// ── suggestions engine ─────────────────────────────────────────
export function generateSuggestions(db) {
  const suggestions = []
  const today = todayKey()
  const todayRecord = db.days[today]
  const streak = db.streaks.current

  // Streak momentum
  if (streak === 0) {
    suggestions.push({
      id: 'sg1', priority: 1, icon: '🔥', tag: 'Streak',
      text: "Today is Day 1 of your streak. Every transformation begins in a single act of will. Declare your morning affirmations before anything else hits your eyes.",
      action: 'Start Morning Declarations',
      tab: 'morning',
    })
  } else if (streak >= 3 && streak < 7) {
    suggestions.push({
      id: 'sg2', priority: 2, icon: '⚡', tag: 'Momentum',
      text: `${streak}-day streak active. Your neural pathways are just beginning to shift. Days 7–21 are where identity starts to feel native. Keep going.`,
      action: null, tab: null,
    })
  } else if (streak >= 7) {
    suggestions.push({
      id: 'sg3', priority: 2, icon: '🏔️', tag: 'Elite Zone',
      text: `${streak} consecutive days. You are no longer just practicing — you are becoming. The subconscious is now writing new default code. Protect this streak like it's sacred.`,
      action: null, tab: null,
    })
  }

  // Streak at risk
  const hour = new Date().getHours()
  if (hour >= 20 && todayRecord && !todayRecord.morning.completedAll) {
    suggestions.push({
      id: 'sg4', priority: 0, icon: '⚠️', tag: 'At Risk',
      text: "Your morning declarations are incomplete and it's evening. Still do them — theta-state absorption doesn't require morning. Your streak can still be protected.",
      action: 'Go to Morning', tab: 'morning',
    })
  }

  // Night not done yet
  if (hour >= 21 && todayRecord && !todayRecord.night.completed) {
    suggestions.push({
      id: 'sg5', priority: 1, icon: '✨', tag: 'Pre-Sleep Due',
      text: "The theta window opens in the hour before sleep. Your pre-sleep loop is the most potent reprogramming channel you have tonight — don't miss it.",
      action: 'Start Pre-Sleep Loop', tab: 'night',
    })
  }

  // Most-used anchor
  const anchorUsage = db.stats.anchorUsage
  const topAnchorId = Object.keys(anchorUsage).sort(
    (a, b) => anchorUsage[b] - anchorUsage[a]
  )[0]

  if (topAnchorId) {
    const anchorMap = {
      d1: 'FEAR', d2: 'CONDEMNATION', d3: 'SPIRALING THOUGHTS',
      d4: 'OVERWHELM', d5: 'UNWORTHINESS', d6: 'CREATIVE BLOCK',
      d7: 'LEADERSHIP MOMENT', d8: 'LEARNING CHALLENGE',
      d9: 'EMOTIONAL TRIGGER', d10: 'HESITATION',
    }
    const anchorName = anchorMap[topAnchorId] || topAnchorId
    const count = anchorUsage[topAnchorId]
    if (count >= 3) {
      suggestions.push({
        id: 'sg6', priority: 3, icon: '🔍', tag: 'Pattern Detected',
        text: `You've deployed the "${anchorName}" anchor ${count} times. This is a recurring pressure point. Consider adding a focused morning declaration or journaling prompt specifically about this area.`,
        action: null, tab: null,
      })
    }
  }

  // Morning completion rate
  const recentDays = Object.values(db.days)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)
  const completedMornings = recentDays.filter(d => d.morning.completedAll).length
  if (recentDays.length >= 4 && completedMornings / recentDays.length < 0.5) {
    suggestions.push({
      id: 'sg7', priority: 1, icon: '🌅', tag: 'Morning Gap',
      text: "Morning declarations have been inconsistent this week. Research shows morning is the highest-yield window — within 30 minutes of waking, cortisol peaks and the mind is most primed. Set a phone reminder for 7:00 AM.",
      action: 'Declare Now', tab: 'morning',
    })
  }

  // Evening journaling gap
  const missedEvenings = recentDays.filter(d => !d.evening.completed).length
  if (recentDays.length >= 4 && missedEvenings >= 3) {
    suggestions.push({
      id: 'sg8', priority: 3, icon: '🌙', tag: 'Reflection Gap',
      text: "Evening reflections have been missed several days. The expressive writing step is where the day's identity votes get consolidated in memory. Even 5 minutes closes the loop.",
      action: 'Open Evening', tab: 'evening',
    })
  }

  // Milestone celebrations
  if (db.stats.totalDeclarations === 50) {
    suggestions.push({
      id: 'sg9', priority: 0, icon: '🎯', tag: 'Milestone',
      text: "50 declarations spoken. Fifty times you chose your true identity over the old one. This is no longer a practice — this is a pattern. You are rewriting yourself.",
      action: null, tab: null,
    })
  }
  if (db.stats.totalDeclarations >= 100) {
    suggestions.push({
      id: 'sg10', priority: 0, icon: '✦', tag: 'Century',
      text: `${db.stats.totalDeclarations} total declarations. The science says 66 days forms a habit. Your subconscious is no longer fighting the new identity — it is becoming it.`,
      action: null, tab: null,
    })
  }

  return suggestions.sort((a, b) => a.priority - b.priority)
}

// ── history helpers ────────────────────────────────────────────
export function getLast30Days(db) {
  const result = []
  const today = todayKey()
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = dayKey(date)
    const record = db.days[key] || null
    result.push({
      key,
      label: date.toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
      shortLabel: date.getDate().toString(),
      morning: record?.morning.completedAll || false,
      evening: record?.evening.completed || false,
      night: record?.night.completed || false,
      isToday: key === today,
    })
  }
  return result
}

export function exportDB(db) {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `identity-protocol-backup-${todayKey()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importDB(jsonString) {
  try {
    const parsed = JSON.parse(jsonString)
    if (!parsed.days || !parsed.streaks) throw new Error('Invalid format')
    return { ...DEFAULT_STATE, ...parsed }
  } catch {
    return null
  }
}

export function resetDB() {
  localStorage.removeItem(DB_KEY)
  return { ...DEFAULT_STATE }
}
