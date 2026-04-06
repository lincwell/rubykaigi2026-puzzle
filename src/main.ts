import '#/style.css'
import { initRuby, getRubyVersion, runChain } from '#/ruby/runner'
import { mountQuizScreen } from '#/screens/QuizScreen'
import { mountResultScreen } from '#/screens/ResultScreen'
import { detectLang } from '#/i18n'
import type { MethodName, QuizResult } from '#/types'

const app = document.querySelector<HTMLDivElement>('#app')!
const lang = detectLang()

// Start loading Ruby WASM in the background immediately
const rubyInitPromise = initRuby()

function showQuiz(): void {
  mountQuizScreen(app, getRubyVersion(), lang, async (chain: MethodName[]) => {
    // Wait for Ruby WASM to be ready (usually already done by now)
    await rubyInitPromise
    const result: QuizResult = await runChain(chain)
    showResult(result)
  })
}

function showResult(result: QuizResult): void {
  mountResultScreen(app, result, getRubyVersion(), lang, () => {
    showQuiz()
  })
}

// Update Ruby version in header once WASM is loaded
rubyInitPromise
  .then((_version) => {
    // Re-render quiz screen if it's the current screen to show the version
    const versionEl = app.querySelector<HTMLElement>('[data-ruby-version]')
    if (versionEl !== null) {
      versionEl.textContent = `ruby ${getRubyVersion()}`
    }
  })
  .catch((err: unknown) => {
    console.error('Failed to initialize Ruby WASM:', err)
  })

showQuiz()
