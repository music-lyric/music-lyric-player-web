import type { LineNormal } from '@music-lyric-kit/lyric'
import type { Context } from '@root/context'

import Style from './style.module.scss'
import { applyClassName } from '@root/utils'

export interface MainParams {
  context: Context
  info: LineNormal
}

export class Main {
  private context: Context

  private current: {
    info: LineNormal
    element: HTMLDivElement
  }

  constructor({ context, info }: MainParams) {
    this.context = context

    this.current = {
      info,
      element: document.createElement('div'),
    }

    const classNames = [Style.original, this.context.config.style.className.line.normal.original]
    applyClassName(this.current.element, classNames)

    this.handleInit()
  }

  private handleInit() {
    this.current.element.innerText = this.current.info.content.original
  }

  play(currentTime: number, isActive: boolean) {}

  pause(currentTime: number, isActive: boolean) {}

  reset() {}

  get element() {
    return this.current.element
  }
}
