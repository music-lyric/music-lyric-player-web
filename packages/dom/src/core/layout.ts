import type { LineElementStyle } from '@root/components'
import type { CoreContext } from './context'
import type { LineManager } from './line'

import { Scroll } from '@root/config'
import { LineElementType } from '@root/components'

const GAUSSIAN_SIGMA = 2.2

export interface TransitionResult {
  duration: number
  delay: number
}

export class LayoutManager {
  private previousLineIndex = -1

  constructor(
    private readonly context: CoreContext,
    private readonly lineManager: LineManager,
  ) {}

  private gaussian(offset: number): number {
    return Math.exp(-(offset * offset) / (2 * GAUSSIAN_SIGMA * GAUSSIAN_SIGMA))
  }

  private round(value: number, precision = 2): number {
    const factor = 10 ** precision
    return Math.round(value * factor) / factor
  }

  private calcScale(offset: number): number | undefined {
    const scaleConfig = this.context.config.current.effect.scale

    if (!scaleConfig.enabled) {
      return undefined
    }

    const min = Math.max(scaleConfig.min, 0)
    const max = Math.max(scaleConfig.max, min)
    const gaussian = this.gaussian(offset)

    return this.round(min + (max - min) * gaussian)
  }

  private calcBlur(offset: number): number {
    const blurConfig = this.context.config.current.effect.blur

    if (!blurConfig.enabled) {
      return 0
    }

    const min = Math.max(blurConfig.min, 0)
    const max = Math.max(blurConfig.max, min)
    const gaussian = this.gaussian(offset)

    return this.round(min + (max - min) * (1 - gaussian))
  }

  private calcTransition(offset: number, played: boolean, direction: number): TransitionResult {
    const config = this.context.config.current.scroll.animation

    if (!config) {
      return {
        duration: 0,
        delay: 0,
      }
    }

    const duration = Math.max(config.duration ?? 0, 0)

    switch (config.mode) {
      case Scroll.Animation.Mode.Smooth: {
        return {
          duration,
          delay: Math.max(config.delay ?? 0, 0),
        }
      }
      case Scroll.Animation.Mode.Ripple: {
        const step = Math.max(config.step ?? 20, 10)
        const range = Math.max(config.range ?? 3, 1)
        const distance = Math.min(Math.abs(offset), range)
        const normalized = distance / range
        const eased = 1 - (1 - normalized) ** 2

        return {
          duration,
          delay: Math.round(eased * range * step),
        }
      }
      case Scroll.Animation.Mode.Directional: {
        const step = Math.max(config.step ?? 40, 10)
        const range = Math.max(config.range ?? 5, 1)
        const distance = Math.min(Math.abs(offset), range)
        const normalized = distance / range

        if (played) {
          const eased = (1 - normalized) ** 2
          return {
            duration,
            delay: Math.round(eased * range * step),
          }
        }

        const eased = 1 - (1 - normalized) ** 2
        return {
          duration,
          delay: Math.round(eased * range * step),
        }
      }
      case Scroll.Animation.Mode.Stagger: {
        if (direction === 0) {
          return {
            duration,
            delay: 0,
          }
        }

        const range = Math.max(config.range ?? 4, 1)
        const step = Math.max(config.step ?? 50, 1)

        const clamped = Math.max(-range, Math.min(range, offset))
        const result = (range + direction * clamped) * step

        return {
          duration,
          delay: Math.round(result),
        }
      }
      default: {
        return {
          duration,
          delay: 0,
        }
      }
    }
  }

