export type Lang = 'ja' | 'en'

export interface Translations {
  // Layout
  footerDisclaimer: string

  // QuizScreen
  quizTitle: string
  quizSubtitle: string
  quizDescHtml: string
  labelPatient: string
  labelMethods: string
  labelDirections: string
  labelDosage: string
  directionsText: string
  dosageText: string
  labelPrescription: string
  btnClear: string
  labelOrder: string
  placeholderSelect: string
  labelCode: string
  btnSubmitting: string
  btnSubmit: string

  // ResultScreen
  labelAdminError: string
  labelDiagnosis: string
  hintLabel: string
  yourDiagnosis: string
  labelScore: string
  noIntegerTitle: string
  noIntegerDesc: string
  btnShare: string
  recruitHeading: string
  recruitDesc: string
  recruitBtn: string
  btnRetry: string
  resultDisclaimer: string

  // Share text parts
  shareIntro: string
  shareScoreLabel: string
}

const ja: Translations = {
  footerDisclaimer: '※こちらのサイトは、実際の医薬品の服用や診断とは一切関係ありません。',

  quizTitle: 'お  く  す  り',
  quizSubtitle: 'あなたの「Ruby力」を診断します',
  quizDescHtml: `<code class="bg-gray-100 px-1 rounded text-sm">"Lincwell"</code> を起点に、<span class="underline decoration-2 underline-offset-2">最大の整数</span>を返すメソッドチェーンを処方してください。`,
  labelPatient: '患  者',
  labelMethods: '処  方',
  labelDirections: '用  法',
  labelDosage: '用  量',
  directionsText: '上記メソッドをチェーンにて投与すること',
  dosageText: '各 1 回まで',
  labelPrescription: '処方内容',
  btnClear: 'クリア',
  labelOrder: '投与順序',
  placeholderSelect: '← 処方を選択',
  labelCode: '処方コード',
  btnSubmitting: '投与中...',
  btnSubmit: '投与する',

  labelAdminError: '投与エラー',
  labelDiagnosis: '診断結果',
  hintLabel: '💡 ヒント',
  yourDiagnosis: 'あなたの診断結果',
  labelScore: 'スコア',
  noIntegerTitle: '最終結果が Integer ではありません',
  noIntegerDesc:
    'Integer を返すメソッドチェーンを処方してください。<br><code class="font-mono">.size</code>、<code class="font-mono">.length</code>、<code class="font-mono">.sum</code> などで締めくくると Integer になります。',
  btnShare: 'X でシェア',
  recruitHeading: '医療DXの最前線。Rubyの力で、医療の未来を変える',
  recruitDesc: "Linc'wellは、Rubyの可能性を信じ、技術の力で「次世代の当たり前」を築く仲間を求めています。",
  recruitBtn: 'エンジニア採用ページへ →',
  btnRetry: 'もう一度試す',
  resultDisclaimer:
    '※本診断結果は、Rubyのスキルレベルを弊社の独断と偏見で「医療ランク風」に表現したものであり、実在の医師免許、医療資格、および医学的診断とは一切関係ありません。用法・用量を守って正しくコードを書いてください。',

  shareIntro: 'Ruby 処方箋クイズで診断！',
  shareScoreLabel: 'スコア',
}

const en: Translations = {
  footerDisclaimer: '※This site has no relation to actual medical treatment or medication.',

  quizTitle: 'P  R  E  S  C  R  I  P  T  I  O  N',
  quizSubtitle: 'Diagnose Your Ruby Proficiency',
  quizDescHtml: `Starting from <code class="bg-gray-100 px-1 rounded text-sm">"Lincwell"</code>, prescribe a method chain that returns the <span class="underline decoration-2 underline-offset-2">maximum integer</span>.`,
  labelPatient: 'Patient',
  labelMethods: 'Methods',
  labelDirections: 'Directions',
  labelDosage: 'Dosage',
  directionsText: 'Administer the above methods in a chain',
  dosageText: 'Each method may be used once',
  labelPrescription: 'Prescription',
  btnClear: 'Clear',
  labelOrder: 'Order',
  placeholderSelect: '← Select methods',
  labelCode: 'Code',
  btnSubmitting: 'Running...',
  btnSubmit: 'Administer',

  labelAdminError: 'Administration Error',
  labelDiagnosis: 'Diagnosis Result',
  hintLabel: '💡 Hint',
  yourDiagnosis: 'Your Diagnosis',
  labelScore: 'Score',
  noIntegerTitle: 'Final result is not an Integer',
  noIntegerDesc:
    'Please prescribe a method chain that returns an Integer.<br><code class="font-mono">.size</code>, <code class="font-mono">.length</code>, or <code class="font-mono">.sum</code> at the end will return an Integer.',
  btnShare: 'Share on X',
  recruitHeading: "At the Forefront of Medical DX. Changing Healthcare's Future with Ruby.",
  recruitDesc: "Linc'well believes in the power of Ruby and seeks passionate engineers to build the next standard of healthcare.",
  recruitBtn: 'View Engineering Careers →',
  btnRetry: 'Try Again',
  resultDisclaimer:
    '※This diagnosis expresses your Ruby skill level in a "medical rank" style based entirely on our own subjective judgment, and has no relation whatsoever to actual medical licenses, qualifications, or diagnoses. Please follow proper usage and write your code responsibly.',

  shareIntro: 'Ruby Prescription Quiz!',
  shareScoreLabel: 'Score',
}

const translations: Record<Lang, Translations> = { ja, en }

export function t(lang: Lang, key: keyof Translations): string {
  return translations[lang][key]
}

export function detectLang(): Lang {
  const pathname = window.location.pathname
  return pathname.includes('/en/') || pathname.endsWith('/en') ? 'en' : 'ja'
}
