import { DefaultRubyVM } from '@ruby/wasm-wasi/dist/browser'
import rubyWasmUrl from '@ruby/4.0-wasm-wasi/dist/ruby.wasm?url'
import type { MethodName, QuizResult, StepResult } from '#/types'

type RubyVM = Awaited<ReturnType<typeof DefaultRubyVM>>['vm']

let vm: RubyVM | null = null
let _rubyVersion = ''

export async function initRuby(onProgress?: (msg: string) => void): Promise<string> {
  if (vm !== null) return _rubyVersion

  onProgress?.('Ruby 4.0 WASM をダウンロード中...')
  const response = await fetch(rubyWasmUrl)
  const buffer = await response.arrayBuffer()

  onProgress?.('コンパイル中...')
  const module = await WebAssembly.compile(buffer)

  onProgress?.('VM を起動中...')
  const { vm: rubyVM } = await DefaultRubyVM(module, { consolePrint: false })
  vm = rubyVM

  _rubyVersion = vm.eval('RUBY_VERSION').toString()
  return _rubyVersion
}

export function getRubyVersion(): string {
  return _rubyVersion
}

export async function runChain(chain: MethodName[]): Promise<QuizResult> {
  if (vm === null) throw new Error('Ruby VM not initialized')

  // Build Ruby code that walks the chain step by step, collecting results
  const stepBlocks = chain
    .map(
      (m) => `
unless $__failed
  begin
    $__obj = $__obj.${m}
    $__steps << {
      ok: true,
      cls: $__obj.class.to_s,
      preview: (begin; s = $__obj.inspect; s.length > 80 ? s[0, 80] + '...' : s; rescue; $__obj.class.to_s; end),
      is_int: $__obj.is_a?(Integer),
      int_val: $__obj.is_a?(Integer) ? $__obj.to_s : nil
    }
  rescue => e
    $__steps << { ok: false, msg: e.class.to_s + ': ' + e.message }
    $__failed = true
  end
end`,
    )
    .join('\n')

  const code = `
$__obj = "Lincwell"
$__steps = []
$__failed = false

$__steps << {
  ok: true,
  cls: $__obj.class.to_s,
  preview: $__obj.inspect,
  is_int: false,
  int_val: nil
}

${stepBlocks}
nil
`

  try {
    vm.eval(code)
  } catch (e) {
    return {
      chain,
      steps: [
        {
          label: '"Lincwell"',
          type: 'Error',
          valuePreview: '',
          isInteger: false,
          intValue: null,
          error: e instanceof Error ? e.message : String(e),
        },
      ],
      finalIntValue: null,
      errorStep: 0,
    }
  }

  const count = parseInt(vm.eval('$__steps.length.to_s').toString(), 10)
  const steps: StepResult[] = []
  let errorStep: number | null = null

  for (let i = 0; i < count; i++) {
    const label = i === 0 ? '"Lincwell"' : `.${chain[i - 1]!}`
    const ok = vm.eval(`$__steps[${i}][:ok].to_s`).toString() === 'true'

    if (!ok) {
      const msg = vm.eval(`$__steps[${i}][:msg]`).toString()
      steps.push({ label, type: 'Error', valuePreview: '', isInteger: false, intValue: null, error: msg })
      errorStep = i
      break
    }

    const type = vm.eval(`$__steps[${i}][:cls]`).toString()
    const preview = vm.eval(`$__steps[${i}][:preview]`).toString()
    const isInteger = vm.eval(`$__steps[${i}][:is_int].to_s`).toString() === 'true'
    let intValue: number | null = null
    if (isInteger) {
      intValue = parseInt(vm.eval(`$__steps[${i}][:int_val]`).toString(), 10)
    }

    steps.push({ label, type, valuePreview: preview, isInteger, intValue, error: null })
  }

  const lastStep = steps[steps.length - 1]
  const finalIntValue = lastStep?.isInteger === true ? (lastStep.intValue ?? null) : null

  return { chain, steps, finalIntValue, errorStep }
}
