import type { BaseLyricPlayer } from '@music-lyric-player/base'
import type { Root, LineElementStyle } from '@root/components'
import type { ConfigClient } from '@root/config'
import type { ScrollManager } from './scroll'
import type { LineManager } from './line'

import { ScrollAnimationConfig } from '@root/config'
import { LineElementType } from '@root/components'

const GAUSSIAN_SIGMA = 2.2

export interface TransitionResult {
  duration: number
  delay: number
}

export class LayoutManager {
  constructor(
    private readonly config: ConfigClient,
    private readonly player: BaseLyricPlayer,
    private readonly root: Root,
    private readonly lineManager: LineManager,
    private readonly scrollManager: ScrollManager,
  ) {}

  private gaussian(offset: number): number {
    return Math.exp(-(offset * offset) / (2 * GAUSSIAN_SIGMA * GAUSSIAN_SIGMA))
  }

  private calcScale(offset: number): number | undefined {
    const scaleConfig = this.config.current.effect.scale
    if (!scaleConfig.enabled) {
      return undefined
    }

    const min = Math.max(scaleConfig.min, 0)
    const max = Math.min(scaleConfig.max, 1)
    const gaussian = this.gaussian(offset)

    return parseFloat((min + (max - min) * gaussian).toFixed(2))
  }

  private calcBlur(offset: number): number {
    const blurConfig = this.config.current.effect.blur
    if (!blurConfig.enabled) {
      return 0
    }

    const min = Math.max(blurConfig.min, 0)
    const max = Math.min(blurConfig.max, 4.5)
    const gaussian = this.gaussian(offset)

    return parseFloat((min + (max - min) * (1 - gaussian)).toFixed(2))
  }

  private calcTransition(offset: number, played: boolean): TransitionResult {
    const animConfig = this.config.current.scroll.animation
    if (!animConfig) {
      return { duration: 0, delay: 0 }
    }

    const duration = Math.max(animConfig.duration ?? 0, 0)

    switch (animConfig.mode) {
      case ScrollAnimationConfig.Mode.Smooth: {
        return {
          duration,
          delay: Math.max(animConfig.delay ?? 0, 0),
        }
      }

      case ScrollAnimationConfig.Mode.Ripple: {
        const step = Math.max(animConfig.step ?? 20, 10)
        const range = Math.max(animConfig.range ?? 3, 1)
        const distance = Math.min(Math.abs(offset), range)
        const normalized = distance / range
        const eased = 1 - (1 - normalized) ** 2
        return {
          duration,
          delay: Math.round(eased * range * step),
        }
      }

      case ScrollAnimationConfig.Mode.Directional: {
        const step = Math.max(animConfig.step ?? 40, 10)
        const range = Math.max(animConfig.range ?? 5, 1)
        const distance = Math.min(Math.abs(offset), range)
        const normalized = distance / range

        if (played) {
          const eased = (1 - normalized) ** 2
          return { duration, delay: Math.round(eased * range * step) }
        } else {
          const eased = 1 - (1 - normalized) ** 2
          return { duration, delay: Math.round(eased * range * step) }
        }
      }
    }
  }

  update(isSeek = false) {
    const linNumFull = this.lineManager.elementSize
    if (!linNumFull || !this.player.currentInfo.lines.length) {
      return
    }

    const isInPlay = this.player.currentPlaying
    const isInScroll = this.scrollManager.current.scrolling

    const currentSpace = Math.max(0, this.config.current.layout.gap)
    const currentContainerHeight = Math.max(0, this.root.height)

    const activePercent = Math.min(Math.max(this.config.current.scroll.anchor, 0), 100)
    const activePosition = currentContainerHeight * (activePercent / 100)

    const activeLines: number[] = []
    const topPositions: number[] = new Array(linNumFull)

    for (let i = 0; i < linNumFull; i++) {
      const element = this.lineManager.queryElement(i)

      if (this.lineManager.isActiveElement(i, this.player.currentIndex)) {
        activeLines.push(i)
      }

      if (!element) {
        topPositions[i] = 0
        continue
      }

      if (i === 0) {
        topPositions[i] = 0
        continue
      }

      const lastTop = topPositions[i - 1]
      const lastElement = this.lineManager.queryElement(i - 1)
      const lastHeight = lastElement?.height ?? 0
      const baseTop = lastTop + lastHeight

      if (element.type === LineElementType.Normal && element.isBackground) {
        const isActiveLine = activeLines.includes(i)
        if (!isInScroll && !isActiveLine) {
          topPositions[i] = baseTop - element.height
        } else {
          topPositions[i] = baseTop + currentSpace * 0.2
        }
        continue
      }

      topPositions[i] = baseTop + currentSpace
    }

    if (!activeLines.length) {
      const firstIndexs = this.lineManager.queryElementIndexs(0) || [0]
      activeLines.push(...firstIndexs)
    }

    const firstActiveIdx = isInScroll ? (this.lineManager.queryElementIndexs(this.scrollManager.current.active)?.[0] ?? 0) : activeLines[0]

    const firstElement = this.lineManager.queryElement(firstActiveIdx)
    const firstElementHeight = firstElement?.height ?? 0

    const currentActiveOffset = topPositions[firstActiveIdx] + firstElementHeight / 2
    const currentOffset = activePosition - currentActiveOffset
    const currentTime = this.player.currentTime

    const activeIndex = activeLines[0] ?? 0

    for (let i = 0; i < linNumFull; i++) {
      const element = this.lineManager.queryElement(i)
      if (!element) {
        continue
      }

      const isPlayedLine = activeLines.length > 0 && i < activeLines[0]
      const isActiveLine = activeLines.includes(i)
      const isAlreadyActive = element.active

      element.active = isActiveLine
      element.played = isPlayedLine

      const indexOffset = i - activeIndex

      const style: LineElementStyle = {
        top: topPositions[i] + currentOffset,
      }

      if (isInScroll) {
        style.opacity = 1
        style.transitionDelay = 0
        style.transitionDuration = 200
      } else {
        const transition = this.calcTransition(indexOffset, isPlayedLine)
        style.transitionDuration = transition.duration
        if (!isActiveLine) {
          style.transitionDelay = transition.delay
          style.scale = this.calcScale(indexOffset)
          style.blur = this.calcBlur(indexOffset)
        }
      }

      element.updateStyle(style)

      if (!isActiveLine) {
        element.reset()
        continue
      }

      if (isSeek || !isAlreadyActive) {
        if (isInPlay) element.play(currentTime, true)
        else element.pause(currentTime, true)
      }
    }
  }
}
