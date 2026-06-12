import type { ComponentContext } from '@root/components/context'
import type { DomLyricPlayerConfig } from '@root/config'

import { Lyric } from '@music-lyric-kit/lyric'

import { applyClassName } from '@root/utils'

import styles from './index.module.scss'

export class ExtendedElement {
  private context: ComponentContext

  private info: Lyric.LineNormal
  private content: HTMLDivElement

  constructor(context: ComponentContext, info: Lyric.LineNormal) {
    this.context = context
    this.info = info
    this.content = document.createElement('div')

    this.updateConfig()
  }

  private buildClassName() {
    applyClassName(this.content, [styles.extended])
  }

  private buildContent() {
    const config = this.context.config.line.normal.extended

    this.content.replaceChildren()
    for (const item of this.info.content.extended) {
      if (!item.content?.trim()) {
        continue
      }
      switch (item.type) {
        case Lyric.ExtendedType.Translate: {
          if (!config.translate.visible) {
            break
          }

          const element = document.createElement('div')
          element.innerText = item.content

          const className = [styles.translate, config.translate.className]
          applyClassName(element, className)

          this.content.appendChild(element)
          break
        }
        case Lyric.ExtendedType.Roman: {
          if (!config.roman.visible) {
            break
          }

          const element = document.createElement('div')
          element.innerText = item.content

          const className = [styles.roman, config.roman.className]
          applyClassName(element, className)

          this.content.appendChild(element)
          break
        }
      }
    }
  }

  updateConfig(keys?: DomLyricPlayerConfig.RootKeySet) {
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
