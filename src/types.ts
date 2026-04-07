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
  { name: '医学生',  nameEn: 'Medical Student',      description: 'まずは Ruby のメソッドを覚えよう！ここから全てが始まる！',          descriptionEn: 'Start by learning Ruby methods — every expert begins here!',         emoji: '📚', minScore: 0 },
  { name: '研修医',  nameEn: 'Intern',                description: 'メソッドチェーンの基礎が身についてきた！この調子で続けよう！',        descriptionEn: 'Method chaining basics are clicking! Keep up the momentum!',         emoji: '🩺', minScore: 100 },
  { name: '専攻医',  nameEn: 'Resident',              description: '型変換の仕組みがわかってきた。どんどん伸びている！',                  descriptionEn: 'Type conversions are making sense. You\'re growing fast!',          emoji: '💊', minScore: 1_000 },
  { name: '専門医',  nameEn: 'Specialist',            description: 'Ruby を自信を持って使いこなせている！さらに上を目指せ！',             descriptionEn: 'You\'re wielding Ruby with confidence! Aim even higher!',           emoji: '🧪', minScore: 10_000 },
  { name: '指導医',  nameEn: 'Attending Physician',   description: '深い理解で Ruby を書けている。その実力、素晴らしい！',               descriptionEn: 'Your deep Ruby understanding really shows. Outstanding!',           emoji: '🔬', minScore: 50_000 },
  { name: '助教授',  nameEn: 'Associate Professor',   description: 'Ruby の奥義に迫ってきた。頂点まであと一歩！',                       descriptionEn: 'Approaching the pinnacle of Ruby mastery. Almost there!',           emoji: '🏥', minScore: 100_000 },
  { name: '教授',    nameEn: 'Professor',             description: '完璧！Ruby の真の実力者、あなたこそが頂点だ！',                      descriptionEn: 'Flawless! You stand at the very top — a true Ruby master!',         emoji: '⭐', minScore: 500_000 },
]

export function getLevel(score: number): Level {
  let result = LEVELS[0]!
  for (const level of LEVELS) {
    if (score >= level.minScore) result = level
  }
  return result
}

