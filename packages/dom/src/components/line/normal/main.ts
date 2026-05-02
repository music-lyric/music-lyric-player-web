import type { LineNormal, WordNormal, Time } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { Config } from '@root/config'

import { WordType } from '@music-lyric-kit/lyric'

import { applyClassName } from '@root/utils'

import Style from './style.module.scss'

export class WordNode {
  private readonly dom: HTMLDivElement
  private readonly size: { width: number; height: number }

  private floatAnimation?: Animation
  private maskAnimation?: Animation

  private maskAnimationDelay = 0

  constructor(
    private readonly context: ComponentContext,
    private readonly wordInfo: WordNormal,
    private readonly lineTime: Time,
  ) {
    this.dom = document.createElement('div')
    this.dom.innerText = wordInfo.content
    this.size = { width: 0, height: 0 }

    this.updateConfig()
  }

  private buildFloatAnimation() {
    this.floatAnimation?.cancel()
    this.floatAnimation = undefined

    const config = this.context.config.line.normal.syllable.animation.float
    if (!config.enabled) {
      return
    }

    const delay = this.wordInfo.time.start - this.lineTime.start
    const duration = Math.max(1000, this.wordInfo.time.duration)

    this.floatAnimation = this.dom.animate([{ transform: `translateY(${config.from ?? 0}px)` }, { transform: `translateY(${config.to ?? 2}px)` }], {
      delay,
      duration,
      fill: 'both',
      composite: 'add',
      easing: 'ease',
    })
    this.floatAnimation.pause()
  }

  updateMaskStyle(image: string, size: string) {
    const style = this.dom.style
    style.maskImage = image
    style.maskSize = size
  }

  updateMaskAnimation(client?: Animation) {
    this.maskAnimation?.cancel()
    this.maskAnimation = client
    this.maskAnimation?.pause()
  }

  updateStyle(isPlay: boolean, isActive: boolean, currentTime: number, relativeTime: number, lineDuration: number) {
    if (!isActive) {
      if (this.floatAnimation && this.floatAnimation.playbackRate !== -1) {
        this.floatAnimation.playbackRate = -1
        this.floatAnimation.play()
      }
      if (this.maskAnimation) {
        this.maskAnimation.currentTime = 0
        this.maskAnimation.finish()
      }
      return
    }

    const isFinished = currentTime >= this.wordInfo.time.end
    if (this.floatAnimation) {
      if (isFinished && this.floatAnimation.playState === 'finished') {
        // skip
      } else {
        this.floatAnimation.playbackRate = 1
        this.floatAnimation.currentTime = relativeTime > 0 ? relativeTime : 0
        if (isPlay) {
          this.floatAnimation.play()
        } else {
          this.floatAnimation.pause()
        }
      }
    }

    if (this.maskAnimation) {
      const delay = relativeTime < 0 ? -relativeTime : 0
      if (this.maskAnimationDelay !== delay) {
        this.maskAnimationDelay = delay
        this.maskAnimation.effect!.updateTiming({ delay })
      }

      if (isFinished && this.maskAnimation.playState === 'finished') {
        // skip
      } else {
        this.maskAnimation.playbackRate = 1
        this.maskAnimation.currentTime = relativeTime < 0 ? 0 : relativeTime > lineDuration ? lineDuration : relativeTime
        if (isPlay) {
          this.maskAnimation.play()
        } else {
          this.maskAnimation.pause()
        }
      }
    }
  }

  updateSize() {
    this.size.width = this.dom.clientWidth
    this.size.height = this.dom.clientHeight
  }

  updateConfig(keys?: Config.RootKeySet) {
    if (!keys) {
      applyClassName(this.dom, [Style.word])
      this.buildFloatAnimation()
      return
    }

    if (keys.has('line.normal.syllable.animation.float')) {
      this.buildFloatAnimation()
    }
  }

  dispose() {
    this.floatAnimation?.cancel()
    this.maskAnimation?.cancel()
  }

  get height() {
    return this.size.height
  }

  get width() {
    return this.size.width
  }

  get info() {
    return this.wordInfo
  }

  get element() {
    return this.dom
  }
}

export class MainNode {
  private readonly dom: HTMLDivElement
  private words: WordNode[]

  private readonly wordFadeWidth = 0.5

  constructor(
    private readonly context: ComponentContext,
    private readonly info: LineNormal,
  ) {
    this.dom = document.createElement('div')
    this.words = []

    this.updateConfig()
  }

  private buildWords() {
    for (const word of this.words) {
      word.dispose()
    }
    this.dom.replaceChildren()
    this.words = []

    for (const item of this.info.content.words) {
      switch (item.type) {
        case WordType.Normal: {
          const node = new WordNode(this.context, item, this.info.time)
          this.words.push(node)
          this.dom.appendChild(node.element)
          break
        }
        case WordType.Space: {
          const node = document.createElement('div')
          applyClassName(node, [Style.space])
          this.dom.appendChild(node)
          break
        }
      }
    }

    this.updateSize()
  }

  updateConfig(keys?: Config.RootKeySet) {
    if (!keys) {
      applyClassName(this.dom, [Style.syllable])
      this.buildWords()
      return
    }

    if (keys.has('line.normal.syllable.animation.float')) {
      for (const word of this.words) {
        word.updateConfig(keys)
      }
    }

    if (keys.has('line.normal.syllable.animation.mask')) {
      this.updateMaskAnimations()
    }
  }

  updateSize() {
    requestAnimationFrame(() => {
      for (const word of this.words) {
        word.updateSize()
      }
      this.updateMaskAnimations()
    })
  }

  private updateMaskAnimations() {
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
        word.updateMaskStyle('', '')
        word.updateMaskAnimation()
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
      word.updateMaskStyle(maskImage, maskSize)

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
      word.updateMaskAnimation(animation)
    }
  }

  play(currentTime: number, isActive: boolean) {
    const relativeTime = currentTime - this.info.time.start
    for (const word of this.words) {
      word.updateStyle(true, isActive, currentTime, relativeTime, this.info.time.duration)
    }
  }

  pause(currentTime: number, isActive: boolean) {
    const relativeTime = currentTime - this.info.time.start
    for (const word of this.words) {
      word.updateStyle(false, isActive, currentTime, relativeTime, this.info.time.duration)
    }
  }

  reset() {
    for (const word of this.words) {
      word.updateStyle(false, false, 0, 0, this.info.time.duration)
    }
  }

  dispose() {
    for (const word of this.words) {
      word.dispose()
    }
    this.words = []
    this.dom.replaceChildren()
  }

  get element() {
    return this.dom
  }
}
