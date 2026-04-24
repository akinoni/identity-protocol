# Identity Protocol
### Scripture-Anchored Subconscious Reprogramming System

A fully local, privacy-first daily protocol for identity transformation — built on cognitive neuroscience, CBT research, and biblical truth.

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher

### Install & Run

```bash
# 1. Navigate into the project folder
cd identity-protocol

# 2. Install dependencies (one time only)
npm install

# 3. Start the app
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Features

| Feature | Details |
|---|---|
| 🌅 Morning Declarations | 10 scripture-anchored affirmations with declare tracking |
| ⚓ Day Anchors | 10 real-time thought-capture triggers, tap to log |
| 🌙 Evening Reflection | 6 CBT-based identity consolidation prompts |
| ✨ Pre-Sleep Loop | 5 theta-state reprogramming phrases |
| 🔥 Streak Tracking | Current streak, longest streak, daily completion status |
| 📊 Progress Dashboard | 30-day activity map, identity trait activation bars |
| 💡 Smart Suggestions | Pattern-detected, personalized coaching nudges |
| ☀️ / 🌙 Light & Dark Mode | Toggle in the top bar |
| 💾 Local Database | All data stored in your browser — nothing sent anywhere |
| ⬇ Export / Import | Backup your data as JSON at any time |

---

## Project Structure

```
identity-protocol/
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Dev server config
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Full application (UI + state)
    ├── db.js               # LocalStorage database layer + suggestions engine
    ├── data.js             # All affirmations, anchors, prompts, night loops
    └── index.css           # Global CSS reset + animations
```

---

## Scriptural Anchors

- **Romans 8:1** — Freedom & Identity
- **Romans 8:15** — Belonging & Full Acceptance  
- **2 Corinthians 10:3–6** — Mental Warfare & Thought Capture
- **2 Timothy 1:7** — Power, Love & Self-Control
- **Psalm 57** — Resilience, Worship & Confident Heart

---

## Data & Privacy

All data is stored in your browser's `localStorage` under the key `identity_protocol_v2`.  
Nothing is transmitted, logged, or shared. Export a JSON backup anytime from the Progress tab.

To move your data to another device:
1. Export JSON from the Progress tab
2. Open the app on the new device
3. *(Import feature coming in next version)*

---

## Build for Production

```bash
npm run build
# Output in /dist — can be served from any static host
```

---

## The Science Behind It

| Mechanism | Research Basis |
|---|---|
| Hypnagogic reprogramming | Kirsch et al. — theta-state belief formation |
| Emotional affirmations | Hebbian Learning + amygdala encoding |
| Expressive writing | Pennebaker (1986–2018) — cortisol reduction, narrative shift |
| Identity-based habits | Phillippa Lally habit research + Daryl Bem self-perception theory |
| Thought capture | CBT / Ellis ABC Model + 2 Cor 10:5 |
| Pre-sleep programming | Brainwave entrainment research — delta/theta state |

---

*Built for transformation. Not for performance.*
