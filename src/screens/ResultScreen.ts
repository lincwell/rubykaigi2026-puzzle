import { getLevel, LEVELS, type QuizResult, type StepResult } from '#/types'
import { buildHeader, buildFooter } from '#/layout'
import { t, type Lang } from '#/i18n'

const DEPLOY_URL = 'https://lincwell.github.io/rubykaigi2026-puzzle/'

export function mountResultScreen(app: HTMLElement, result: QuizResult, rubyVersion: string, lang: Lang, onRetry: () => void): void {
  app.innerHTML = buildSkeletonHTML(result, rubyVersion, lang)
  // event delegation — アニメーション後に動的追加されるボタンも捕捉できる
  app.addEventListener('click', (e) => {
    if ((e.target as Element).closest('[data-action="retry"]') !== null) onRetry()
  })
  void animateSteps(app, result, lang)
}

// ---------- Animation ----------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function animateSteps(app: HTMLElement, result: QuizResult, lang: Lang): Promise<void> {
  const container = app.querySelector<HTMLElement>('[data-steps-container]')
  if (container === null) return

  for (let i = 0; i < result.steps.length; i++) {
    if (i > 0) await delay(500)

    const step = result.steps[i]!
    const row = document.createElement('div')
    row.className = 'step-enter border-b border-gray-100 last:border-0'
    row.innerHTML = buildStepRow(step)
    container.appendChild(row)
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  await delay(500)

  // After all steps: show hint or score
  if (result.errorStep !== null) {
    showErrorHint(app, result, lang)
  } else {
    showPostSteps(app, result, lang)
  }
}

