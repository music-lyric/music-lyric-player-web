import type { Lyric } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { DomLyricPlayerConfig } from '@root/config'

import { BaseLineElement, LineElementType, type LineElementStyle } from '../base'
import { SyllableElement } from './syllable'
import { PlainElement } from './plain'
import { AnnotationElement } from './annotation'

import { applyClassName, buildLineVariableKey } from '@root/utils'

import styles from './index.module.scss'

const BACKGROUND_ENTER_DELAY_KEY = buildLineVariableKey('background', 'enter', 'delay')
const BACKGROUND_RETRACT_DELAY_KEY = buildLineVariableKey('background', 'retract', 'delay')

export class NormalLineElement extends BaseLineElement {
  override get type() {
    return LineElementType.Normal as const
  }

  private readonly content: Lyric.LineNormal

  private container: HTMLDivElement
  private main: SyllableElement | PlainElement | null = null
  private annotation: AnnotationElement | null = null

  private readonly backgroundEnable: boolean
  private readonly syllableEnable: boolean
  private backgroundEnterDelay: number = 0
  private backgroundRetractDelay: number = 0

  constructor(context: ComponentContext, info: Lyric.LineNormal, isBackground: boolean, isSyllable: boolean) {
    super(context)

    this.content = info
    this.backgroundEnable = isBackground
    this.syllableEnable = isSyllable

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
        style.setProperty(BACKGROUND_ENTER_DELAY_KEY, `${enter}ms`)
      } else {
        style.removeProperty(BACKGROUND_ENTER_DELAY_KEY)
      }
    }

    if (retract !== this.backgroundRetractDelay) {
      this.backgroundRetractDelay = retract
      if (retract) {
        style.setProperty(BACKGROUND_RETRACT_DELAY_KEY, `${retract}ms`)
      } else {
        style.removeProperty(BACKGROUND_RETRACT_DELAY_KEY)
      }
    }
  }

  private applyClassName() {
    const className = [styles.normal, this.context.config.line.normal.base.className, this.backgroundEnable ? styles.background : '']
    applyClassName(this.container, className)
  }

  // Syllable rendering needs both the lyric's syllable timing and the user toggle; otherwise fall back to plain text.
  private get useSyllable() {
    return this.syllableEnable && this.context.config.line.normal.syllable.enabled
  }

  private createMain() {
    return this.useSyllable ? new SyllableElement(this.context, this.content, this.backgroundEnable) : new PlainElement(this.content)
  }

  private buildSyllable() {
    this.removeSyllable()
    this.main = this.createMain()
    this.container.appendChild(this.main.element)
  }
  private removeSyllable() {
    this.main?.dispose()
    this.main = null
  }
  // Rebuild the body in place when the syllable toggle flips, keeping it ahead of the annotation block.
  private rebuildMain() {
    const previous = this.main?.element
    this.removeSyllable()
    previous?.remove()
    this.main = this.createMain()
    if (this.annotation) {
      this.container.insertBefore(this.main.element, this.annotation.element)
    } else {
      this.container.appendChild(this.main.element)
    }
  }

  private buildAnnotation() {
    this.removeAnnotation()
    this.annotation = new AnnotationElement(this.context, this.content)
    this.container.appendChild(this.annotation.element)
  }
  private removeAnnotation() {
    this.annotation?.dispose()
    this.annotation = null
  }
  private get needShowAnnotation() {
    return this.context.config.line.normal.annotation.visible
  }

  override updateConfig(keys?: DomLyricPlayerConfig.RootKeySet): void {
    super.updateConfig(keys)

    if (!keys) {
      this.container.replaceChildren()
      this.applyClassName()
      this.buildSyllable()
      if (this.needShowAnnotation) {
        this.buildAnnotation()
      } else {
        this.removeAnnotation()
      }
      return
    }

    if (keys.has('line.normal.base.className')) {
      this.applyClassName()
    }

    if (keys.has('line.normal.annotation.visible')) {
      if (this.needShowAnnotation && !this.annotation) {
        this.buildAnnotation()
      } else if (!this.needShowAnnotation && this.annotation) {
        this.removeAnnotation()
      }
    }

    if (keys.has('line.normal.syllable.enabled')) {
      this.rebuildMain()
    }

    this.main?.updateConfig(keys)
    this.annotation?.updateConfig(keys)
  }

  override updateSize(): void {
    super.updateSize()
    this.main?.updateSize()
  }

  override play(time: number, isActive: boolean) {
    this.main?.play(time, isActive)
  }

  override pause(time: number, isActive: boolean) {
    this.main?.pause(time, isActive)
  }

  override reset(time: number) {
    this.main?.reset(time)
  }

  override updateStyle(current: LineElementStyle) {
    super.updateStyle(current)
    this.main?.updateActive(this.animatable)
  }

  override destroy() {
    this.removeSyllable()
    this.removeAnnotation()
    super.destroy()
  }

  get info() {
    return this.content
  }

  get isBackground() {
    return this.backgroundEnable
  }
}
