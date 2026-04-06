import type { LineNormal } from '@music-lyric-kit/lyric'

import { ExtendedType } from '@music-lyric-kit/lyric'
import { Context } from '@root/context'

import Style from './style.module.scss'
import { applyClassName } from '@root/utils'

export interface ExtendedParams {
  context: Context
  info: LineNormal
}

export class Extended {
  private context: Context

  private current: {
    info: LineNormal
    element: HTMLDivElement
  }

  constructor({ context, info }: ExtendedParams) {
    this.context = context

    this.current = {
      info,
      element: document.createElement('div'),
    }

    const classNames = [Style.extended, context.config.style.className.line.normal.extended]
    applyClassName(this.current.element, classNames)

    this.handleInit()
  }

  private handleInit() {
    const config = this.context.config.line.normal.extended

    for (const item of this.current.info.content.extended) {
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
          this.current.element.appendChild(element)
          break
        }
        case ExtendedType.Roman: {
          if (!config.roman) {
            break
          }
          const element = document.createElement('div')
          element.innerText = item.content
          element.classList.add(Style.roman)
          this.current.element.appendChild(element)
          break
        }
      }
    }
  }

  get element() {
    return this.current.element
  }
}
