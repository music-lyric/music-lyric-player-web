import type { InterludeLineConfig, NormalLineConfig } from '@root/config'

import { Context } from '@root/context'

import Styles from './style.module.scss'

export class Style {
  private readonly dom: HTMLStyleElement

  constructor(private readonly context: Context) {
    this.dom = document.createElement('style')
    this.dom.id = 'lyric-player-style'
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

    const target = `.${Styles.root} {\n${result}\n}`

    this.dom.textContent = target
  }

  private buildNormalLineValue(type: string, value: string | number | undefined, suffix: string, unit: string = '') {
    if (value === void 0 || value === null || value === '') {
      if (type === 'normal') {
        return ''
      }
      return `var(${this.buildKey(`line-normal-${suffix}`)})`
    }
    return `${value}${unit}`
  }
  private buildNormalLineConfig(type: string, config: NormalLineConfig.Common) {
    if (!config) {
      return {}
    }

    const block: Record<string, string> = {
      [`line-${type}-color`]: this.buildNormalLineValue(type, config.normalStyle?.color, 'color'),
      [`line-${type}-opacity`]: this.buildNormalLineValue(type, config.normalStyle?.opacity, 'opacity'),

      [`line-${type}-active-color`]: this.buildNormalLineValue(type, config.activeStyle?.color, 'active-color'),
      [`line-${type}-active-opacity`]: this.buildNormalLineValue(type, config.activeStyle?.opacity, 'active-opacity'),

      [`line-${type}-font-size`]: this.buildNormalLineValue(type, config.font?.size, 'font-size', 'px'),
      [`line-${type}-font-family`]: this.buildNormalLineValue(type, config.font?.family, 'font-family'),
      [`line-${type}-font-weight`]: this.buildNormalLineValue(type, config.font?.weight, 'font-weight'),
    }

    return Object.fromEntries(Object.entries(block).filter(([_, v]) => v !== ''))
  }

  private buildInterludeConfig(config: InterludeLineConfig) {
    if (!config) {
      return {}
    }

    const block: Record<string, string> = {
      'line-interlude-size': `${config.size}px`,

      'line-interlude-color': `${config.normalStyle?.color}`,
      'line-interlude-opacity': `${config.normalStyle?.opacity}`,

      'line-interlude-active-color': `${config.activeStyle?.color}`,
      'line-interlude-active-opacity': `${config.activeStyle?.opacity}`,
    }

    return Object.fromEntries(Object.entries(block).filter(([_, v]) => v !== ''))
  }

  updateConfig() {
    const line = this.context.config.line

    const result = {
      // line
      ...this.buildNormalLineConfig('normal', line.normal),
      ...this.buildNormalLineConfig('normal-syllable', line.normal.syllable),
      ...this.buildNormalLineConfig('normal-translate', line.normal.extended.translate),
      ...this.buildNormalLineConfig('normal-roman', line.normal.extended.roman),
      // interlude
      ...this.buildInterludeConfig(line.interlude),
    }

    this.apply(result)
  }

  get element() {
    return this.dom
  }
}
