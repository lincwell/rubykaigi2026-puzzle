import logoSvg from '#/images/logo.svg?raw'

const logo = logoSvg.replace(/class="[^"]*"/, 'style="height: 56px; width: auto;"')

export function buildHeader(rubyVersion: string): string {
  return `
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
        <span class="text-xs text-gray-500" style="font-family: var(--font-mono);">ruby ${rubyVersion !== '' ? rubyVersion : '...'}</span>
        <span class="text-xs text-gray-400">Ruby WASM</span>
      </div>
    </header>
  `
}

export function buildFooter(): string {
  return `
    <footer class="mt-12 py-6">
      <div class="max-w-2xl mx-auto px-4 flex flex-col items-center gap-6">
        ${logo}
        <p class="text-xs text-gray-400 text-center">※こちらのサイトは、実際の医薬品の服用や診断とは一切関係ありません。</p>
      </div>
    </footer>
  `
}
