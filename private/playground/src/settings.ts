import type { Config } from '@music-lyric-player/dom'
import type { DomLyricPlayer } from '@music-lyric-player/dom'

import { debounce, deepMerge } from './utils'
import { loadSettings, saveSettings } from './storage'

interface SettingsBinding {
  id: string
  type: 'number' | 'select' | 'toggle' | 'text'
  get: (config: Partial<Config>) => any
  apply: (value: any) => Partial<Config>
}

const createLineBindings = (prefix: string, getObj: (c: any) => any, setObj: (patch: any) => any): SettingsBinding[] => [
  {
    id: `s-${prefix}-font-size`,
    type: 'number',
    get: (c) => getObj(c)?.font?.size,
    apply: (v) => setObj({ font: { size: v } }),
  },
  {
    id: `s-${prefix}-font-weight`,
    type: 'number',
    get: (c) => getObj(c)?.font?.weight,
    apply: (v) => setObj({ font: { weight: v } }),
  },
  {
    id: `s-${prefix}-normal-color`,
    type: 'text',
    get: (c) => getObj(c)?.style?.normal?.color,
    apply: (v) => setObj({ style: { normal: { color: v } } }),
  },
  {
    id: `s-${prefix}-normal-opacity`,
    type: 'number',
    get: (c) => getObj(c)?.style?.normal?.opacity,
    apply: (v) => setObj({ style: { normal: { opacity: v } } }),
  },
  {
    id: `s-${prefix}-active-color`,
    type: 'text',
    get: (c) => getObj(c)?.style?.active?.color,
    apply: (v) => setObj({ style: { active: { color: v } } }),
  },
  {
    id: `s-${prefix}-active-opacity`,
    type: 'number',
    get: (c) => getObj(c)?.style?.active?.opacity,
    apply: (v) => setObj({ style: { active: { opacity: v } } }),
  },
  {
    id: `s-${prefix}-played-color`,
    type: 'text',
    get: (c) => getObj(c)?.style?.played?.color,
    apply: (v) => setObj({ style: { played: { color: v } } }),
  },
  {
    id: `s-${prefix}-played-opacity`,
    type: 'number',
    get: (c) => getObj(c)?.style?.played?.opacity,
    apply: (v) => setObj({ style: { played: { opacity: v } } }),
  },
]

const SETTINGS_BINDINGS: SettingsBinding[] = [
  // Layout
  {
    id: 's-layout-align',
    type: 'select',
    get: (c) => c.layout?.align ?? 'left',
    apply: (v) => ({ layout: { align: v } }),
  },
  {
    id: 's-layout-gap',
    type: 'number',
    get: (c) => c.layout?.gap ?? 30,
    apply: (v) => ({ layout: { gap: v } }),
  },

  // Scroll
  {
    id: 's-scroll-anchor',
    type: 'number',
    get: (c) => c.scroll?.anchor ?? 50,
    apply: (v) => ({ scroll: { anchor: v } }),
  },
  {
    id: 's-scroll-animation-mode',
    type: 'select',
    get: (c) => (c.scroll?.animation as any)?.mode ?? 'smooth',
    apply: (v) => ({ scroll: { animation: { mode: v } } }),
  },
  {
    id: 's-scroll-animation-duration',
    type: 'number',
    get: (c) => (c.scroll?.animation as any)?.duration ?? 500,
    // @ts-expect-error
    apply: (v) => ({ scroll: { animation: { duration: v } } }),
  },
  {
    id: 's-scroll-animation-easing',
    type: 'text',
    get: (c) => (c.scroll?.animation as any)?.easing ?? 'ease',
    // @ts-expect-error
    apply: (v) => ({ scroll: { animation: { easing: v } } }),
  },
  {
    id: 's-scroll-animation-delay',
    type: 'number',
    get: (c) => (c.scroll?.animation as any)?.delay ?? 0,
    // @ts-expect-error
    apply: (v) => ({ scroll: { animation: { delay: v } } }),
  },
  {
    id: 's-scroll-animation-range',
    type: 'number',
    get: (c) => (c.scroll?.animation as any)?.range ?? 5,
    // @ts-expect-error
    apply: (v) => ({ scroll: { animation: { range: v } } }),
  },
  {
    id: 's-scroll-animation-step',
    type: 'number',
    get: (c) => (c.scroll?.animation as any)?.step ?? 40,
    // @ts-expect-error
    apply: (v) => ({ scroll: { animation: { step: v } } }),
  },

  // Effect - Scale
  {
    id: 's-effect-scale-enabled',
    type: 'toggle',
    get: (c) => c.effect?.scale?.enabled ?? false,
    apply: (v) => ({ effect: { scale: { enabled: v } } }),
  },
  {
    id: 's-effect-scale-min',
    type: 'number',
    get: (c) => c.effect?.scale?.min ?? 0.65,
    apply: (v) => ({ effect: { scale: { min: v } } }),
  },
  {
    id: 's-effect-scale-max',
    type: 'number',
    get: (c) => c.effect?.scale?.max ?? 1,
    apply: (v) => ({ effect: { scale: { max: v } } }),
  },

  // Normal Line
  ...createLineBindings(
    'normal',
    (c) => c.line?.normal?.base,
    (v) => ({ line: { normal: { base: v } } }),
  ),

  // Syllable
  {
    id: 's-syllable-enabled',
    type: 'toggle',
    get: (c) => c.line?.normal?.syllable?.enabled ?? true,
    apply: (v) => ({ line: { normal: { syllable: { enabled: v } } } }),
  },
  ...createLineBindings(
    'syllable',
    (c) => c.line?.normal?.syllable,
    (v) => ({ line: { normal: { syllable: v } } }),
  ),

  // Extended Base
  {
    id: 's-extended-visible',
    type: 'toggle',
    get: (c) => c.line?.normal?.extended?.visible ?? true,
    apply: (v) => ({ line: { normal: { extended: { visible: v } } } }),
  },
  ...createLineBindings(
    'extended',
    (c) => c.line?.normal?.extended?.base,
    (v) => ({ line: { normal: { extended: { base: v } } } }),
  ),

  // Translation
  {
    id: 's-translate-visible',
    type: 'toggle',
    get: (c) => c.line?.normal?.extended?.translate?.visible ?? true,
    apply: (v) => ({ line: { normal: { extended: { translate: { visible: v } } } } }),
  },
  ...createLineBindings(
    'translate',
    (c) => c.line?.normal?.extended?.translate,
    (v) => ({ line: { normal: { extended: { translate: v } } } }),
  ),

  // Romanization
  {
    id: 's-roman-visible',
    type: 'toggle',
    get: (c) => c.line?.normal?.extended?.roman?.visible ?? false,
    apply: (v) => ({ line: { normal: { extended: { roman: { visible: v } } } } }),
  },
  ...createLineBindings(
    'roman',
    (c) => c.line?.normal?.extended?.roman,
    (v) => ({ line: { normal: { extended: { roman: v } } } }),
  ),

  // Interlude
  {
    id: 's-interlude-size',
    type: 'number',
    get: (c) => c.line?.interlude?.size ?? 16,
    apply: (v) => ({ line: { interlude: { size: v } } }),
  },
  {
    id: 's-interlude-normal-color',
    type: 'text',
    get: (c) => c.line?.interlude?.style?.normal?.color,
    apply: (v) => ({ line: { interlude: { style: { normal: { color: v } } } } }),
  },
  {
    id: 's-interlude-normal-opacity',
    type: 'number',
    get: (c) => c.line?.interlude?.style?.normal?.opacity,
    apply: (v) => ({ line: { interlude: { style: { normal: { opacity: v } } } } }),
  },
  {
    id: 's-interlude-active-color',
    type: 'text',
    get: (c) => c.line?.interlude?.style?.active?.color,
    apply: (v) => ({ line: { interlude: { style: { active: { color: v } } } } }),
  },
  {
    id: 's-interlude-active-opacity',
    type: 'number',
    get: (c) => c.line?.interlude?.style?.active?.opacity,
    apply: (v) => ({ line: { interlude: { style: { active: { opacity: v } } } } }),
  },
]

