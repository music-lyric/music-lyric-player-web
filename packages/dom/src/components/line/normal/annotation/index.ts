import type { ComponentContext } from '@root/components/context'
import type { DomLyricPlayerConfig } from '@root/config'

import { Lyric } from '@music-lyric-kit/lyric'

import { PlayerRole } from '@root/constants'

import { applyClassName, applyRole } from '@root/utils'

import styles from './index.module.scss'

export class AnnotationElement {
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
    applyClassName(this.content, [styles.annotation])
    applyRole(this.content, PlayerRole.line.normal.annotation.self)
  }

  private buildContent() {
    const config = this.context.config.line.normal.annotation
    this.content.replaceChildren()

    if (config.translate.visible) {
      const translate = this.info.annotation.translates?.[0]
      if (translate) {
        const element = document.createElement('div')
        element.innerText = translate.content

        applyClassName(element, [styles.translate])
        applyRole(element, PlayerRole.line.normal.annotation.translation)

        this.content.appendChild(element)
      }
    }

    if (config.roman.visible) {
      const roman = this.info.annotation.romans?.[0]
      if (roman) {
        const element = document.createElement('div')
        element.innerText = roman.content

        applyClassName(element, [styles.roman])
        applyRole(element, PlayerRole.line.normal.annotation.romanization)

        this.content.appendChild(element)
      }
    }
  }

  updateConfig(keys?: DomLyricPlayerConfig.RootKeySet) {
    if (!keys) {
      this.buildClassName()
      this.buildContent()
      return
    }

    if (keys.has('line.normal.annotation.translate') || keys.has('line.normal.annotation.roman')) {
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
