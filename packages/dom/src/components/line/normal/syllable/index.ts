import type { ComponentContext } from '@root/components/context'
import type { DomLyricPlayerConfig } from '@root/config'
import type { MaskGenerateInput } from './animation'

import { Lyric } from '@music-lyric-kit/lyric'
import { WordElement } from './word'
import { MaskAnimationHost } from './animation'

import { PlayerRole } from '@root/constants'

import { applyClassName, applyRole } from '@root/utils'

import styles from './index.module.scss'

export class SyllableElement {
  private readonly dom: HTMLDivElement
  private readonly maskHost: MaskAnimationHost

  private words: WordElement[]

  constructor(
    private readonly context: ComponentContext,
    private readonly info: Lyric.LineNormal,
    private readonly isBackground: boolean,
  ) {
    this.dom = document.createElement('div')

    let wordCount = 0
    for (const item of info.words) {
      if (item.type === Lyric.WordType.Normal) wordCount++
    }
    this.maskHost = new MaskAnimationHost(context, info, wordCount)

    this.words = []

    this.updateConfig()
  }

  private updateMaskWord = (index: number, image: string, size: string, frames?: Keyframe[]) => {
    this.words[index]?.animation.mask.updateInfo(image, size, frames)
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
    for (const item of this.info.words) {
      switch (item.type) {
        case Lyric.WordType.Normal: {
          const node = new WordElement(this.context, item, this.info, this.isBackground)

          if (isInSpace) {
            node.element.classList.add(styles.spaceStart)
            isInSpace = false
          }

          this.words.push(node)
          frag.appendChild(node.element)
          break
        }
        case Lyric.WordType.Space: {
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
      applyRole(this.dom, PlayerRole.line.normal.text.self)
      this.init()
      return
    }

    if (keys.has('line.normal.main.syllable.word.animation.mask')) {
      this.updateMaskInfo()
    }

    // Per-word changes go to each word; a roman toggle resizes cells, so the mask regenerates on the next scheduled measure.
    if (
      keys.has('line.normal.main.syllable.word.animation.float') ||
      keys.has('line.normal.main.syllable.word.animation.emphasize') ||
      keys.has('line.normal.main.syllable.roman') ||
      keys.has('line.normal.main.syllable.sort') ||
      keys.has('line.normal.main.syllable.gap')
    ) {
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