const initScrollAnimationVisibility = (savedSettings: Partial<Config>): void => {
  const modeSelect = document.getElementById('s-scroll-animation-mode') as HTMLSelectElement | null
  const delayRow = document.getElementById('scroll-anim-delay-row')
  const rangeRow = document.getElementById('scroll-anim-range-row')
  const stepRow = document.getElementById('scroll-anim-step-row')
  if (!modeSelect || !delayRow || !rangeRow || !stepRow) {
    return
  }

  const updateVisibility = (mode: string): void => {
    const isSmooth = mode === 'smooth'
    delayRow.style.display = isSmooth ? 'flex' : 'none'
    rangeRow.style.display = isSmooth ? 'none' : 'flex'
    stepRow.style.display = isSmooth ? 'none' : 'flex'
  }

  const currentMode = (savedSettings as any)?.scroll?.animation?.mode ?? 'smooth'
  updateVisibility(currentMode)

  modeSelect.addEventListener('change', () => {
    updateVisibility(modeSelect.value)
  })
}

export const initSettings = (dom: DomLyricPlayer, savedSettings: Partial<Config>): void => {
  const applyAndSave = debounce((patch: Partial<Config>) => {
    dom.config.update(patch)
    const current = loadSettings()
    deepMerge(current, patch)
    saveSettings(current)
  }, 300)

  for (const binding of SETTINGS_BINDINGS) {
    const el = document.getElementById(binding.id)
    if (!el) continue

    const currentValue = binding.get(savedSettings)

    switch (binding.type) {
      case 'number': {
        const input = el as HTMLInputElement
        input.value = currentValue !== undefined && currentValue !== null ? String(currentValue) : ''
        input.addEventListener('change', () => {
          const val = input.value === '' ? undefined : parseFloat(input.value)
          if (val === undefined || !Number.isNaN(val)) applyAndSave(binding.apply(val))
        })
        break
      }
      case 'select': {
        const select = el as HTMLSelectElement
        select.value = String(currentValue)
        select.addEventListener('change', () => {
          applyAndSave(binding.apply(select.value))
        })
        break
      }
      case 'toggle': {
        let active = Boolean(currentValue)
        el.classList.toggle('active', active)
        el.addEventListener('click', () => {
          active = !active
          el.classList.toggle('active', active)
          applyAndSave(binding.apply(active))
        })
        break
      }
      case 'text': {
        const input = el as HTMLInputElement
        input.value = currentValue ?? ''
        input.addEventListener('change', () => {
          applyAndSave(binding.apply(input.value === '' ? undefined : input.value))
        })
        break
      }
    }
  }

  initScrollAnimationVisibility(savedSettings)
}
