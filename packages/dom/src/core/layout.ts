import type { LineElementStyle } from '@root/components'
import type { CoreContext } from './context'
import type { LineManager } from './line'

import { DomLyricPlayerConfig } from '@root/config'
import { LineElementType } from '@root/components'

const GAUSSIAN_SIGMA = 2.2

// Beyond this offset the gaussian falls below ~0.02% and is visually indistinguishable from its limit, so far lines skip the exp entirely.
const GAUSSIAN_CUTOFF = 4 * GAUSSIAN_SIGMA

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
    if (offset > GAUSSIAN_CUTOFF || offset < -GAUSSIAN_CUTOFF) {
      return 0
    }
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

    const duration = Math.max(config.duration, 0)

    switch (config.mode) {
      case DomLyricPlayerConfig.Scroll.Animation.Mode.Smooth: {
        return {
          duration,
          delay: Math.max(config.smooth.delay, 0),
        }
      }
      case DomLyricPlayerConfig.Scroll.Animation.Mode.Ripple: {
        const step = Math.max(config.ripple.step, 10)
        const range = Math.max(config.ripple.range, 1)
        const distance = Math.min(Math.abs(offset), range)
        const normalized = distance / range
        const eased = 1 - (1 - normalized) ** 2

        return {
          duration,
          delay: Math.round(eased * range * step),
        }
      }
      case DomLyricPlayerConfig.Scroll.Animation.Mode.Directional: {
        const step = Math.max(config.directional.step, 10)
        const range = Math.max(config.directional.range, 1)
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
      case DomLyricPlayerConfig.Scroll.Animation.Mode.Stagger: {
        if (direction === 0) {
          return {
            duration,
            delay: 0,
          }
        }

        const range = Math.max(config.stagger.range, 1)
        const step = Math.max(config.stagger.step, 1)

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

  update(force = false) {
    const { player, config, component, scroll } = this.context

    const elementCount = this.lineManager.elementSize
    if (!elementCount || !player.currentInfo.lines.length) {
      return
    }

    const isHideInterlude = this.context.config.current.line.interlude.style.normal.hide

    const isInPlay = player.currentPlaying
    const isInScroll = scroll.active

    const currentSpace = Math.max(0, config.current.layout.gap)
    const currentContainerHeight = Math.max(0, component.container.height)

    // Lines within this many elements of the active line keep their animations built and stay layer-promoted; the buffer also lets a just-passed line finish its wind-down before release.
    const animationWindow = Math.max(0, Math.floor(config.current.line.animationWindow))

    const activePercent = Math.min(Math.max(config.current.scroll.anchor, 0), 100)
    const activePosition = currentContainerHeight * (activePercent / 100)

    // Cached insertion-ordered element list from the line manager
    // So the rest of `update` can use O(1) array indexing without re-materializing the map each pass.
    const elements = this.lineManager.elementList

    let activeElementSet: ReadonlySet<number>
    let firstActiveElementIndex: number

    const cachedActiveSet = this.lineManager.queryActiveElementSet(player.currentIndex)
    if (cachedActiveSet.size > 0) {
      activeElementSet = cachedActiveSet
      // Only the first active element index is needed below; read it from the set without materializing an array.
      firstActiveElementIndex = cachedActiveSet.values().next().value ?? 0
    } else {
      // No active elements (e.g. before the song starts). Fall back to line 0
      const fallback = this.lineManager.queryElementIndexes(0) ?? [0]
      activeElementSet = new Set(fallback)
      firstActiveElementIndex = fallback[0] ?? 0
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
      const lastElement = elements[i - 1]
      const lastHeight = lastElement?.height ?? 0
      const baseTop = lastTop + lastHeight

      if (element.type === LineElementType.Normal && element.isBackground) {
        const isActiveElement = activeElementSet.has(i)
        if (!isInScroll && !isActiveElement) {
          topPositions[i] = baseTop - element.height
        } else {
          // Keep the first background line clear of the main line; tuck stacked ones in tighter.
          const afterBackground = lastElement?.type === LineElementType.Normal && lastElement.isBackground
          topPositions[i] = baseTop + currentSpace * (afterBackground ? 0.03 : 0.2)
        }
        continue
      }

      if (element.type === LineElementType.Interlude && isHideInterlude) {
        const isActiveElement = activeElementSet.has(i)
        if (!isInScroll && !isActiveElement) {
          topPositions[i] = baseTop - element.height
          continue
        }
      }

      topPositions[i] = baseTop + currentSpace
    }

    const rawFirstActiveIndex = isInScroll
      ? (this.lineManager.queryElementIndexes(scroll.activeIndex)?.[0] ?? firstActiveElementIndex)
      : firstActiveElementIndex
    // Clamp to a valid element index so an out-of-range value can't turn the offset into NaN and propagate to every line.
    const firstActiveIndex = Math.min(Math.max(rawFirstActiveIndex, 0), elementCount - 1)

    const firstElement = elements[firstActiveIndex]
    const firstElementHeight = firstElement?.height ?? 0

    const currentActiveOffset = topPositions[firstActiveIndex] + firstElementHeight / 2
    const currentOffset = activePosition - currentActiveOffset
    const currentTime = player.currentTime

    const activeIndex = firstActiveElementIndex

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
      currentStyle.hide = false

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
          if (element.type === LineElementType.Interlude && isHideInterlude) {
            currentStyle.hide = true
          }
        }
      }

      if (element.type === LineElementType.Normal && element.isBackground) {
        const raw = (currentStyle.transitionDelay ?? 0) + (currentStyle.transitionDuration ?? 0)
        const enter = Math.round(raw / 3)
        const retract = Math.round(raw / 6)
        element.updateBackgroundDelay(enter, retract)
      }

      // `isActiveLine` always wins so duet / background active elements keep animations even past the window.
      element.animatable = isActiveLine || Math.abs(indexOffset) <= animationWindow

      element.updateStyle(currentStyle)

      if (!isActiveLine) {
        element.reset(currentTime)
        continue
      }

      if (force || !isAlreadyActive) {
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
