import type { LineInterlude } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'

import { BaseLineElement, LineElementType } from '../wrapper'

import { applyClassName } from '@root/utils'

import Style from './style.module.scss'

const DOT_COUNT = 3

export class InterludeLineElement extends BaseLineElement {
  override get type() {
    return LineElementType.Interlude as const
  }

  private container: HTMLDivElement
  private dots: HTMLDivElement[]

  constructor(
    context: ComponentContext,
    private readonly info: LineInterlude,
  ) {
    super(context)

    this.container = document.createElement('div')
    this.wrapper.appendChild(this.container)

    this.dots = []

    this.init()
    this.updateConfig()
  }

  private init() {
    for (let i = 0; i < DOT_COUNT; i++) {
      const dot = document.createElement('div')
      applyClassName(dot, [Style.dot])
      this.dots.push(dot)
      this.container.appendChild(dot)
    }
  }

  private updateDotStyle(
    dot: { element: HTMLDivElement; time: number; duration: number },
    isPlay: boolean,
    isActive: boolean,
    currentTime: number,
  ): void {
    const dotStyle = dot.element.style

    if (!isActive) {
      dotStyle.transitionDuration = '200ms'
      dotStyle.transitionDelay = '0ms'
      dotStyle.opacity = ''
      return
    }

    if (!isPlay && dot.time + dot.duration - currentTime > 0) {
      dotStyle.transitionDuration = '0s'
      dotStyle.transitionDelay = '0ms'

      const opacity = Math.max(0.2 + (0.7 * (currentTime - dot.time)) / dot.duration, 0.2)
      dotStyle.opacity = opacity.toFixed(3)
      return
    }

    const duration1 = Math.round(dot.duration)
    const duration2 = Math.round(dot.duration + 150)
    const delay = Math.round(dot.time - currentTime)

    dotStyle.transitionDuration = `${duration1}ms, ${duration2}ms`
    dotStyle.transitionDelay = `${delay}ms`
    dotStyle.opacity = ''
  }

  private updateAllDotStyle(isPlay: boolean, isActive: boolean, currentTime: number) {
    const duration = Math.floor(this.info.time.duration / DOT_COUNT)
    for (let i = 0; i < DOT_COUNT; i++) {
      const element = this.dots[i]
      if (!element) {
        continue
      }
      this.updateDotStyle({ element, duration, time: this.info.time.start + duration * i }, isPlay, isActive, currentTime)
    }
  }

  override updateConfig() {
    super.updateConfig()
    applyClassName(this.container, [Style.interlude, this.context.config.line.interlude.className])
  }

  override play(time: number, isActive: boolean) {
    this.updateAllDotStyle(true, isActive, time)
  }

  override pause(time: number, isActive: boolean) {
    this.updateAllDotStyle(false, isActive, time)
  }

  override reset() {
    this.updateAllDotStyle(false, false, 0)
  }
}
