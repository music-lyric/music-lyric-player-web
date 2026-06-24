import type { Lyric } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { DomLyricPlayerConfig } from '@root/config'
import type { WordAnnotationBaseElement } from './annotation'

import { WordSlot } from '@root/config/line/normal/syllable'

import { EmphasizeAnimation, FloatAnimation, MaskAnimation } from './animation'
import { WORD_ANNOTATION_DESCRIPTORS } from './annotation'

import { PlayerRole } from '@root/constants'

import { applyClassName, applyRole, resolveWordSort } from '@root/utils'

import styles from './index.module.scss'

export class WordElement {
  // Outer cell hosts the mask + float and stacks the word with its annotation rows; the inner word holds the text / emphasize.
  private readonly cell: HTMLDivElement
  private readonly word: HTMLDivElement
  private annotations: Map<WordSlot, WordAnnotationBaseElement> = new Map()

  private readonly size: { width: number; height: number }

  private chars: HTMLSpanElement[] = []

  public readonly animation: {
    float: FloatAnimation
    mask: MaskAnimation
    emphasize: EmphasizeAnimation
  }

  constructor(
    private readonly context: ComponentContext,
    private readonly wordInfo: Lyric.WordNormal,
    private readonly lineInfo: Lyric.LineNormal,
    private readonly isBackground: boolean,
  ) {
    this.cell = document.createElement('div')
    this.word = document.createElement('div')
    this.size = { width: 0, height: 0 }
    this.animation = {
      // Float hosts on the word so it lifts alone; the per-word annotation rows stay put. Mask hosts on the cell so the wipe covers word + annotations together.
      float: new FloatAnimation(this.word, this.context, this.wordInfo, this.lineInfo),
      mask: new MaskAnimation(this.cell, this.context, this.wordInfo, this.lineInfo),
      emphasize: new EmphasizeAnimation(this.context, this.wordInfo, this.lineInfo, this.chars, this.isBackground),
    }

    if (this.animation.emphasize.enable) {
      this.initChar()
    } else {
      this.initText()
    }

    this.updateConfig()
  }

  private initText() {
    this.chars.length = 0
    this.word.replaceChildren()
    this.cell.style.removeProperty('--emphasize-padding-horizontal')
    this.cell.style.removeProperty('--emphasize-padding-vertical')
    this.word.innerText = this.wordInfo.content
  }
  private initChar() {
    this.chars.length = 0
    this.word.replaceChildren()

    const fragment = document.createDocumentFragment()
    for (const char of this.wordInfo.content) {
      const span = document.createElement('span')
      span.classList.add(styles.char)
      applyRole(span, PlayerRole.line.normal.text.word.char)
      span.textContent = char
      fragment.appendChild(span)
      this.chars.push(span)
    }

    this.word.appendChild(fragment)

    // The emphasize padding lives on the cell so the inner word inherits it and the cell's negative margin cancels it.
    if (EmphasizeAnimation.PADDING_HORIZONTAL > 0) {
      this.cell.style.setProperty('--emphasize-padding-horizontal', `${EmphasizeAnimation.PADDING_HORIZONTAL}px`)
    }
    if (EmphasizeAnimation.PADDING_VERTICAL > 0) {
      this.cell.style.setProperty('--emphasize-padding-vertical', `${EmphasizeAnimation.PADDING_VERTICAL}px`)
    }
  }

  /**
   * (Re)build the per-word annotation rows from the descriptors, dropping any the word does not carry.
   */
  private buildAnnotations() {
    this.disposeAnnotations()

    const syllable = this.context.config.line.normal.main.syllable
    for (const descriptor of WORD_ANNOTATION_DESCRIPTORS) {
      if (!descriptor.isEnabled(syllable)) {
        continue
      }
      const element = descriptor.create(this.wordInfo)
      if (!element.hasContent) {
        element.dispose()
        continue
      }
      this.annotations.set(descriptor.slot, element)
    }

    this.applyGap()
  }
  private disposeAnnotations() {
    for (const element of this.annotations.values()) {
      element.dispose()
    }
    this.annotations.clear()
  }

  /**
   * Reserve the configured horizontal gap from neighbouring words when this word carries annotation rows; flush otherwise.
   */
  private applyGap() {
    if (this.annotations.size > 0) {
      // Split across both sides so two adjacent spaced words sit the configured distance apart.
      const half = this.context.config.line.normal.main.syllable.annotation.gap / 2
      this.cell.style.setProperty('--word-gap', `${half}px`)
    } else {
      this.cell.style.removeProperty('--word-gap')
    }
  }

  /**
   * Order the cell's children — the word text and its present annotation rows — by the configured word sort.
   */
  private applyOrder() {
    const order = resolveWordSort(this.context.config.line.normal.main.syllable.sort)
    const nodes: HTMLElement[] = []
    for (const slot of order) {
      if (slot === WordSlot.Word) {
        nodes.push(this.word)
      } else {
        const element = this.annotations.get(slot)
        if (element) {
          nodes.push(element.element)
        }
      }
    }
    this.cell.replaceChildren(...nodes)

    // Align cells across the line by the word: an annotation row on top pins the word to the bottom, below pins it to the top.
    this.cell.style.verticalAlign = order[0] === WordSlot.Word ? 'top' : 'bottom'
  }

  updateStyle(isPlay: boolean, isActive: boolean, currentTime: number, relativeTime: number) {
    this.animation.float.updateStyle(isPlay, isActive, currentTime, relativeTime)
    this.animation.mask.updateStyle(isPlay, isActive, currentTime, relativeTime)
    this.animation.emphasize.updateStyle(isPlay, isActive, currentTime, relativeTime)
  }

  updateSize() {
    // Cell width feeds the wipe prefix sum; the word's own height feeds the mask feather.
    this.size.width = this.cell.clientWidth
    this.size.height = this.word.clientHeight
  }

  updateConfig(keys?: DomLyricPlayerConfig.RootKeySet) {
    if (!keys) {
      applyClassName(this.cell, [styles.wordCell])
      applyRole(this.cell, PlayerRole.line.normal.text.word.self)
      applyClassName(this.word, [styles.word])
    }

    this.animation.float.updateConfig(keys)
    this.animation.mask.updateConfig(keys)

    // Roman visibility / font / style rebuilds the rows; the sort only reorders them; the gap only re-spaces them.
    const annotationsChanged = !keys || keys.has('line.normal.main.syllable.annotation.roman')
    if (annotationsChanged) {
      this.buildAnnotations()
    } else if (keys.has('line.normal.main.syllable.annotation.gap')) {
      this.applyGap()
    }
    if (annotationsChanged || keys.has('line.normal.main.syllable.sort')) {
      this.applyOrder()
    }

    if (keys && !keys.has('line.normal.main.syllable.word.animation.emphasize')) {
      return
    }

    const isInit = this.chars.length > 0
    const isEnable = this.animation.emphasize.enable
    if (isInit && !isEnable) {
      this.initText()
    } else if (!isInit && isEnable) {
      this.initChar()
    }

    this.animation.emphasize.updateConfig(keys)
  }

  updateActive(active: boolean) {
    this.animation.float.updateActive(active)
    this.animation.mask.updateActive(active)
    this.animation.emphasize.updateActive(active)
  }

  dispose() {
    this.animation.float.dispose()
    this.animation.mask.dispose()
    this.animation.emphasize.dispose()
    this.disposeAnnotations()
  }

  get height() {
    return this.size.height
  }
  get width() {
    return this.size.width
  }

  get info() {
    return this.wordInfo
  }

  get element() {
    return this.cell
  }
}
