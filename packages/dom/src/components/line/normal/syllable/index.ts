import type { LineNormal } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { DomLyricPlayerConfig } from '@root/config'
import type { MaskGenerateInput } from './animation'

import { WordType } from '@music-lyric-kit/lyric'
import { WordElement } from './word'
import { MaskAnimationHost } from './animation'

import { applyClassName } from '@root/utils'

import styles from './index.module.scss'

export class SyllableElement {
  private readonly dom: HTMLDivElement
  private readonly maskHost: MaskAnimationHost

  private words: WordElement[]

  constructor(
    private readonly context: ComponentContext,
    private readonly info: LineNormal,
  ) {
    this.dom = document.createElement('div')

    let wordCount = 0
    for (const item of info.content.words) {
      if (item.type === WordType.Normal) wordCount++
    }
    this.maskHost = new MaskAnimationHost(context, info, wordCount)

    this.words = []

    this.updateConfig()
  }

  private updateMaskWord = (index: number, image: string, size: string, frames?: Keyframe[]) => {
    this.words[index]?.animtion.mask.updateInfo(image, size, frames)
  }

  private updateMaskInfo() {
    const count = this.words.length
    if (!count) {
      return
    }

    const inputs: MaskGenerateInput[] = new Array(count)
    for (let i = 0; i < count; i++) {
      const word = this.words[i]
      inputs[i] = {
        info: word.info,
        width: word.width,
        height: word.height,
      }
    }

    this.maskHost.generate(inputs, this.updateMaskWord)
  }

  private init() {
    this.clear()

    let isInSpace = false
    const frag = document.createDocumentFragment()
    for (const item of this.info.content.words) {
      switch (item.type) {
        case WordType.Normal: {
          const node = new WordElement(this.context, item, this.info)

          if (isInSpace) {
            node.element.classList.add(styles.spaceStart)
            isInSpace = false
          }

          this.words.push(node)
          frag.appendChild(node.element)
          break
        }
        case WordType.Space: {
          const prev = this.words[this.words.length - 1]
          if (prev) {
            prev.element.classList.add(styles.spaceEnd)
          }
          isInSpace = true
          break
        }
      }
    }

    this.dom.appendChild(frag)
  }

  private clear() {
    for (const word of this.words) {
      word.dispose()
    }
    this.words = []
    this.dom.replaceChildren()
  }

  updateConfig(keys?: DomLyricPlayerConfig.RootKeySet) {
    if (!keys) {
      applyClassName(this.dom, [styles.syllable])
      this.init()
      return
    }

    if (keys.has('line.normal.syllable.animation.mask')) {
      this.updateMaskInfo()
    }

    if (keys.has('line.normal.syllable.animation.float') || keys.has('line.normal.syllable.animation.emphasize')) {
      for (const word of this.words) {
        word.updateConfig(keys)
      }
    }
  }

  updateSize() {
    for (const word of this.words) {
      word.updateSize()
    }
    this.updateMaskInfo()
  }

  updateActive(active: boolean) {
    for (const word of this.words) {
      word.updateActive(active)
    }
  }

  play(currentTime: number, isActive: boolean) {
    const relativeTime = currentTime - this.info.time.start
    for (const word of this.words) {
      word.updateStyle(true, isActive, currentTime, relativeTime)
    }
  }

  pause(currentTime: number, isActive: boolean) {
    const relativeTime = currentTime - this.info.time.start
    for (const word of this.words) {
      word.updateStyle(false, isActive, currentTime, relativeTime)
    }
  }

  reset(currentTime: number) {
    const relativeTime = currentTime - this.info.time.start
    for (const word of this.words) {
      word.updateStyle(false, false, currentTime, relativeTime)
    }
  }

  dispose() {
    this.clear()
  }

  get element() {
    return this.dom
  }
}
