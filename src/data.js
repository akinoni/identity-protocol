// ─────────────────────────────────────────────────────────────
//  data.js  —  All static content for Identity Protocol
// ─────────────────────────────────────────────────────────────

export const ROLES = [
  { emoji: '🧠', title: 'Dr. Neural',      sub: 'Cognitive Neuroscientist & Subconscious Reprogramming Architect' },
  { emoji: '📖', title: 'The Theologian',  sub: 'Biblical Scholar & Spiritual Formation Guide' },
  { emoji: '🩺', title: 'Dr. Reframe',     sub: 'Clinical Psychologist — CBT & Identity Reconstruction' },
  { emoji: '⚡', title: 'The Strategist',  sub: 'Elite Performance & Leadership Coach' },
  { emoji: '🎵', title: 'The Composer',    sub: 'Expressive Arts & Music-Healing Practitioner' },
]

export const MORNING = [
  {
    id: 'm1', theme: 'Freedom & Center', icon: '⛓️‍💥',
    affirmation: 'The case is permanently closed on everything behind me. No voice of accusation has any authority over my life today. I am joined in life-union with Jesus — and that union makes me unshakeable, unburdened, and completely free to step fully into today.',
    scripture: 'Romans 8:1',
    verse: 'There remains no accusing voice of condemnation against those who are joined in life-union with Jesus, the Anointed One.',
    identity: 'centered',
  },
  {
    id: 'm2', theme: 'Belonging & Full Acceptance', icon: '🏠',
    affirmation: 'I am not driven by religious fear or the exhausting dread of never being enough. I have been fully accepted — enfolded into the family of God without condition. His Spirit rises within me and calls God "Beloved Father," and I join that cry with confidence. I am not an orphan. I am Home. I belong here.',
    scripture: 'Romans 8:15',
    verse: 'You have received the Spirit of full acceptance, enfolding you into the family of God. You will never feel orphaned.',
    identity: 'spiritual',
  },
  {
    id: 'm3', theme: 'Resilience & Shelter', icon: '🦅',
    affirmation: 'I have taken shelter under the shadow of His wings. Every storm I face — however fierce — is passing. Every trap laid for me springs shut upon itself. My heart is quiet and confident. God is fulfilling His specific purposes for me, even now, even in this season. I rise.',
    scripture: 'Psalm 57',
    verse: 'My heart, O God, is quiet and confident. He will send down help from heaven to save me. God fulfills his purposes for me.',
    identity: 'resilient',
  },
  {
    id: 'm4', theme: 'Power & Self-Control', icon: '⚡',
    affirmation: 'Fear is not my inheritance. God has given me mighty power — and I feel it alive and moving in me right now. He has given me love — it marks every interaction I have today. He has given me self-control — my mind, my emotions, and my actions are governed by His Spirit, not by circumstance.',
    scripture: '2 Timothy 1:7',
    verse: 'God will never give you the spirit of fear, but the Holy Spirit who gives you mighty power, love, and self-control.',
    identity: 'powerful',
  },
  {
    id: 'm5', theme: 'Mental Warfare & Sharp Mind', icon: '⚔️',
    affirmation: 'I do not fight with human weapons. Divine power flows through me to dismantle every deception, every mental stronghold, every arrogant thought that rises against truth. I capture every thought — every single one — and insist it bow to the Anointed One. My mind is a disciplined, governed, elite-level instrument.',
    scripture: '2 Corinthians 10:3–6',
    verse: 'We capture, like prisoners of war, every thought and insist that it bow in obedience to the Anointed One.',
    identity: 'sharp',
  },
  {
    id: 'm6', theme: 'Leader & Innovator', icon: '🏔️',
    affirmation: 'I am built for the front. I think at an elite level — I see what others miss, synthesize what others scatter, and act where others hesitate. My leadership flows from divine power, not human manipulation. I innovate from principle, not from pressure. I shape the room I am in.',
    scripture: '2 Corinthians 10:3–4',
    verse: 'Our spiritual weapons are energized with divine power to effectively dismantle the defenses behind which people hide.',
    identity: 'leader',
  },
  {
    id: 'm7', theme: 'Ultra-Fast Learner', icon: '🚀',
    affirmation: 'My mind absorbs with supernatural speed. Every domain I enter, I master rapidly. My curiosity is relentless, my retention is sharp, my application is immediate. Learning is not labor — it is my nature. I am wired for accelerated excellence.',
    scripture: '2 Timothy 1:7',
    verse: 'The Holy Spirit who gives you mighty power.',
    identity: 'learner',
  },
  {
    id: 'm8', theme: 'Empathy & Emotional Intelligence', icon: '💛',
    affirmation: 'I feel deeply and I lead wisely. My emotional intelligence is not a vulnerability — it is my most powerful instrument. I read atmospheres. I hold space. I respond rather than react. My empathy builds trust, creates safety, and transforms every room I enter.',
    scripture: 'Romans 8:15',
    verse: 'You will never feel orphaned, for as he rises up within us, our spirits join him in saying the words of tender affection.',
    identity: 'empathetic',
  },
  {
    id: 'm9', theme: 'Musical & Creative', icon: '🎵',
    affirmation: 'Like David, my soul is awake to the music of His splendor. My worship awakens the dawn. Sound, rhythm, melody, and creative vision flow through me as sacred intelligence. I am a creative conduit. My art is devotion. My music is a language the world needs to hear, and it pours out of me naturally.',
    scripture: 'Psalm 57',
    verse: 'Awake, O my soul, with the music of his splendor. My worship will awaken the dawn, greeting the daybreak with my songs of praise!',
    identity: 'musical',
  },
  {
    id: 'm10', theme: 'Action-Taker & Principle-Based', icon: '🎯',
    affirmation: 'I am a person of decisive, principled action. I move on conviction, not on comfort. On truth, not on trends. Every action I take today is a vote for who I am becoming. I do not wait for perfect conditions — I am the condition that makes things possible. I act. I lead. I move.',
    scripture: '2 Corinthians 10:6',
    verse: 'We stand ready to punish any trace of rebellion, as soon as you choose complete obedience.',
    identity: 'action',
  },
]

