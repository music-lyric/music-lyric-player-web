import type { ComponentContext } from '@root/components/context'
import type { LineElementStyle } from '../base'
import type { AnnotationBaseElement } from './annotation'

import { Lyric } from '@music-lyric-kit/lyric'
import { PlayerRole } from '@root/constants'
import { DomLyricPlayerConfig } from '@root/config'

import { BaseLineElement, LineElementType } from '../base'
import { SyllableElement } from './syllable'
import { PlainElement } from './plain'
import { ANNOTATION_DESCRIPTORS } from './annotation'

import { applyClassName, applyRole, buildLineVariableKey, resolveSort } from '@root/utils'

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
  private annotations: Map<DomLyricPlayerConfig.Line.Normal.LineSlot, AnnotationBaseElement> = new Map()

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
    applyRole(this.container, PlayerRole.line.normal.self)
    this.element.appendChild(this.container)

    // Heavy content (main + annotations) is built lazily by the content window via buildContent().
    this.contentBuilt = false

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
    const className = [styles.normal, this.backgroundEnable ? styles.background : '']
    applyClassName(this.container, className)
  }

  // Syllable rendering needs both the lyric's syllable timing and the configured mode; otherwise fall back to plain text.
  private get useSyllable() {
    return this.syllableEnable && this.context.config.line.normal.main.use === 'syllable'
  }

  private get usePerWordRoman() {
    if (!this.useSyllable || !this.context.config.line.normal.main.syllable.annotation.roman.visible) {
      return false
    }
    for (const word of this.content.words) {
      if (word.type === Lyric.WordType.Normal && (word.annotation?.romans?.[0]?.content?.length ?? 0) > 0) {
        return true
      }
    }
    return false
  }

  private createMain() {
    return this.useSyllable ? new SyllableElement(this.context, this.content, this.backgroundEnable) : new PlainElement(this.content)
  }
  private buildMain() {
    this.disposeMain()
    this.main = this.createMain()
  }
  private disposeMain() {
    // dispose only tears down internal state, so detach the node here to keep it out of the container before a rebuild.
    const previous = this.main?.element
    this.main?.dispose()
    this.main = null
    previous?.remove()
  }

  private get needShowAnnotation() {
    return this.context.config.line.normal.annotation.visible
  }
  private buildAnnotations() {
    this.disposeAnnotations()
    if (!this.needShowAnnotation) {
      return
    }
    const usePerWordRoman = this.usePerWordRoman
    const normal = this.context.config.line.normal
    for (const descriptor of ANNOTATION_DESCRIPTORS) {
      // The line-level roman row yields its slot to per-word romanization when that is active.
      if (descriptor.slot === DomLyricPlayerConfig.Line.Normal.LineSlot.AnnotationRoman && usePerWordRoman) {
        continue
      }
      if (!descriptor.isEnabled(normal.annotation)) {
        continue
      }
      const element = descriptor.create(this.content, descriptor.language(normal))
      // A line that simply has no such annotation contributes no row at all.
      if (!element.hasContent) {
        element.dispose()
        continue
      }
      this.annotations.set(descriptor.slot, element)
    }
  }
  private disposeAnnotations() {
    for (const element of this.annotations.values()) {
      element.dispose()
    }
    this.annotations.clear()
  }

  private resolveSlotElement(slot: DomLyricPlayerConfig.Line.Normal.LineSlot): HTMLElement | null {
    if (slot === DomLyricPlayerConfig.Line.Normal.LineSlot.Main) {
      return this.main?.element ?? null
    }
    return this.annotations.get(slot)?.element ?? null
  }

  // Re-append every present row in the configured order; `appendChild` moves existing nodes, so reordering never rebuilds them.
  private applyOrder() {
    for (const slot of resolveSort(this.context.config.line.normal.sort)) {
      const element = this.resolveSlotElement(slot)
      if (element) {
        this.container.appendChild(element)
      }
    }
  }

  override updateConfig(keys?: DomLyricPlayerConfig.RootKeySet): void {
    super.updateConfig(keys)

    if (!keys) {
      this.applyClassName()
      return
    }

    // Released lines carry no content; they rebuild fresh from the current config on the next buildContent().
    if (!this.built) {
      return
    }

    const syllableToggled = keys.has('line.normal.main.use')
    if (syllableToggled) {
      this.buildMain()
    }

    const romanChanged = keys.has('line.normal.main.syllable.annotation.roman')
    const annotationChanged =
      keys.has('line.normal.annotation.visible') ||
      keys.has('line.normal.annotation.translate') ||
      keys.has('line.normal.annotation.roman') ||
      keys.has('line.normal.base.language')

    // The line-level roman slot tracks the per-word-roman verdict, which shifts with the main mode and the per-word roman config.
    if (annotationChanged || syllableToggled || romanChanged) {
      this.buildAnnotations()
    }

    // Reorder whenever a slot was rebuilt or the sort itself changed.
    if (syllableToggled || annotationChanged || romanChanged || keys.has('line.normal.sort')) {
      this.applyOrder()
    }

    this.main?.updateConfig(keys)
  }

  override buildContent(): void {
    if (this.built) {
      return
    }
    this.contentBuilt = true

    this.buildMain()
    this.buildAnnotations()
    this.applyOrder()
  }

  override disposeContent(): void {
    if (!this.built) {
      return
    }
    // Keep the cached height (the absolute wrapper just goes empty) so layout positioning stays exact.
    this.disposeMain()
    this.disposeAnnotations()
    this.contentBuilt = false
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

  override updateStyle(current: LineElementStyle, immediate = false) {
    super.updateStyle(current, immediate)
    this.main?.updateActive(this.animatable)
  }

  override destroy() {
    this.disposeMain()
    this.disposeAnnotations()
    super.destroy()
  }

  get info() {
    return this.content
  }

  get isBackground() {
    return this.backgroundEnable
  }
}
