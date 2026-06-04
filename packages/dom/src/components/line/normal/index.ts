import type { LineNormal } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { DomLyricPlayerConfig } from '@root/config'

import { BaseLineElement, LineElementType, type LineElementStyle } from '../base'
import { SyllableElement } from './syllable'
import { ExtendedElement } from './extended'

import { applyClassName } from '@root/utils'

import styles from './index.module.scss'

export class NormalLineElement extends BaseLineElement {
  override get type() {
    return LineElementType.Normal as const
  }

  private readonly content: LineNormal

  private container: HTMLDivElement
  private syllable: SyllableElement | null = null
  private extended: ExtendedElement | null = null

  private readonly backgroundEnable: boolean
  private backgroundEnterDelay: number = 0
  private backgroundRetractDelay: number = 0

  constructor(context: ComponentContext, info: LineNormal, isBackground: boolean) {
    super(context)

    this.content = info
    this.backgroundEnable = isBackground

    this.container = document.createElement('div')
    this.element.appendChild(this.container)

    this.updateConfig()
  }

  updateBackgroundDelay(enter: number, retract: number) {
    if (!this.backgroundEnable) {
      return
    }

    const style = this.container.style

    if (enter !== this.backgroundEnterDelay) {
      this.backgroundEnterDelay = enter
      if (enter) {
        style.setProperty('--lyric-player-line-background-enter-delay', `${enter}ms`)
      } else {
        style.removeProperty('--lyric-player-line-background-enter-delay')
      }
    }

    if (retract !== this.backgroundRetractDelay) {
      this.backgroundRetractDelay = retract
      if (retract) {
        style.setProperty('--lyric-player-line-background-retract-delay', `${retract}ms`)
      } else {
        style.removeProperty('--lyric-player-line-background-retract-delay')
      }
    }
  }

  private applyClassName() {
    const className = [styles.normal, this.context.config.line.normal.base.className, this.backgroundEnable ? styles.background : '']
    applyClassName(this.container, className)
  }

  private buildSyllable() {
    this.removeSyllable()
    this.syllable = new SyllableElement(this.context, this.content)
    this.container.appendChild(this.syllable.element)
  }
  private removeSyllable() {
    this.syllable?.dispose()
    this.syllable = null
  }

  private buildExtended() {
    this.removeExtended()
    this.extended = new ExtendedElement(this.context, this.content)
    this.container.appendChild(this.extended.element)
  }
  private removeExtended() {
    this.extended?.dispose()
    this.extended = null
  }
  private get needShowExtended() {
    return this.content.content.extended.length > 0 && this.context.config.line.normal.extended.visible
  }

  override updateConfig(keys?: DomLyricPlayerConfig.RootKeySet): void {
    super.updateConfig(keys)

    if (!keys) {
      this.container.replaceChildren()
      this.applyClassName()
      this.buildSyllable()
      if (this.needShowExtended) {
        this.buildExtended()
      } else {
        this.removeExtended()
      }
      return
    }

    if (keys.has('line.normal.base.className')) {
      this.applyClassName()
    }

    if (keys.has('line.normal.extended.visible')) {
      if (this.needShowExtended && !this.extended) {
        this.buildExtended()
      } else if (!this.needShowExtended && this.extended) {
        this.removeExtended()
      }
    }

    this.syllable?.updateConfig(keys)
    this.extended?.updateConfig(keys)
  }

  override updateSize(): void {
    super.updateSize()
    this.syllable?.updateSize()
  }

  override play(time: number, isActive: boolean) {
    this.syllable?.play(time, isActive)
  }

  override pause(time: number, isActive: boolean) {
    this.syllable?.pause(time, isActive)
  }

  override reset(time: number) {
    this.syllable?.reset(time)
  }

  override updateStyle(current: LineElementStyle) {
    super.updateStyle(current)
    this.syllable?.updateActive(this.animated)
  }

  override destroy() {
    this.removeSyllable()
    this.removeExtended()
    super.destroy()
  }

  get info() {
    return this.content
  }

  get isBackground() {
    return this.backgroundEnable
  }
}
