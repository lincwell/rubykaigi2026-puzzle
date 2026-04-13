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
  {
    name: '初心者',
    nameEn: 'Beginner',
    description:
      'Rubyという薬の成分を、まずは正しく読み解き始めた段階です。無理な服用（複雑なコード）は避け、まずは標準ライブラリという基本処方から、少しずつ身体になじませていきましょう。',
    descriptionEn:
      "You're just beginning to read the ingredients of Ruby correctly. Avoid heavy doses—complex code—for now, and start by getting comfortable with the standard library.",
    emoji: '🔰',
    minScore: 0,
  },
  {
    name: '実務者',
    nameEn: 'Practitioner',
    description:
      '基本的な症例（タスク）に対して、適切な処置ができるレベルです。コードの効能は安定してきましたが、稀に予期せぬ副作用に悩まされることもあります。こまめな検診（テスト）を行いながら、堅実な処方を身につけていきましょう。',
    descriptionEn:
      'You can provide the right treatment for common cases and tasks. Your code is generally reliable, but unexpected side effects can still occur, so regular checkups—tests—are strongly recommended.',
    emoji: '🥉',
    minScore: 100,
  },
  {
    name: '熟練者',
    nameEn: 'Proficient',
    description:
      '現場の第一線で活躍する、頼れる技術者です。高度なメソッドチェーンのような効率的な成分を適切に配合し、チームの健康状態を安定して支えられています。次は、より再現性の高い処方を目指して、設計の精度を高めていきましょう。',
    descriptionEn:
      "You're a dependable engineer working on the front lines. By combining efficient ingredients such as advanced method chaining, you help keep your team's codebase healthy. Keep deepening your design expertise to create even more sophisticated prescriptions.",
    emoji: '🥈',
    minScore: 1_000,
  },
  {
    name: '上級者',
    nameEn: 'Advanced',
    description:
      '複雑な症例（要件）にも落ち着いて対応できる上級者です。可読性・保守性・性能のバランスを見極めながら、的確な処方を組み立てられるようになっています。今後は、局所的な治療だけでなく、システム全体の健康を見据えた診断力が鍵になります。',
    descriptionEn:
      'You handle complex cases with confidence, balancing readability, maintainability, and performance. Your prescriptions are precise, and your architectural judgment is becoming a trusted strength.',
    emoji: '🥇',
    minScore: 10_000,
  },
  {
    name: 'エキスパート',
    nameEn: 'Expert',
    description:
      'あなたのコードは、チームの技術的負債に対する特効薬となるでしょう。副作用の発生を最小限に抑えた、美しく信頼性の高い処方を実現できています。周囲のエンジニアにとっても、安心して相談できるセカンドオピニオンのような存在です。',
    descriptionEn:
      "Your code is becoming a powerful remedy for your team's technical debt. It's a beautiful prescription with minimal side effects, and you're likely serving as a trusted second opinion for the engineers around you.",
    emoji: '🏆',
    minScore: 50_000,
  },
  {
    name: 'スペシャリスト',
    nameEn: 'Specialist',
    description:
      'Rubyの深層、すなわち内部構造にまで精通した精密なスペシャリストです。他の人が見逃すような微細な異常（ボトルネック）も瞬時に見抜き、最小限の手数で的確に治療できます。その診断と処置は、もはや職人技の領域に達しています。',
    descriptionEn:
      "You're a precise specialist who understands Ruby all the way down to its internals. You can instantly spot subtle abnormalities—bottlenecks others miss—and cure them with an exceptional economy of effort.",
    emoji: '💎',
    minScore: 100_000,
  },
  {
    name: 'マスター',
    nameEn: 'Master',
    description:
      'もはやRubyと一体化した、伝説的な存在です。あなたの書く一行は、難病（複雑な仕様）すら一撃で解決へ導く奇跡の処方箋。用法・用量を守る必要すらありません。なぜなら、あなた自身が新たな標準治療そのものだからです。',
    descriptionEn:
      'You and Ruby have become one—a truly legendary presence. Every line you write is a miraculous prescription capable of curing even the most complex specifications. At this point, dosage guidelines no longer apply—you are the rule itself.',
    emoji: '👑',
    minScore: 500_000,
  },
]

export function getLevel(score: number): Level {
  let result = LEVELS[0]!
  for (const level of LEVELS) {
    if (score >= level.minScore) result = level
  }
  return result
}
