import type { Lyric } from '@music-lyric-kit/lyric'

import { applyClassName, applyRole } from '@root/utils'

export abstract class WordAnnotationBaseElement {
  protected readonly content: HTMLDivElement
  private readonly text: string

  constructor(info: Lyric.WordNormal, role: string, style: string) {
    this.text = this.resolve(info) ?? ''

    this.content = document.createElement('div')
    this.content.innerText = this.text
    applyClassName(this.content, [style])
    applyRole(this.content, role)
  }

  protected abstract resolve(info: Lyric.WordNormal): string | undefined

  dispose() {
    this.content.remove()
  }

  get hasContent() {
    return this.text.length > 0
  }

  get element() {
    return this.content
  }
}