export const DAY_ANCHORS = [
  { id: 'd1',  trigger: 'FEAR',              icon: '🔥', anchor: 'Not fear — power, love, self-control. I am equipped.',       ref: '2 Tim 1:7'     },
  { id: 'd2',  trigger: 'CONDEMNATION',       icon: '⛓️', anchor: 'Case closed. No accusation stands. I am free.',              ref: 'Rom 8:1'       },
  { id: 'd3',  trigger: 'SPIRALING THOUGHTS', icon: '⚔️', anchor: 'I capture this thought. It bows. My mind is governed.',      ref: '2 Cor 10:5'    },
  { id: 'd4',  trigger: 'OVERWHELM',          icon: '🦅', anchor: 'Under His wings. His purposes. This passes.',                ref: 'Ps 57'         },
  { id: 'd5',  trigger: 'UNWORTHINESS',       icon: '🏠', anchor: 'Fully accepted. Not orphaned. Beloved child.',               ref: 'Rom 8:15'      },
  { id: 'd6',  trigger: 'CREATIVE BLOCK',     icon: '🎵', anchor: 'My soul is awake. Music and vision flow through me.',        ref: 'Ps 57'         },
  { id: 'd7',  trigger: 'LEADERSHIP MOMENT',  icon: '🏔️', anchor: 'Front line. Elite mind. Principle over applause.',           ref: '2 Cor 10:3'    },
  { id: 'd8',  trigger: 'LEARNING CHALLENGE', icon: '🚀', anchor: 'I absorb at supernatural speed. This is mine.',              ref: '2 Tim 1:7'     },
  { id: 'd9',  trigger: 'EMOTIONAL TRIGGER',  icon: '💛', anchor: 'I feel. I hold space. I respond, not react.',                ref: 'Rom 8:15'      },
  { id: 'd10', trigger: 'HESITATION',         icon: '🎯', anchor: 'Move now. Principle-based. This is who I am.',               ref: '2 Cor 10:6'    },
]

export const EVENING_PROMPTS = [
  { id: 'e1', icon: '🔍', prompt: 'Where did I act from my old identity today — and what would my new self have done instead?' },
  { id: 'e2', icon: '⚔️', prompt: 'What thought did I successfully capture and redirect? What thought still needs work?' },
  { id: 'e3', icon: '✨', prompt: 'Where did I see God fulfilling His purposes for me today — however subtle or hidden?' },
  { id: 'e4', icon: '💛', prompt: 'What was one moment of empathy, creativity, or decisive leadership I expressed today?' },
  { id: 'e5', icon: '🎯', prompt: 'What principle guided my single best decision today?' },
  { id: 'e6', icon: '🗳️', prompt: 'Complete this: "Today I cast a vote for my new identity when I _______________."' },
]

export const NIGHT_LOOP = [
  { id: 'n1', phrase: 'I am free. No condemnation. I belong.',     ref: 'Romans 8:1'    },
  { id: 'n2', phrase: 'Power. Love. Self-control. In me.',         ref: '2 Timothy 1:7' },
  { id: 'n3', phrase: 'My heart — quiet. Confident. His.',         ref: 'Psalm 57'      },
  { id: 'n4', phrase: 'He fulfills His purposes for me.',          ref: 'Psalm 57'      },
  { id: 'n5', phrase: 'I am becoming. Every night. Every morning.',ref: 'All scriptures' },
]

export const IDENTITY_TRAITS = [
  { id: 'centered',   label: 'Centered',     icon: '⚖️' },
  { id: 'resilient',  label: 'Resilient',    icon: '🦅' },
  { id: 'spiritual',  label: 'Spiritual',    icon: '✦'  },
  { id: 'sharp',      label: 'Sharp Mind',   icon: '⚔️' },
  { id: 'leader',     label: 'Leader',       icon: '🏔️' },
  { id: 'learner',    label: 'Fast Learner', icon: '🚀' },
  { id: 'empathetic', label: 'Empathetic',   icon: '💛' },
  { id: 'musical',    label: 'Musical',      icon: '🎵' },
  { id: 'action',     label: 'Action-Taker', icon: '🎯' },
  { id: 'powerful',   label: 'Powerful',     icon: '⚡' },
]
