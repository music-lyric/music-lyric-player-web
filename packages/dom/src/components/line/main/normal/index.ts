import type { LineNormal } from '@music-lyric-kit/lyric'
import type { Context } from '@root/context'

import { Main } from './main'
import { Extended } from './extended'

import { applyClassName } from '@root/utils'

import Style from './style.module.scss'

export interface NormalLineParams {
  context: Context
  info: LineNormal
}

export class NormalLine {
  private context: Context

  private main: Main | null = null
  private extended: Extended | null = null

  private current: {
    info: LineNormal
    element: HTMLDivElement
  }

  constructor({ context, info }: NormalLineParams) {
    this.context = context
    this.current = {
      info,
      element: document.createElement('div'),
    }

    const classNames = [Style.normal, context.config.style.className.line.normal.wrapper]
    applyClassName(this.current.element, classNames)

    this.handleInit()
  }

  private handleInit() {
    this.current.element.replaceChildren()

    this.main = new Main({
      context: this.context,
      info: this.current.info,
    })
    this.current.element.appendChild(this.main.element)

    this.extended = new Extended({
      context: this.context,
      info: this.current.info,
    })
    this.current.element.appendChild(this.extended.element)
  }

  play(time: number) {
    this.main?.play(time, true)
  }

  pause(time: number) {
    this.main?.pause(time, true)
  }

  reset() {
    this.main?.reset()
  }

  get element() {
    return this.current.element
  }
}
