import type { LineNormal } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { Config } from '@root/config'

import { WordType } from '@music-lyric-kit/lyric'
import { WordElement } from './word'

import { applyClassName } from '@root/utils'

import styles from './index.module.scss'

export class MainElement {
  private readonly dom: HTMLDivElement

  private readonly wordFadeWidth = 0.5
  private words: WordElement[]

  constructor(
    private readonly context: ComponentContext,
    private readonly info: LineNormal,
  ) {
    this.dom = document.createElement('div')
    this.words = []

    this.updateConfig()
  }

  private updateMaskInfo() {
    const lineDuration = this.info.time.duration
    if (lineDuration <= 0) {
      return
    }

    const wordCount = this.words.length
    if (!wordCount) {
      return
    }

    const config = this.context.config.line.normal.syllable.animation.mask
    if (!config.enabled) {
      for (let index = 0; index < wordCount; index++) {
        const word = this.words[index]
        if (!word) {
          continue
        }
        word.animtion.mask.updateInfo('', '')
      }
      return
    }

    const invLineDuration = 1 / lineDuration

    const wordStartTimes = new Float64Array(wordCount)
    const wordDurations = new Float64Array(wordCount)
    const wordWidths = new Float64Array(wordCount)
    const wordFrontWidths = new Float64Array(wordCount + 1)

    const lineStart = this.info.time.start
    for (let i = 0; i < wordCount; i++) {
      const word = this.words[i]
      wordStartTimes[i] = word.info.time.start - lineStart
      wordDurations[i] = word.info.time.duration
      wordWidths[i] = word.width
      wordFrontWidths[i + 1] = wordFrontWidths[i] + word.width
    }

    for (let index = 0; index < wordCount; index++) {
      const wordWidth = wordWidths[index]
      if (wordWidth <= 0) {
        continue
      }

      const word = this.words[index]
      if (!word) {
        continue
      }

      const widthFade = word.height * this.wordFadeWidth
      const widthFront = wordFrontWidths[index] + widthFade

      const widthRatio = widthFade / wordWidth
      const widthSize = 2 + widthRatio
      const widthInTotal = widthRatio / widthSize
      const leftPos = (1 - widthInTotal) / 2

      const maskImage = `linear-gradient(to right, rgba(0, 0, 0, 1) ${leftPos * 100}%, rgba(0, 0, 0, 0.4) ${(leftPos + widthInTotal) * 100}%)`
      const maskSize = `${widthSize * 100}% 100%`

      // min mask position
      const positionMin = -(wordWidth + widthFade)
      const positionClamp = (v: number) => (v < positionMin ? positionMin : v > 0 ? 0 : v)

      // mask postion
      let cursor = -widthFront - wordWidth - widthFade
      // normalised progress
      let progress = 0
      // prev
      let prevCursor = cursor
      let prevProgress = 0

      // include a init frame
      const frames: Keyframe[] = [{ offset: 0, maskPosition: `${positionClamp(cursor)}px 0` }]

      let offset = 0
      for (let i = 0; i < wordCount; i++) {
        // pause
        const gap = wordStartTimes[i] - offset
        if (gap > 0) {
          progress += gap * invLineDuration
          prevProgress = progress > 1 ? 1 : progress < 0 ? 0 : progress
          frames.push({ offset: prevProgress, maskPosition: `${positionClamp(cursor)}px 0` })
        }
        offset = wordStartTimes[i]

        // move
        const duration = wordDurations[i]
        progress += duration * invLineDuration
        cursor += wordWidths[i]

        //  first word
        if (i === 0) {
          cursor += widthFade * 1.5
        }
        // end word
        if (i === wordCount - 1) {
          cursor += widthFade * 0.5
        }

        if (duration > 0) {
          const target = progress > 1 ? 1 : progress < 0 ? 0 : progress
          const dt = target - prevProgress
          const dx = cursor - prevCursor

          if (dx !== 0 && dt > 0) {
            const rate = dt / dx
            // visible range
            if (prevCursor < positionMin && cursor > positionMin) {
              frames.push({
                offset: prevProgress + (positionMin - prevCursor) * rate,
                maskPosition: `${positionMin}px 0`,
              })
            }
            // full range
            if (prevCursor < 0 && cursor > 0) {
              frames.push({
                offset: prevProgress - prevCursor * rate,
                maskPosition: '0px 0',
              })
            }
          }

          prevCursor = cursor
          prevProgress = target

          frames.push({ offset: target, maskPosition: `${positionClamp(cursor)}px 0` })
        } else {
          // no duration word, skip build frame
          prevCursor = cursor
        }

        offset += duration
      }

      const animation = word.element.animate(frames, {
        duration: lineDuration || 1,
        fill: 'both',
      })
      animation.pause()

      word.animtion.mask.updateInfo(maskImage, maskSize, animation)
    }
  }

  private init() {
    this.clear()

    let pending = false
    for (const item of this.info.content.words) {
      switch (item.type) {
        case WordType.Normal: {
          const node = new WordElement(this.context, item, this.info)

          if (pending) {
            node.element.classList.add(styles.spaceStart)
            pending = false
          }

          this.words.push(node)
          break
        }
        case WordType.Space: {
          const prev = this.words[this.words.length - 1]
          if (prev) {
            prev.element.classList.add(styles.spaceEnd)
          }
          pending = true
          break
        }
      }
    }

    for (const word of this.words) {
      this.dom.appendChild(word.element)
    }

    this.updateSize()
  }

  private clear() {
    for (const word of this.words) {
      word.dispose()
    }
    this.words = []
    this.dom.replaceChildren()
  }

  updateConfig(keys?: Config.RootKeySet) {
    if (!keys) {
      applyClassName(this.dom, [styles.syllable])
      this.init()
      return
    }

    if (keys.has('line.normal.syllable.animation.float')) {
      for (const word of this.words) {
        word.updateConfig(keys)
      }
    }

    if (keys.has('line.normal.syllable.animation.mask')) {
      this.updateMaskInfo()
    }
  }

  updateSize() {
    for (const word of this.words) {
      word.updateSize()
    }
    this.updateMaskInfo()
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

  reset() {
    for (const word of this.words) {
      word.updateStyle(false, false, 0, 0)
    }
  }

  dispose() {
    this.clear()
  }

  get element() {
    return this.dom
  }
}
