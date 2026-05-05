import type { LineNormal, WordNormal, Time } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { Config } from '@root/config'

import { applyClassName } from '@root/utils'

import styles from './index.module.scss'

class FloatAnimation {
  private animation: Animation | null = null

  constructor(
    private readonly host: HTMLDivElement,
    private readonly context: ComponentContext,
    private readonly wordInfo: WordNormal,
    private readonly lineInfo: LineNormal,
  ) {
    this.updateConfig()
  }

  private init() {
    const config = this.context.config.line.normal.syllable.animation.float
    if (!config.enabled) {
      this.animation?.cancel()
      this.animation = null
      return
    }

    const delay = this.wordInfo.time.start - this.lineInfo.time.start
    const duration = Math.max(1000, this.wordInfo.time.duration)

    this.animation = this.host.animate([{ transform: `translateY(${config.from ?? 0}px)` }, { transform: `translateY(${config.to ?? 2}px)` }], {
      delay,
      duration,
      fill: 'both',
      composite: 'add',
      easing: 'ease',
    })
    this.animation.pause()
  }

  updateStyle(isPlay: boolean, isActive: boolean, currentTime: number, relativeTime: number) {
    if (!this.animation) {
      return
    }

    if (!isActive) {
      if (this.animation.playbackRate !== -1) {
        this.animation.playbackRate = -1
        this.animation.play()
      }
      return
    }

    const isFinished = currentTime >= this.wordInfo.time.end
    if (isFinished && this.animation.playState === 'finished') {
      return
    }

    this.animation.playbackRate = 1
    this.animation.currentTime = relativeTime > 0 ? relativeTime : 0
    if (isPlay) {
      this.animation.play()
    } else {
      this.animation.pause()
    }
  }

  updateConfig(keys?: Config.RootKeySet) {
    if (!keys) {
      this.init()
      return
    }

    if (keys.has('line.normal.syllable.animation.float')) {
      this.init()
    }
  }

  dispose() {
    this.animation?.cancel()
  }
}

class MaskAnimation {
  private animation: Animation | null = null
  private delay: number = 0

  constructor(
    private readonly host: HTMLDivElement,
    private readonly context: ComponentContext,
    private readonly wordInfo: WordNormal,
    private readonly lineInfo: LineNormal,
  ) {}

  updateInfo(image: string, size: string, animation?: Animation) {
    const style = this.host.style
    style.maskImage = image
    style.maskSize = size

    this.dispose()
    if (animation) {
      this.animation = animation
      this.animation.pause()
    }
  }

  updateStyle(isPlay: boolean, isActive: boolean, currentTime: number, relativeTime: number) {
    if (!this.animation) {
      return
    }

    if (!isActive) {
      this.animation.currentTime = 0
      this.animation.finish()
      return
    }

    const delay = relativeTime < 0 ? -relativeTime : 0
    if (this.delay !== delay) {
      this.delay = delay
      this.animation.effect!.updateTiming({ delay })
    }

    const isFinished = currentTime >= this.wordInfo.time.end
    if (isFinished && this.animation.playState === 'finished') {
      return
    }

    this.animation.playbackRate = 1
    this.animation.currentTime = relativeTime < 0 ? 0 : relativeTime > this.lineInfo.time.duration ? this.lineInfo.time.duration : relativeTime
    if (isPlay) {
      this.animation.play()
    } else {
      this.animation.pause()
    }
  }

  updateConfig(keys?: Config.RootKeySet) {
    // pass
  }

  dispose() {
    this.animation?.cancel()
    this.animation = null
    this.delay = 0
  }
}

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
