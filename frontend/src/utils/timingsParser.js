const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const DAY_ALIASES = {
  mon: 'Mon',
  monday: 'Mon',
  tue: 'Tue',
  tues: 'Tue',
  tuesday: 'Tue',
  wed: 'Wed',
  wednesday: 'Wed',
  thu: 'Thu',
  thur: 'Thu',
  thurs: 'Thu',
  thursday: 'Thu',
  fri: 'Fri',
  friday: 'Fri',
  sat: 'Sat',
  saturday: 'Sat',
  sun: 'Sun',
  sunday: 'Sun',
}

const DAY_PATTERN = '(?:mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday|rday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)'

function cleanText(value = '') {
  return String(value)
    .replace(/[–—−]/g, '-')
    .replace(/\u00a0/g, ' ')
    .replace(/\bto\b/gi, '-')
    .replace(/\bnoon\b/gi, '12 PM')
    .replace(/\bmidnight\b/gi, '12 AM')
    .replace(/(\d)(am|pm)\b/gi, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

function emptySchedule() {
  return DAYS.reduce((schedule, day) => {
    schedule[day] = 'Closed'
    return schedule
  }, {})
}

function normalizeDay(dayText) {
  return DAY_ALIASES[dayText.toLowerCase().replace(/[^a-z]/g, '')]
}

function expandDayToken(token) {
  const rangeRe = new RegExp(`^\\s*(${DAY_PATTERN})\\s*-\\s*(${DAY_PATTERN})\\s*$`, 'i')
  const rangeMatch = token.match(rangeRe)
  if (rangeMatch) {
    const start = normalizeDay(rangeMatch[1])
    const end = normalizeDay(rangeMatch[2])
    if (!start || !end) return []

    const startIndex = DAYS.indexOf(start)
    const endIndex = DAYS.indexOf(end)
    if (startIndex <= endIndex) return DAYS.slice(startIndex, endIndex + 1)
    return [...DAYS.slice(startIndex), ...DAYS.slice(0, endIndex + 1)]
  }

  const days = []
  const dayRe = new RegExp(DAY_PATTERN, 'gi')
  for (const match of token.matchAll(dayRe)) {
    const day = normalizeDay(match[0])
    if (day && !days.includes(day)) days.push(day)
  }
  return days
}

function expandDays(daysText) {
  const days = []
  daysText.split(/\s*,\s*|\s*&\s*|\s+and\s+/i).forEach(token => {
    expandDayToken(token).forEach(day => {
      if (!days.includes(day)) days.push(day)
    })
  })
  return days
}

function normalizeTimePiece(piece) {
  const match = piece.trim().toUpperCase().replace(/\./g, '').match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/)
  if (!match) return piece.trim()

  const hour = Number(match[1])
  const minute = match[2]
  const suffix = match[3]
  return minute && minute !== '00' ? `${hour}:${minute} ${suffix}` : `${hour} ${suffix}`
}

function normalizeTimes(timesText) {
  const text = cleanText(timesText)
  if (!text) return ''
  if (/\b(closed|close|holiday|not open)\b/i.test(text)) return 'Closed'
  if (/\b(24\s*hours|open\s*24|24\/7)\b/i.test(text)) return 'Open 24 hours'

  const timeRe = '\\d{1,2}(?::\\d{2})?\\s*(?:AM|PM)'
  const rangeRe = new RegExp(`(${timeRe})\\s*-\\s*(${timeRe})`, 'gi')
  const ranges = []

  for (const match of text.matchAll(rangeRe)) {
    ranges.push(`${normalizeTimePiece(match[1])} - ${normalizeTimePiece(match[2])}`)
  }
  return ranges.length ? ranges.join(', ') : text
}

function splitTimingSections(text) {
  const sectionRe = new RegExp(`((?:${DAY_PATTERN})(?:\\s*-\\s*(?:${DAY_PATTERN}))?(?:\\s*,\\s*(?:${DAY_PATTERN})(?:\\s*-\\s*(?:${DAY_PATTERN}))?)*)\\s*:?\\s*`, 'gi')
  const matches = [...text.matchAll(sectionRe)]

  return matches.map((match, index) => {
    const start = match.index + match[0].length
    const end = matches[index + 1]?.index ?? text.length
    return [match[1], text.slice(start, end).replace(/^[\s;,]+|[\s;,]+$/g, '')]
  }).filter(([, timesText]) => timesText)
}

export function parseTimings(rawTimings) {
  if (rawTimings && typeof rawTimings === 'object') return { ...emptySchedule(), ...rawTimings }

  const schedule = emptySchedule()
  const text = cleanText(rawTimings)
  if (!text) return schedule

  const sections = splitTimingSections(text)
  const usableSections = sections.length ? sections : [['Mon-Sun', text]]

  usableSections.forEach(([daysText, timesText]) => {
    const times = normalizeTimes(timesText)
    expandDays(daysText).forEach(day => {
      schedule[day] = times
    })
  })
  return schedule
}

export function getTodayKey(date = new Date()) {
  return DAYS[(date.getDay() + 6) % 7]
}

export function timeToMinutes(timeText) {
  const match = timeText.trim().toUpperCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/)
  if (!match) return null

  let hour = Number(match[1])
  const minute = Number(match[2] || 0)
  const suffix = match[3]
  if (suffix === 'AM' && hour === 12) hour = 0
  if (suffix === 'PM' && hour !== 12) hour += 12
  return hour * 60 + minute
}

export function isOpenAt(dayText, date = new Date()) {
  if (!dayText || /^closed$/i.test(dayText)) return false
  if (/24\s*hours/i.test(dayText)) return true

  const now = date.getHours() * 60 + date.getMinutes()
  const timeRe = '\\d{1,2}(?::\\d{2})?\\s*(?:AM|PM)'
  const rangeRe = new RegExp(`(${timeRe})\\s*-\\s*(${timeRe})`, 'gi')

  for (const match of dayText.matchAll(rangeRe)) {
    const start = timeToMinutes(match[1])
    const end = timeToMinutes(match[2])
    if (start == null || end == null) continue
    if (end <= start && (now >= start || now <= end)) return true
    if (end > start && now >= start && now <= end) return true
  }
  return false
}

export { DAYS }
