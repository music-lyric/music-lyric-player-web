import type { LineNormal, WordNormal } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { Config } from '@root/config'

import { FloatAnimation, MaskAnimation } from './animation'

import { applyClassName } from '@root/utils'

import styles from './index.module.scss'

export class WordElement {
  private readonly dom: HTMLDivElement
  private readonly size: { width: number; height: number }

  public readonly animtion: {
    float: FloatAnimation
    mask: MaskAnimation
  }

  constructor(
    private readonly context: ComponentContext,
    private readonly wordInfo: WordNormal,
    private readonly lineInfo: LineNormal,
  ) {
    this.dom = document.createElement('div')
    this.dom.innerText = wordInfo.content
    this.size = { width: 0, height: 0 }

    this.animtion = {
      float: new FloatAnimation(this.dom, this.context, this.wordInfo, this.lineInfo),
      mask: new MaskAnimation(this.dom, this.context, this.wordInfo, this.lineInfo),
    }

    this.updateConfig()
  }

  updateStyle(isPlay: boolean, isActive: boolean, currentTime: number, relativeTime: number) {
    this.animtion.float.updateStyle(isPlay, isActive, currentTime, relativeTime)
    this.animtion.mask.updateStyle(isPlay, isActive, currentTime, relativeTime)
  }

  updateSize() {
    this.size.width = this.dom.clientWidth
    this.size.height = this.dom.clientHeight
  }

  updateConfig(keys?: Config.RootKeySet) {
    if (!keys) {
      applyClassName(this.dom, [styles.word])
    }

    this.animtion.float.updateConfig(keys)
    this.animtion.mask.updateConfig(keys)
  }

  dispose() {
    this.animtion.float.dispose()
    this.animtion.mask.dispose()
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
