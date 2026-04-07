import type { LineNormal } from '@music-lyric-kit/lyric'
import type { Context } from '@root/context'

import { applyClassName } from '@root/utils'

import Style from './style.module.scss'

export class MainContent {
  private context: Context

  private info: LineNormal
  private content: HTMLDivElement

  constructor(context: Context, info: LineNormal) {
    this.context = context
    this.info = info
    this.content = document.createElement('div')

    const classNames = [Style.original, this.context.config.style.className.line.normal.original]
    applyClassName(this.content, classNames)

    this.handleInit()
  }

  private handleInit() {
    this.content.innerText = this.info.content.original
  }

  play(currentTime: number, isActive: boolean) {}

  pause(currentTime: number, isActive: boolean) {}

  reset() {}

  get element() {
    return this.content
  }
}
