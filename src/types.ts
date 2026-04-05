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
  description: string
  emoji: string
  minScore: number
}

export const LEVELS: Level[] = [
  { name: '研修医', description: 'Ruby のメソッドに触れはじめたばかり', emoji: '🩺', minScore: 0 },
  { name: '担当医', description: 'メソッドチェーンの仕組みがわかってきた！', emoji: '💊', minScore: 100 },
  { name: '専門医', description: 'ブロックや Enumerable を自然に使える', emoji: '🧪', minScore: 1_000 },
  { name: '主治医', description: 'Ruby の型変換を使いこなしている', emoji: '🔬', minScore: 10_000 },
  { name: '指導医', description: '設計や可読性まで意識して書ける', emoji: '🏥', minScore: 50_000 },
  { name: '名医', description: 'Ruby の奥深さを知り尽くした達人！', emoji: '⭐', minScore: 100_000 },
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