function showErrorHint(app: HTMLElement, result: QuizResult, lang: Lang): void {
  const hintEl = app.querySelector<HTMLElement>('[data-error-hint]')
  if (hintEl === null) return

  const errorStep = result.steps[result.errorStep!]
  const prevStep = result.errorStep! > 0 ? result.steps[result.errorStep! - 1] : null
  const hint = getErrorHint(lang, errorStep?.error ?? '', errorStep?.label ?? '', prevStep?.type ?? '')

  hintEl.innerHTML = `
    <div class="step-enter px-4 py-4 bg-amber-50 border-t border-amber-100 space-y-3">
      <p class="text-xs font-bold text-amber-700">${t(lang, 'hintLabel')}</p>
      <p class="text-xs text-amber-800 leading-relaxed">${hint}</p>
      <button data-action="retry"
        data-umami-event="retry-button"
        data-umami-event-type="error-hint"
        class="w-full py-2.5 rounded-lg border-2 font-bold text-sm transition-all hover:bg-white active:scale-95"
        style="border-color: #00b9f0; color: #00b9f0;">
        ${t(lang, 'btnRetry')}
      </button>
    </div>
  `
  hintEl.classList.remove('hidden')
  hintEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

function showPostSteps(app: HTMLElement, result: QuizResult, lang: Lang): void {
  const postEl = app.querySelector<HTMLElement>('[data-post-steps]')
  if (postEl === null) return

  postEl.innerHTML = buildPostStepsHTML(result, lang)
  postEl.classList.remove('hidden')
  postEl.classList.add('step-enter')
  postEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

// ---------- Error hints ----------

function getErrorHint(lang: Lang, errorMsg: string, failedLabel: string, prevType: string): string {
  const method = failedLabel.startsWith('.') ? failedLabel.slice(1) : failedLabel

  if (errorMsg.includes('NoMethodError')) {
    switch (method) {
      case 'chars':
      case 'bytes':
        return lang === 'ja'
          ? `<code class="font-mono">.${method}</code> は <strong>String</strong> のメソッドです。
             前のステップが <strong>${escapeHtml(prevType)}</strong> になっているため呼び出せません。
             <code class="font-mono">.to_s</code> や <code class="font-mono">.inspect</code> で文字列に変換してから試しましょう。`
          : `<code class="font-mono">.${method}</code> is a <strong>String</strong> method.
             The previous step returned <strong>${escapeHtml(prevType)}</strong>, so it cannot be called here.
             Try converting to a String first with <code class="font-mono">.to_s</code> or <code class="font-mono">.inspect</code>.`

      case 'join':
        return lang === 'ja'
          ? `<code class="font-mono">.join</code> は <strong>Array</strong> のメソッドです。
             前のステップが <strong>${escapeHtml(prevType)}</strong> になっているため呼び出せません。
             <code class="font-mono">.chars</code>、<code class="font-mono">.bytes</code>、<code class="font-mono">.methods</code> などで Array にしてから使いましょう。`
          : `<code class="font-mono">.join</code> is an <strong>Array</strong> method.
             The previous step returned <strong>${escapeHtml(prevType)}</strong>, so it cannot be called here.
             Use <code class="font-mono">.chars</code>, <code class="font-mono">.bytes</code>, or <code class="font-mono">.methods</code> first to get an Array.`

      case 'sum':
        if (prevType === 'String') {
          return lang === 'ja'
            ? `<code class="font-mono">String#sum</code> はチェックサムを返します（<code class="font-mono">Array#sum</code> の合計とは異なります）。
               <code class="font-mono">.bytes</code> で整数配列に変換してから <code class="font-mono">.sum</code> を使うと byte の合計が取れます。`
            : `<code class="font-mono">String#sum</code> returns a checksum (different from <code class="font-mono">Array#sum</code>).
               Use <code class="font-mono">.bytes</code> to get an integer array first, then <code class="font-mono">.sum</code> to get the byte total.`
        }
        return lang === 'ja'
          ? `<code class="font-mono">.sum</code> は <strong>Array</strong> または <strong>String</strong> のメソッドです。
             前のステップが <strong>${escapeHtml(prevType)}</strong> になっているため呼び出せません。
             <code class="font-mono">.bytes</code> や <code class="font-mono">.methods</code> で Array にしてから使いましょう。`
          : `<code class="font-mono">.sum</code> is a method on <strong>Array</strong> or <strong>String</strong>.
             The previous step returned <strong>${escapeHtml(prevType)}</strong>, so it cannot be called here.
             Use <code class="font-mono">.bytes</code> or <code class="font-mono">.methods</code> to get an Array first.`

      case 'size':
      case 'length':
        return lang === 'ja'
          ? `<code class="font-mono">.${method}</code> をこの型（<strong>${escapeHtml(prevType)}</strong>）では使えません。
             <code class="font-mono">.to_s</code> で文字列に変換してから試してみましょう。`
          : `<code class="font-mono">.${method}</code> cannot be used on this type (<strong>${escapeHtml(prevType)}</strong>).
             Try converting to a String with <code class="font-mono">.to_s</code> first.`

      default:
        return lang === 'ja'
          ? `<code class="font-mono">.${escapeHtml(method)}</code> は <strong>${escapeHtml(prevType)}</strong> には定義されていません。
             型遷移の表を参考にメソッドの順序を変えてみましょう。`
          : `<code class="font-mono">.${escapeHtml(method)}</code> is not defined on <strong>${escapeHtml(prevType)}</strong>.
             Try reordering the methods based on the type transition table.`
    }
  }

  if (errorMsg.includes('TypeError')) {
    if (method === 'sum' && prevType === 'Array') {
      return lang === 'ja'
        ? `Array の要素が Integer でないため <code class="font-mono">.sum</code> が失敗しました。
           <code class="font-mono">.bytes</code> で整数の Array を作ってから <code class="font-mono">.sum</code> しましょう。`
        : `<code class="font-mono">.sum</code> failed because the Array elements are not Integers.
           Use <code class="font-mono">.bytes</code> to create an Integer Array first, then call <code class="font-mono">.sum</code>.`
    }
    return lang === 'ja'
      ? `型の変換に失敗しました（<strong>${escapeHtml(prevType)}</strong> → <code class="font-mono">.${escapeHtml(method)}</code>）。
         メソッドの組み合わせを変えてみましょう。`
      : `Type conversion failed (<strong>${escapeHtml(prevType)}</strong> → <code class="font-mono">.${escapeHtml(method)}</code>).
         Try a different combination of methods.`
  }

  return lang === 'ja'
    ? `<code class="font-mono">.${escapeHtml(method)}</code> の呼び出し中にエラーが発生しました。
       型遷移の表を参考にメソッドの順序を確認してみましょう。`
    : `An error occurred while calling <code class="font-mono">.${escapeHtml(method)}</code>.
       Check the method order based on the type transition table.`
}

// ---------- HTML builders ----------

function buildSkeletonHTML(result: QuizResult, rubyVersion: string, lang: Lang): string {
  const hasError = result.errorStep !== null
  const cardBorderColor = hasError ? '#fca5a5' : '#e5e7eb'
  const cardHeaderBg = hasError ? 'bg-red-50' : 'bg-gray-50'
  const cardHeaderText = hasError ? 'text-red-700' : 'text-gray-700'
  const cardHeaderIcon = hasError ? '⚠' : '✓'
  const cardHeaderLabel = hasError ? t(lang, 'labelAdminError') : t(lang, 'labelDiagnosis')

  return `
    ${buildHeader(rubyVersion, lang)}
    <main class="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <!-- Steps card -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden" style="border: 2px solid ${cardBorderColor};">
        <div class="px-4 py-3 border-b flex items-center gap-2 ${cardHeaderBg}">
          <span class="${hasError ? 'text-red-500' : 'text-green-500'} text-lg">${cardHeaderIcon}</span>
          <span class="font-bold ${cardHeaderText}">${cardHeaderLabel}</span>
        </div>
        <div data-steps-container class="divide-y divide-gray-100"></div>
        <div data-error-hint class="hidden"></div>
      </div>

      <!-- Post-steps: score + share + recruit (revealed after animation) -->
      <div data-post-steps class="hidden space-y-6"></div>

    </main>
    ${buildFooter(lang)}
  `
}

function buildPostStepsHTML(result: QuizResult, lang: Lang): string {
  const hasScore = result.finalIntValue !== null

  return `
    ${hasScore ? buildScoreSection(result, lang) : buildNoIntegerSection(lang)}
    ${buildRecruitSection(lang)}
  `
}

function buildStepRow(step: StepResult): string {
  const isError = step.error !== null

  return `
    <div class="px-4 py-3 flex items-start gap-3 ${isError ? 'bg-red-50' : ''}">
      <code class="text-xs text-gray-500 w-28 shrink-0 pt-0.5" style="font-family: var(--font-mono);">${escapeHtml(step.label)}</code>
      <div class="flex-1 min-w-0">
        ${
          isError
            ? `<span class="text-xs text-red-500">❌ ${escapeHtml(step.error ?? '')}</span>`
            : `<div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-bold px-2 py-0.5 rounded-full ${step.isInteger ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}">
                  ${escapeHtml(step.type)}${step.isInteger ? ' ✓' : ''}
                </span>
                <span class="text-xs text-gray-400 truncate max-w-48" title="${escapeHtml(step.valuePreview)}" style="font-family: var(--font-mono);">
                  ${escapeHtml(step.valuePreview)}
                </span>
              </div>`
        }
      </div>
    </div>
  `
}

function buildLevelLadder(score: number, lang: Lang): string {
  const currentLevel = getLevel(score)
  const ladderLabel = lang === 'ja' ? '＼今回の診断結果／' : '＼ Your Result ／'

  const parts: string[] = []
  for (let i = 0; i < LEVELS.length; i++) {
    const level = LEVELS[i]!
    const isCurrent = level.minScore === currentLevel.minScore
    const name = lang === 'ja' ? level.name : level.nameEn

    if (isCurrent) {
      parts.push(`
        <div class="flex flex-col items-center shrink-0">
          <span class="text-[9px] font-bold whitespace-nowrap leading-tight mb-1" style="color:#00b9f0;">${ladderLabel}</span>
          <span class="text-xs font-bold leading-tight pb-0.5" style="color:#00b9f0; border-bottom: 2px solid #00b9f0;">${name}</span>
        </div>
      `)
    } else {
      parts.push(`<span class="text-[10px] text-gray-400 shrink-0 leading-tight">${name}</span>`)
    }

    if (i < LEVELS.length - 1) {
      parts.push(`<span class="text-gray-300 text-[10px] shrink-0">＜</span>`)
    }
  }

  return `
    <div class="overflow-x-auto text-center">
      <div class="inline-flex items-end gap-1.5 py-2">
        ${parts.join('')}
      </div>
    </div>
  `
}

function buildScoreSection(result: QuizResult, lang: Lang): string {
  const score = result.finalIntValue!
  const level = getLevel(score)
  const levelName = lang === 'ja' ? level.name : level.nameEn
  const levelDesc = lang === 'ja' ? level.description : level.descriptionEn
  const chainExpr = `"Lincwell".${result.chain.join('.')}`

  window.umami?.track('view-score', {
    levelName,
    score,
    chainExpr,
  });

  return `
    <div class="bg-white border-2 rounded-xl shadow-md overflow-hidden text-center" style="border-color: #00b9f0;">
      <div class="px-4 py-2 text-white text-sm font-bold" style="background: #00b9f0;">${t(lang, 'yourDiagnosis')}</div>
      <div class="p-6">
        <div class="text-5xl mb-2">${level.emoji}</div>
        <div class="text-2xl font-bold mb-1" style="font-family: var(--font-serif);">Ruby ${levelName}</div>
        <div class="text-xs text-gray-500 mb-4">${levelDesc}</div>
        ${buildLevelLadder(score, lang)}
        <div class="bg-gray-50 rounded-lg p-3 mt-4 mb-3">
          <div class="text-xs text-gray-400 mb-1">${t(lang, 'labelScore')}</div>
          <div class="text-4xl font-bold tabular-nums" style="color: #00b9f0;">${score.toLocaleString()}</div>
        </div>
        <code class="text-xs text-gray-400 break-all" style="font-family: var(--font-mono);">${escapeHtml(chainExpr)}</code>
        <div class="mt-5 space-y-3">
          ${buildShareButton(result, lang)}
          <button data-action="retry"
            data-umami-event="retry"
            data-umami-event-type="view-score"
            class="w-full py-3 rounded-lg border-2 font-bold text-sm transition-all hover:bg-gray-50 active:scale-95"
            style="border-color: #00b9f0; color: #00b9f0;">
            ${t(lang, 'btnRetry')}
          </button>
        </div>
      </div>
    </div>
  `
}

function buildNoIntegerSection(lang: Lang): string {
  return `
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
      <div class="text-3xl mb-2">🤔</div>
      <p class="text-sm font-bold text-amber-700 mb-2">${t(lang, 'noIntegerTitle')}</p>
      <p class="text-xs text-amber-600 leading-relaxed mb-4">
        ${t(lang, 'noIntegerDesc')}
      </p>
      <button data-action="retry"
        data-umami-event="retry"
        data-umami-event-type="no-integer"
        class="w-full py-3 rounded-lg border-2 font-bold text-sm transition-all hover:bg-white active:scale-95"
        style="border-color: #00b9f0; color: #00b9f0;">
        ${t(lang, 'btnRetry')}
      </button>
    </div>
  `
}

function buildShareButton(result: QuizResult, lang: Lang): string {
  const score = result.finalIntValue!
  const level = getLevel(score)
  const levelName = lang === 'ja' ? level.name : level.nameEn
  const chainExpr = `"Lincwell".${result.chain.join('.')}`
  const shareUrl = lang === 'en' ? `${DEPLOY_URL}en/` : DEPLOY_URL

  const jaText = [
    '私のRuby力は……',
    '◤￣￣￣￣￣￣￣￣￣￣',
    `スコア: ${score.toLocaleString()} / ${levelName} ${level.emoji}`,
    chainExpr,
    '＿＿＿＿＿＿＿＿＿＿◢',
    'あなたも #処方箋でRuby診断 に挑戦！',
    '#rubykaigi2026',
  ].join('\n')

  const enText = [
    'My Ruby skills...',
    '◤￣￣￣￣￣￣￣￣￣￣',
    `Score: ${score.toLocaleString()} / ${levelName} ${level.emoji}`,
    chainExpr,
    '＿＿＿＿＿＿＿＿＿＿◢',
    'Try #処方箋でRuby診断 too!',
    '#rubykaigi2026',
  ].join('\n')

  const text = lang === 'ja' ? jaText : enText
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
  const ladderLabel = lang === 'ja' ? 'あなたの「Ruby力」をSNSで共有しよう！' : 'Share your Ruby skills on social media!'

  return `
    <div class="text-xs text-gray-400 mb-1 flex items-center justify-center">
      <span class="text-xl pr-3">\\</span>
      <span>${ladderLabel}</span>
      <span class="text-xl pl-3">/</span>
    </div>
    <a href="${escapeHtml(tweetUrl)}" target="_blank" rel="noopener noreferrer"
      data-umami-event="outbound-tweet-url-click"
      data-umami-event-url="${escapeHtml(tweetUrl)}"
      class="flex flex-col items-center justify-center w-full py-3 rounded-lg text-white font-bold transition-all hover:opacity-90 active:scale-95"
      style="background: #000;">
      <span class="text-sm">${t(lang, 'btnShare')}</span>
      <span class="text-xs font-normal pt-1" style="color: rgba(255,255,255,0.55);">${t(lang, 'btnShareSubText')}</span>
    </a>
  `
}

const RECRUIT_URL = 'https://recruit.linc-well.com/engineer?utm_source=rubykaigi2026-puzzle'

function buildRecruitSection(lang: Lang): string {
  return `
    <a href="${RECRUIT_URL}" target="_blank" rel="noopener noreferrer"
      data-umami-event="outbound-recruit-click"
      data-umami-event-url="${RECRUIT_URL}"
      class="block rounded-xl overflow-hidden shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
      style="background: linear-gradient(135deg, #0097c9 0%, #00b9f0 60%, #33ccff 100%);">
      <div class="px-5 py-5">
        <p class="text-xs font-bold text-white/70 mb-2 tracking-wider uppercase">Recruit</p>
        <p class="text-base font-bold text-white leading-snug mb-3">${t(lang, 'recruitHeading')}</p>
        <p class="text-xs text-white/85 leading-relaxed mb-4">${t(lang, 'recruitDesc')}</p>
        <span class="inline-block text-xs font-bold text-white border border-white/60 rounded-full px-4 py-1.5">
          ${t(lang, 'recruitBtn')}
        </span>
      </div>
    </a>
  `
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
