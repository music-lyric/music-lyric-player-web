import type { Lyric } from '@music-lyric-kit/lyric'
import type { DomLyricPlayerConfig } from '@root/config'

import { applyClassName } from '@root/utils'

import styles from './index.module.scss'

export class PlainElement {
  private readonly dom: HTMLDivElement

  constructor(private readonly info: Lyric.LineNormal) {
    this.dom = document.createElement('div')
    this.updateConfig()
  }

  updateConfig(keys?: DomLyricPlayerConfig.RootKeySet) {
    if (!keys) {
      applyClassName(this.dom, [styles.plain])
      this.dom.innerText = this.info.original
    }
  }

  updateSize() {}

  updateActive(active: boolean) {}

  play(currentTime: number, isActive: boolean) {}

  pause(currentTime: number, isActive: boolean) {}

  reset(currentTime: number) {}

  dispose() {
    this.dom.replaceChildren()
  }

  get element() {
    return this.dom
  }
}
