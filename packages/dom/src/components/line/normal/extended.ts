import type { LineNormal } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { ConfigKeySet } from '@root/config'

import { ExtendedType } from '@music-lyric-kit/lyric'

import { applyClassName } from '@root/utils'

import Style from './style.module.scss'

export class ExtendedNode {
  private context: ComponentContext

  private info: LineNormal
  private content: HTMLDivElement

  constructor(context: ComponentContext, info: LineNormal) {
    this.context = context
    this.info = info
    this.content = document.createElement('div')

    this.updateConfig()
  }

  private buildClassName() {
    applyClassName(this.content, [Style.extended])
  }

  private buildContent() {
    const config = this.context.config.line.normal.extended

    this.content.replaceChildren()
    for (const item of this.info.content.extended) {
      if (!item.content?.trim()) {
        continue
      }
      switch (item.type) {
        case ExtendedType.Translate: {
          if (!config.translate.visible) {
            break
          }

          const element = document.createElement('div')
          element.innerText = item.content

          const className = [Style.translate, config.translate.className]
          applyClassName(element, className)

          this.content.appendChild(element)
          break
        }
        case ExtendedType.Roman: {
          if (!config.roman.visible) {
            break
          }

          const element = document.createElement('div')
          element.innerText = item.content

          const className = [Style.roman, config.roman.className]
          applyClassName(element, className)

          this.content.appendChild(element)
          break
        }
      }
    }
  }

  updateConfig(keys?: ConfigKeySet) {
    if (!keys) {
      this.buildClassName()
      this.buildContent()
      return
    }

    if (keys.has('line.normal.extended.translate') || keys.has('line.normal.extended.roman')) {
      this.buildContent()
    }
  }

  dispose() {
    this.content.replaceChildren()
    this.content.remove()
  }

  get element() {
    return this.content
  }
}
