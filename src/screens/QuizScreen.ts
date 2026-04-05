import { ALL_METHODS, type MethodName } from '#/types'
import { buildHeader, buildFooter } from '#/layout'

type SubmitCallback = (chain: MethodName[]) => void

export function mountQuizScreen(app: HTMLElement, rubyVersion: string, onSubmit: SubmitCallback): void {
  let chain: MethodName[] = []
  let submitting = false

  const render = (): void => {
    app.innerHTML = buildHTML(chain, rubyVersion, submitting)
    bindEvents()
  }

  const bindEvents = (): void => {
    // Method buttons — append to chain
    for (const m of ALL_METHODS) {
      app.querySelector<HTMLButtonElement>(`[data-method="${m}"]`)?.addEventListener('click', () => {
        if (!chain.includes(m) && !submitting) {
          chain = [...chain, m]
          render()
        }
      })
    }

    // Clear button
    app.querySelector('[data-action="clear"]')?.addEventListener('click', () => {
      if (!submitting) {
        chain = []
        render()
      }
    })

    // Remove individual item
    app.querySelectorAll<HTMLButtonElement>('[data-remove-index]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (submitting) return
        const idx = parseInt(btn.dataset['removeIndex']!, 10)
        chain = chain.filter((_, i) => i !== idx)
        render()
      })
    })

    // Submit button
    app.querySelector('[data-action="submit"]')?.addEventListener('click', () => {
      if (chain.length === 0 || submitting) return
      submitting = true
      render()
      onSubmit(chain)
    })

    // Drag & Drop reorder
    bindDragDrop(
      app,
      () => chain,
      (newChain) => {
        chain = newChain
        render()
      },
    )
  }

  render()
}

// ---------- Drag & Drop ----------

function bindDragDrop(app: HTMLElement, getChain: () => MethodName[], setChain: (c: MethodName[]) => void): void {
  const items = app.querySelectorAll<HTMLElement>('[data-chain-index]')
  let dragSrc: number | null = null

  items.forEach((item) => {
    const idx = parseInt(item.dataset['chainIndex']!, 10)

    item.addEventListener('dragstart', (e) => {
      dragSrc = idx
      e.dataTransfer!.effectAllowed = 'move'
      // Defer class to next tick so it shows after drag image is captured
      setTimeout(() => item.classList.add('drag-src'), 0)
    })

    item.addEventListener('dragend', () => {
      item.classList.remove('drag-src')
      dragSrc = null
      items.forEach((i) => i.classList.remove('drag-over'))
    })

    item.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer!.dropEffect = 'move'
      items.forEach((i) => i.classList.remove('drag-over'))
      if (dragSrc !== idx) item.classList.add('drag-over')
    })

    item.addEventListener('dragleave', (e) => {
      if (!item.contains(e.relatedTarget as Node | null)) {
        item.classList.remove('drag-over')
      }
    })

    item.addEventListener('drop', (e) => {
      e.preventDefault()
      items.forEach((i) => i.classList.remove('drag-over'))
      if (dragSrc === null || dragSrc === idx) return
      const next = [...getChain()]
      const [moved] = next.splice(dragSrc, 1)
      next.splice(idx, 0, moved!)
      setChain(next)
    })
  })
}

// ---------- HTML builders ----------

function buildHTML(chain: MethodName[], rubyVersion: string, submitting: boolean): string {
  return `
    ${buildHeader(rubyVersion)}
    <main class="max-w-2xl mx-auto px-4 py-8">
      ${buildTitleBlock()}
      ${buildPrescriptionCard(chain, submitting)}
    </main>
    ${buildFooter()}
  `
}

function buildTitleBlock(): string {
  return `
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-4" style="color: #00b9f0;">お  く  す  り</h1>
      <h2 class="inline-block text-lg font-medium text-white px-5 py-1.5 rounded-full mb-4 w-full" style="background: #00b9f0;">あなたの「Ruby力」を診断します</h2>
      <p class="text-sm text-gray-500 leading-relaxed">
        <code class="bg-gray-100 px-1 rounded text-sm">"Lincwell"</code>
        を起点に、<span class="underline decoration-2 underline-offset-2">最大の整数</span>を返すメソッドチェーンを処方してください。
      </p>
    </div>
  `
}

