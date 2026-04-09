import { WordType, type LineNormal, type WordNormal } from '@music-lyric-kit/lyric'
import type { Context } from '@root/context'

import { applyClassName } from '@root/utils'

import Style from './style.module.scss'

export class WordNode {
  private readonly dom: HTMLDivElement

  constructor(
    private readonly context: Context,
    private readonly info: WordNormal,
  ) {
    this.dom = document.createElement('div')
    this.dom.innerText = info.content

    this.updateConfig()
  }

  updateConfig() {
    applyClassName(this.dom, [Style.word])
  }

  updateStyle(isPlay: boolean, isActive: boolean, currentTime: number) {
    const domStyle = this.dom.style

    if (!isActive) {
      domStyle.transitionDuration = '400ms'
      domStyle.transitionDelay = '0ms'
      domStyle.opacity = '0.4'
      domStyle.transform = 'translateY(0px)'
      return
    }

    const { start, duration } = this.info.time
    if (duration <= 0) {
      domStyle.transitionDuration = '0ms'
      domStyle.transitionDelay = '0ms'
      return
    }

    const raw = (currentTime - start) / duration
    const progress = Math.max(0, Math.min(raw, 1))

    if (!isPlay && progress < 1) {
      domStyle.transitionDuration = '0ms'
      domStyle.transitionDelay = '0ms'
      domStyle.opacity = (0.4 + 0.6 * progress).toFixed(2)
      domStyle.transform = `translateY(-${Math.round(progress * 2)}px)`
      return
    }

    const delayMs = Math.round(start - currentTime)
    const durationMs = Math.round(duration)

    domStyle.setProperty('transition-duration', `${durationMs}ms, ${durationMs + 150}ms`, 'important')
    domStyle.setProperty('transition-delay', `${delayMs}ms`, 'important')

    domStyle.opacity = '1'
    domStyle.transform = 'translateY(-2px)'
  }

  get element() {
    return this.dom
  }
}

export class MainNode {
  private readonly dom: HTMLDivElement
  private readonly words: WordNode[]

  constructor(
    private readonly context: Context,
    private readonly info: LineNormal,
  ) {
    this.dom = document.createElement('div')
    this.words = []
    this.init()
  }

  private init() {
    for (const item of this.info.content.words) {
      switch (item.type) {
        case WordType.Normal: {
          const node = new WordNode(this.context, item)
          this.words.push(node)
          this.dom.appendChild(node.element)
          break
        }
        case WordType.Space: {
          const node = document.createElement('div')
          applyClassName(node, [Style.space])
          this.dom.appendChild(node)
          break
        }
      }
    }
    applyClassName(this.dom, [Style.syllable, this.context.config.style.className.line.normal.syllable])
  }

  play(currentTime: number, isActive: boolean) {
    for (const item of this.words) {
      item.updateStyle(true, isActive, currentTime)
    }
  }

  pause(currentTime: number, isActive: boolean) {
    for (const item of this.words) {
      item.updateStyle(false, isActive, currentTime)
    }
  }

  reset() {
    for (const item of this.words) {
      item.updateStyle(false, false, 0)
    }
  }

  get element() {
    return this.dom
  }
}
