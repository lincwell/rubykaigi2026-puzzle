export type MethodName = 'chars' | 'bytes' | 'methods' | 'class' | 'to_s' | 'inspect' | 'join' | 'size' | 'length' | 'sum'

export const ALL_METHODS: MethodName[] = ['chars', 'bytes', 'methods', 'class', 'to_s', 'inspect', 'join', 'size', 'length', 'sum']

export type StepResult = {
  label: string // '"Lincwell"' for start, '.method' for each step
  type: string // Ruby class name
  valuePreview: string // truncated inspect output
  isInteger: boolean
  intValue: number | null
  error: string | null
}

export type QuizResult = {
  chain: MethodName[]
  steps: StepResult[]
  finalIntValue: number | null
  errorStep: number | null // 1-based index of failed step (0 = start value somehow failed)
}

export type Level = {
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  emoji: string
  minScore: number
}

export const LEVELS: Level[] = [
  { name: '研修医', nameEn: 'Intern', description: 'Ruby のメソッドに触れはじめたばかり', descriptionEn: 'Just starting to explore Ruby methods', emoji: '🩺', minScore: 0 },
  { name: '担当医', nameEn: 'Resident', description: 'メソッドチェーンの仕組みがわかってきた！', descriptionEn: 'Beginning to understand method chaining!', emoji: '💊', minScore: 100 },
  { name: '専門医', nameEn: 'Specialist', description: 'ブロックや Enumerable を自然に使える', descriptionEn: 'Can use blocks and Enumerable naturally', emoji: '🧪', minScore: 1_000 },
  { name: '主治医', nameEn: 'Attending Physician', description: 'Ruby の型変換を使いこなしている', descriptionEn: 'Masters Ruby type conversions', emoji: '🔬', minScore: 10_000 },
  { name: '指導医', nameEn: 'Senior Physician', description: '設計や可読性まで意識して書ける', descriptionEn: 'Writes with design and readability in mind', emoji: '🏥', minScore: 50_000 },
  { name: '名医', nameEn: 'Master', description: 'Ruby の奥深さを知り尽くした達人！', descriptionEn: "A master who knows Ruby's depth!", emoji: '⭐', minScore: 100_000 },
]

export function getLevel(score: number): Level {
  let result = LEVELS[0]!
  for (const level of LEVELS) {
    if (score >= level.minScore) result = level
  }
  return result
}

// TODO: 実際のクーポンコードと URL に差し替える
export const COUPON_CODE = 'RUBYKAIGI2026'
export const COUPON_URL = 'https://linc-well.com/'
