import type { Config } from '@root/config'
import type { ComponentContext } from '@root/components/context'

import { hasKeyContainingAny } from '@music-lyric-player/utils'

const WATCH_KEYS: Config.RootKeys[] = ['line', 'container.padding', 'container.fade', 'scroll.animation.easing']

export class Style {
  private readonly runtime: HTMLStyleElement
  private readonly embed: HTMLStyleElement

  constructor(
    private readonly context: ComponentContext,
    private readonly host: HTMLElement,
    private readonly scope: string,
  ) {
    this.embed = document.createElement('style')
    this.embed.id = 'lyric-player-style-embed'
    this.embed.textContent = globalThis?.__LYRIC_PLAYER_STYLE__ || ''
    this.host.appendChild(this.embed)

    this.runtime = document.createElement('style')
    this.runtime.id = 'lyric-player-style-runtime'
    this.host.appendChild(this.runtime)
  }

  private buildKey(key: string) {
    return `--lyric-player-${key}`
  }

  private buildItem(key: string, value: string) {
    return `${this.buildKey(key)}: ${value};`
  }

  private apply(targets: Record<string, string>) {
    const result = Object.entries(targets)
      .map(([key, value]) => this.buildItem(key, value))
      .join('\n')

    if (!result.trim()) {
      return
    }

    const target = `${this.scope} {\n${result}\n}`

    this.runtime.textContent = target
  }

  private buildNormalLineValue(fallbackType: string | undefined, value: string | number | undefined, suffix: string, unit: string = '') {
    if (value === void 0 || value === null || value === '') {
      if (!fallbackType) {
        return ''
      }
      return `var(${this.buildKey(`line-${fallbackType}-${suffix}`)})`
    }
    return `${value}${unit}`
  }
  private buildNormalLineConfig(type: string, config: Config.Line.Normal.Base | undefined, fallbackType?: string) {
    if (!config) {
      return {}
    }
    const block: Record<string, string> = {
      [`line-${type}-color`]: this.buildNormalLineValue(fallbackType, config.style?.normal?.color, 'color'),
      [`line-${type}-opacity`]: this.buildNormalLineValue(fallbackType, config.style?.normal?.opacity, 'opacity'),
      [`line-${type}-active-color`]: this.buildNormalLineValue(fallbackType, config.style?.active?.color, 'active-color'),
      [`line-${type}-active-opacity`]: this.buildNormalLineValue(fallbackType, config.style?.active?.opacity, 'active-opacity'),
      [`line-${type}-played-color`]: this.buildNormalLineValue(fallbackType, config.style?.played?.color, 'played-color'),
      [`line-${type}-played-opacity`]: this.buildNormalLineValue(fallbackType, config.style?.played?.opacity, 'played-opacity'),
      [`line-${type}-font-size`]: this.buildNormalLineValue(fallbackType, config.font?.size, 'font-size', 'px'),
      [`line-${type}-font-family`]: this.buildNormalLineValue(fallbackType, config.font?.family, 'font-family'),
      [`line-${type}-font-weight`]: this.buildNormalLineValue(fallbackType, config.font?.weight, 'font-weight'),
    }
    return Object.fromEntries(Object.entries(block).filter(([_, v]) => v !== ''))
  }

  private buildInterludeConfig(config: Config.Line.Interlude.Root) {
    if (!config) {
      return {}
    }
    const getValue = (val: string | number | undefined, unit: string = '') => {
      return val === void 0 || val === null || val === '' ? '' : `${val}${unit}`
    }
    const block: Record<string, string> = {
      'line-interlude-size': getValue(config.size, 'px'),
      'line-interlude-color': getValue(config.style?.normal?.color),
      'line-interlude-opacity': getValue(config.style?.normal?.opacity),
      'line-interlude-active-color': getValue(config.style?.active?.color),
      'line-interlude-active-opacity': getValue(config.style?.active?.opacity),
    }
    return Object.fromEntries(Object.entries(block).filter(([_, v]) => v !== ''))
  }

  updateConfig(keys?: Config.RootKeySet) {
    if (keys && !hasKeyContainingAny(keys, WATCH_KEYS)) {
      return
    }

    const scroll = this.context.config.scroll
    const line = this.context.config.line

    const result = {
      // line
      ...this.buildNormalLineConfig('normal-base', line.normal.base),
      ...this.buildNormalLineConfig('normal-syllable', line.normal.syllable, 'normal-base'),
      ...this.buildNormalLineConfig('normal-extended-base', line.normal.extended.base, 'normal-base'),
      ...this.buildNormalLineConfig('normal-extended-translate', line.normal.extended.translate, 'normal-extended-base'),
      ...this.buildNormalLineConfig('normal-extended-roman', line.normal.extended.roman, 'normal-extended-base'),
      // interlude
      ...this.buildInterludeConfig(line.interlude),
      // container
      'container-padding': `${this.context.config.container.padding}`,
      'container-fade-top': `${this.context.config.container.fade.top}`,
      'container-fade-bottom': `${this.context.config.container.fade.bottom}`,
      // scroll
      'scroll-easing': scroll.animation?.easing,
    }

    this.apply(result)
  }

  destroy() {
    this.runtime.remove()
    this.embed.remove()
  }
}