  update(isSeek = false) {
    const { player, config, component, scroll } = this.context

    const elementCount = this.lineManager.elementSize
    if (!elementCount || !player.currentInfo.lines.length) {
      return
    }

    const isInPlay = player.currentPlaying
    const isInScroll = scroll.active

    const currentSpace = Math.max(0, config.current.layout.gap)
    const currentContainerHeight = Math.max(0, component.container.height)

    const activePercent = Math.min(Math.max(config.current.scroll.anchor, 0), 100)
    const activePosition = currentContainerHeight * (activePercent / 100)

    // Snapshot the element map into an array once so the rest of `update`
    // can use O(1) array indexing instead of `Map.get` per line.
    const elements = Array.from(this.lineManager.elementMap.values())

    let activeElementSet: ReadonlySet<number>
    let activeElementIndexes: number[]

    const cachedActiveSet = this.lineManager.queryActiveElementSet(player.currentIndex)
    if (cachedActiveSet.size > 0) {
      activeElementSet = cachedActiveSet
      activeElementIndexes = [...cachedActiveSet]
    } else {
      // No active elements (e.g. before the song starts). Fall back to line 0
      const fallback = this.lineManager.queryElementIndexes(0) ?? [0]
      activeElementSet = new Set(fallback)
      activeElementIndexes = fallback.slice()
    }

    const topPositions: number[] = new Array(elementCount)

    for (let i = 0; i < elementCount; i++) {
      const element = elements[i]

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
        const isActiveElement = activeElementSet.has(i)
        if (!isInScroll && !isActiveElement) {
          topPositions[i] = baseTop - element.height
        } else {
          topPositions[i] = baseTop + currentSpace * 0.2
        }
        continue
      }

      if (element.type === LineElementType.Interlude && this.context.isHideInterlude) {
        const isActiveElement = activeElementSet.has(i)
        if (!isInScroll && !isActiveElement) {
          topPositions[i] = baseTop - element.height
          continue
        }
      }

      topPositions[i] = baseTop + currentSpace
    }

    const firstActiveIndex = isInScroll
      ? (this.lineManager.queryElementIndexes(scroll.activeIndex)?.[0] ?? activeElementIndexes[0] ?? 0)
      : (activeElementIndexes[0] ?? 0)

    const firstElement = elements[firstActiveIndex]
    const firstElementHeight = firstElement?.height ?? 0

    const currentActiveOffset = topPositions[firstActiveIndex] + firstElementHeight / 2
    const currentOffset = activePosition - currentActiveOffset
    const currentTime = player.currentTime

    const activeIndex = activeElementIndexes[0] ?? 0

    const currentLineIndex = player.currentIndex[0] ?? -1
    const currentDirection =
      !isInScroll && this.previousLineIndex !== -1 && currentLineIndex !== this.previousLineIndex
        ? currentLineIndex > this.previousLineIndex
          ? 1
          : -1
        : 0

    // Reuse a single style object across iterations of the per-element loop
    // below to avoid allocating a fresh one per line on every layout pass.
    const currentStyle: LineElementStyle = {}

    for (let i = 0; i < elementCount; i++) {
      const element = elements[i]
      if (!element) {
        continue
      }

      const isPlayedLine = i < activeIndex
      const isActiveLine = activeElementSet.has(i)
      const isAlreadyActive = element.active

      if (this.context.player.currentPlaying) {
        element.active = isActiveLine
        element.played = isPlayedLine
      }

      const indexOffset = i - activeIndex

      // reset style
      currentStyle.top = topPositions[i] + currentOffset
      currentStyle.opacity = undefined
      currentStyle.scale = undefined
      currentStyle.blur = undefined

      if (isInScroll) {
        currentStyle.opacity = 1
        currentStyle.transitionDelay = 0
        currentStyle.transitionDuration = 200
      } else {
        const transition = this.calcTransition(indexOffset, isPlayedLine, currentDirection)

        currentStyle.transitionDuration = transition.duration
        currentStyle.transitionDelay = transition.delay

        if (!isActiveLine) {
          currentStyle.scale = this.calcScale(indexOffset)
          currentStyle.blur = this.calcBlur(indexOffset)
        }
      }

      element.updateStyle(currentStyle)

      if (!isActiveLine) {
        element.reset()
        continue
      }

      if (isSeek || !isAlreadyActive) {
        if (isInPlay) {
          element.play(currentTime, true)
        } else {
          element.pause(currentTime, true)
        }
      }
    }

    this.previousLineIndex = currentLineIndex
  }

  reset() {
    this.previousLineIndex = -1
  }
}