function buildPrescriptionCard(chain: MethodName[], submitting: boolean): string {
  return `
    <div class="bg-white border-2 rounded-xl shadow-md overflow-hidden" style="border-color: #00b9f0;">
      <div class="divide-y divide-[#00b9f0]/20">

        <!-- 患  者 -->
        <div class="flex items-start gap-4 px-5 py-4">
          <span class="text-xs font-bold text-gray-500 w-12 pt-1 shrink-0">患  者</span>
          <code class="bg-gray-100 px-3 py-1 rounded text-sm" style="font-family: var(--font-mono);">"Lincwell"</code>
        </div>

        <!-- 処  方 (method buttons) -->
        <div class="flex items-start gap-4 px-5 py-4">
          <span class="text-xs font-bold text-gray-500 w-12 pt-1 shrink-0">処  方</span>
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 flex-1">
            ${ALL_METHODS.map((m) => buildMethodButton(m, chain)).join('')}
          </div>
        </div>

        <!-- 用  法 -->
        <div class="flex items-start gap-4 px-5 py-4 text-xs text-gray-500">
          <span class="font-bold w-12 shrink-0">用  法</span>
          <span>上記メソッドをチェーンにて投与すること</span>
        </div>

        <!-- 用  量 -->
        <div class="flex items-start gap-4 px-5 py-4 text-xs text-gray-500">
          <span class="font-bold w-12 shrink-0">用  量</span>
          <span>各 1 回まで</span>
        </div>

        <!-- 処方内容 + Submit -->
        <div class="px-5 py-4 space-y-4">

        <!-- 処方内容 (2-column: order list + code preview) -->
        ${buildChainPanel(chain, submitting)}

        <!-- Submit -->
        <button data-action="submit"
          class="w-full py-3 rounded-lg text-white font-bold text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style="background: ${chain.length === 0 || submitting ? '#9ca3af' : '#00b9f0'};"
          ${chain.length === 0 || submitting ? 'disabled' : ''}>
          ${submitting ? '投与中...' : '投与する'}
        </button>
        </div><!-- /px-5 py-4 -->
      </div><!-- /divide-y -->
    </div><!-- /card -->
  `
}

function buildChainPanel(chain: MethodName[], submitting: boolean): string {
  const empty = chain.length === 0

  return `
    <div class="border border-[#00b9f0]/30 rounded-lg overflow-hidden">
      <!-- Panel header -->
      <div class="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-[#00b9f0]/30">
        <span class="text-xs font-bold text-gray-500">処方内容</span>
        <button data-action="clear"
          class="text-xs text-gray-400 hover:text-red-400 disabled:opacity-30 transition-colors"
          ${empty || submitting ? 'disabled' : ''}>
          クリア
        </button>
      </div>

      <!-- Two-column body -->
      <div class="flex divide-x divide-[#00b9f0]/20 min-h-28">
        <!-- Left: draggable order list -->
        <div class="w-1/2 p-3">
          <p class="text-xs text-gray-400 mb-2">投与順序</p>
          ${empty ? '<p class="text-xs text-gray-300 italic">← 処方を選択</p>' : chain.map((m, i) => buildChainItem(m, i, submitting)).join('')}
        </div>

        <!-- Right: code expression -->
        <div class="w-1/2 p-3">
          <p class="text-xs text-gray-400 mb-2">処方コード</p>
          <pre class="text-xs leading-relaxed" style="font-family: var(--font-mono);">${buildCodeLines(chain)}</pre>
        </div>
      </div>
    </div>
  `
}

function buildChainItem(m: MethodName, index: number, submitting: boolean): string {
  return `
    <div data-chain-index="${index}"
      draggable="${submitting ? 'false' : 'true'}"
      class="flex items-center gap-1.5 px-2 py-1.5 rounded mb-1 bg-white border border-[#00b9f0]/30 select-none transition-colors ${submitting ? 'opacity-50' : 'cursor-grab hover:border-[#00b9f0]'}">
      <span class="text-gray-300 text-xs shrink-0" aria-hidden="true">⠿</span>
      <span class="flex-1 text-xs text-gray-700 truncate" style="font-family: var(--font-mono);">.${m}</span>
      <button data-remove-index="${index}" draggable="false"
        class="text-gray-300 hover:text-red-400 transition-colors text-sm leading-none shrink-0 w-5 h-5 flex items-center justify-center rounded ${submitting ? 'pointer-events-none' : ''}"
        aria-label=".${m} を削除">
        ×
      </button>
    </div>
  `
}

function buildCodeLines(chain: MethodName[]): string {
  if (chain.length === 0) {
    return '<span class="text-gray-300">"Lincwell"._____</span>'
  }
  const lines = [`<span class="text-gray-600">"Lincwell"</span>`, ...chain.map((m) => `  <span style="color: #00b9f0;">.${m}</span>`)]
  return lines.join('\n')
}

function buildMethodButton(m: MethodName, chain: MethodName[]): string {
  const used = chain.includes(m)
  return `
    <button data-method="${m}"
      class="text-xs py-2 px-1 rounded border transition-all ${
        used
          ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed line-through'
          : 'bg-white border-gray-300 text-gray-700 hover:border-[#00b9f0] hover:text-[#00b9f0] active:scale-95'
      }"
      style="font-family: var(--font-mono);"
      ${used ? 'disabled' : ''}>
      .${m}
    </button>
  `
}
