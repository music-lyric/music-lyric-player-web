import type { LineNormal } from '@music-lyric-kit/lyric'
import type { Context } from '@root/context'

import { LineElementWrapper, LineElementType } from '../wrapper'

import { MainContent } from './main'
import { ExtendedContent } from './extended'

import { applyClassName } from '@root/utils'

import Style from './style.module.scss'

export class LineElementNormal extends LineElementWrapper {
  override get type(): LineElementType {
    return LineElementType.Normal
  }

  private info: LineNormal
  private content: HTMLDivElement

  private main: MainContent | null = null
  private extended: ExtendedContent | null = null

  constructor(context: Context, line: LineNormal) {
    super(context)

    this.context = context

    this.info = line
    this.content = document.createElement('div')

    this.wrapper.appendChild(this.content)

    const classNames = [Style.normal, context.config.style.className.line.normal.wrapper]
    applyClassName(this.content, classNames)

    this.handleInit()
  }

  private handleInit() {
    this.content.replaceChildren()

    this.main = new MainContent(this.context, this.info)
    this.content.appendChild(this.main.element)

    this.extended = new ExtendedContent(this.context, this.info)
    this.content.appendChild(this.extended.element)
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
}
