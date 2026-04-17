import logoSvg from '#/images/logo.svg?raw'
import type { Lang } from '#/i18n'
import { t } from '#/i18n'

const logo = logoSvg.replace(/class="[^"]*"/, 'style="height: 56px; width: auto;"')

export function buildHeader(rubyVersion: string, lang: Lang): string {
  const base = import.meta.env.BASE_URL
  const jaHref = base
  const enHref = `${base}en/`

  return `
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
        <span class="text-xs text-gray-500" style="font-family: var(--font-mono);" data-ruby-version>ruby ${rubyVersion !== '' ? rubyVersion : '...'}</span>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 text-xs font-bold">
            <a href="${lang === 'en' ? jaHref : '#'}"
               class="${lang === 'ja' ? 'text-[#00b9f0]' : 'text-gray-400 hover:text-gray-700 transition-colors'}"
               ${lang === 'ja' ? 'aria-current="page"' : ''}>JA</a>
            <span class="text-gray-300">/</span>
            <a href="${lang === 'ja' ? enHref : '#'}"
               class="${lang === 'en' ? 'text-[#00b9f0]' : 'text-gray-400 hover:text-gray-700 transition-colors'}"
               ${lang === 'en' ? 'aria-current="page"' : ''}>EN</a>
          </div>
          <span class="text-xs text-gray-400">Ruby WASM</span>
        </div>
      </div>
    </header>
  `
}

export function buildFooter(lang: Lang): string {
  return `
    <footer class="mt-12 py-6 border-t border-gray-100">
      <div class="max-w-2xl mx-auto px-4 flex flex-col items-center gap-4">
        ${logo}
        <p class="text-xs text-gray-400 text-center">${t(lang, 'footerDisclaimer')}</p>
        <div class="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <a href="https://linc-well.com/security-policy/" target="_blank" rel="noopener noreferrer"
            class="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
            data-umami-event="outbound-security-policy-click"
            data-umami-event-url="https://linc-well.com/security-policy/">
            ${lang === 'ja' ? '情報セキュリティ方針' : 'Security Policy'}
          </a>
          <a href="https://linc-well.com/privacy-policy/" target="_blank" rel="noopener noreferrer"
            class="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
            data-umami-event="outbound-privacy-policy-click"
            data-umami-event-url="https://linc-well.com/privacy-policy/">
            ${lang === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}
          </a>
        </div>
        <p class="text-[10px] text-gray-300">©Linc' well inc.</p>
      </div>
    </footer>
  `
}
