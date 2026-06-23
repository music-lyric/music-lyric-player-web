import type { Lyric } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { DomLyricPlayerConfig } from '@root/config'

import { EmphasizeAnimation, FloatAnimation, MaskAnimation } from './animation'

import { applyClassName, applyRole, PlayerRole } from '@root/utils'

import styles from './index.module.scss'

export class WordElement {
  private readonly dom: HTMLDivElement
  private readonly size: { width: number; height: number }

  private chars: HTMLSpanElement[] = []

  public readonly animtion: {
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
    this.dom = document.createElement('div')
    this.size = { width: 0, height: 0 }
    this.animtion = {
      float: new FloatAnimation(this.dom, this.context, this.wordInfo, this.lineInfo),
      mask: new MaskAnimation(this.dom, this.context, this.wordInfo, this.lineInfo),
      emphasize: new EmphasizeAnimation(this.context, this.wordInfo, this.lineInfo, this.chars, this.isBackground),
    }

    if (this.animtion.emphasize.enable) {
      this.initChar()
    } else {
      this.initText()
    }

    this.updateConfig()
  }

  private initText() {
    this.chars.length = 0
    this.dom.replaceChildren()
    this.dom.style.removeProperty('--emphasize-padding-horizontal')
    this.dom.style.removeProperty('--emphasize-padding-vertical')
    this.dom.innerText = this.wordInfo.content
  }
  private initChar() {
    this.chars.length = 0
    this.dom.replaceChildren()

    const fragment = document.createDocumentFragment()
    for (const char of this.wordInfo.content) {
      const span = document.createElement('span')
      span.classList.add(styles.char)
      applyRole(span, PlayerRole.char)
      span.textContent = char
      fragment.appendChild(span)
      this.chars.push(span)
    }

    this.dom.appendChild(fragment)

    if (EmphasizeAnimation.PADDING_HORIZONTAL > 0) {
      this.dom.style.setProperty('--emphasize-padding-horizontal', `${EmphasizeAnimation.PADDING_HORIZONTAL}px`)
    }
    if (EmphasizeAnimation.PADDING_VERTICAL > 0) {
      this.dom.style.setProperty('--emphasize-padding-vertical', `${EmphasizeAnimation.PADDING_VERTICAL}px`)
    }
  }

  updateStyle(isPlay: boolean, isActive: boolean, currentTime: number, relativeTime: number) {
    this.animtion.float.updateStyle(isPlay, isActive, currentTime, relativeTime)
    this.animtion.mask.updateStyle(isPlay, isActive, currentTime, relativeTime)
    this.animtion.emphasize.updateStyle(isPlay, isActive, currentTime, relativeTime)
  }

  updateSize() {
    this.size.width = this.dom.clientWidth
    this.size.height = this.dom.clientHeight
  }

  updateConfig(keys?: DomLyricPlayerConfig.RootKeySet) {
    if (!keys) {
      applyClassName(this.dom, [styles.word])
      applyRole(this.dom, PlayerRole.word)
    }

    this.animtion.float.updateConfig(keys)
    this.animtion.mask.updateConfig(keys)

    if (keys && !keys.has('line.normal.syllable.animation.emphasize')) {
      return
    }

    const isInit = this.chars.length > 0
    const isEnable = this.animtion.emphasize.enable
    if (isInit && !isEnable) {
      this.initText()
    } else if (!isInit && isEnable) {
      this.initChar()
    }

    this.animtion.emphasize.updateConfig(keys)
  }

  updateActive(active: boolean) {
    this.animtion.float.updateActive(active)
    this.animtion.mask.updateActive(active)
    this.animtion.emphasize.updateActive(active)
  }

  dispose() {
    this.animtion.float.dispose()
    this.animtion.mask.dispose()
    this.animtion.emphasize.dispose()
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
    return this.dom
  }
}
