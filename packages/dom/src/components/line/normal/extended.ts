import type { LineNormal } from '@music-lyric-kit/lyric'
import type { Context } from '@root/context'

import { ExtendedType } from '@music-lyric-kit/lyric'

import { applyClassName } from '@root/utils'

import Style from './style.module.scss'

export class ExtendedContent {
  private context: Context

  private info: LineNormal
  private content: HTMLDivElement

  constructor(context: Context, info: LineNormal) {
    this.context = context
    this.info = info
    this.content = document.createElement('div')

    const classNames = [Style.extended, context.config.style.className.line.normal.extended]
    applyClassName(this.content, classNames)

    this.handleInit()
  }

  private handleInit() {
    const config = this.context.config.line.normal.extended

    for (const item of this.info.content.extended) {
      if (!item.content?.trim()) {
        continue
      }
      switch (item.type) {
        case ExtendedType.Translate: {
          if (!config.translate) {
            break
          }
          const element = document.createElement('div')
          element.innerText = item.content
          element.classList.add(Style.translate)
          this.content.appendChild(element)
          break
        }
        case ExtendedType.Roman: {
          if (!config.roman) {
            break
          }
          const element = document.createElement('div')
          element.innerText = item.content
          element.classList.add(Style.roman)
          this.content.appendChild(element)
          break
        }
      }
    }
  }

  get element() {
    return this.content
  }
}
