import type { Line } from '@music-lyric-kit/lyric'
import type { LineElement, LineElementStyle } from '@root/components'

import { LineElementType } from '@root/components'
import { DEFAULT_CONFIG, ScrollAnimationConfig } from '@root/config'

import { Info, LineType } from '@music-lyric-kit/lyric'
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { ConfigManager } from '@music-lyric-player/utils'

import { Context } from '@root/context'
import { ConfigClient } from '@root/config'
import { Root, NormalLineElement, InterludeLineElement } from '@root/components'

import { ScrollHandler } from './scroll'

export class DomLyricPlayer {
  public config: ConfigClient

  private context: Context
  private player: BaseLyricPlayer

  private root: Root

  private lineElemeMap: Map<number, LineElement>
  private lineIndexMap: Map<number, number[]>

  private scroll: ScrollHandler

  constructor(player: BaseLyricPlayer) {
    const config = new ConfigManager(DEFAULT_CONFIG, {})
    const context = new Context(config)
    const root = new Root(context)

    this.config = config
    this.context = context
    this.root = root
    this.player = player

    this.scroll = new ScrollHandler(player, config, root, this.onScroll.bind(this))

    this.lineElemeMap = new Map()
    this.lineIndexMap = new Map()

    this.player.event.add('play', this.onPlay)
    this.player.event.add('pause', this.onPause)
    this.player.event.add('lyricUpdate', this.onLyricUpadte)
    this.player.event.add('linesUpdate', this.onLinesUpdate)

    this.root.event.add('change-size', this.onSizeUpdate)

    this.config.event.add('update', this.onConfigUpdate)
  }

  private onSizeUpdate = () => {
    requestAnimationFrame(() => {
      this.handleRefreshLineSize()
      this.handleUpdateLineStyle()
    })
  }

  private onConfigUpdate = () => {
    this.root.updateConfig()
    this.handleUpdateLineConfig()
    requestAnimationFrame(() => {
      this.handleRefreshLineSize()
      this.handleUpdateLineStyle()
    })
  }

  private onPlay = (currentTime: number) => {
    requestAnimationFrame(() => {
      this.handleUpdateLineStyle()
    })
  }

  private onPause = (currentTime: number) => {
    for (const [index, element] of this.lineElemeMap) {
      const isActive = this.handleGetLineIsActive(index)
      element.pause(currentTime, isActive)
    }
  }

  private onLyricUpadte = (info: Info) => {
    this.scroll.clear()
    this.handleInitLines()
    requestAnimationFrame(() => {
      this.handleRefreshLineSize()
      this.handleUpdateLineStyle()
    })
  }

  private onLinesUpdate = (lines: Line[]) => {
    requestAnimationFrame(() => {
      this.handleUpdateLineStyle()
    })
  }

  private onScroll(line: number, scrolling: boolean) {
    if (scrolling) {
      this.root.setAttribute('scrolling')
    } else {
      this.root.removeAttribute('scrolling')
    }
    this.handleUpdateLineStyle(line, scrolling)
  }

  private handleClearLines() {
    for (const line of this.lineElemeMap.values()) {
      line.destroy()
    }
    this.lineElemeMap.clear()
    this.lineIndexMap.clear()
  }

  private handleUpdateLineConfig() {
    const position = this.config.current.layout.align
    for (const element of this.lineElemeMap.values()) {
      element.position = position
      element.updateConfig()
    }
  }

  private handleInitLines() {
    const position = this.config.current.layout.align

    const lineElemeMap = new Map<number, LineElement>()
    const lineIndexMap = new Map<number, number[]>()

    let lineIndex = 0
    let elemIndex = 0

    for (const line of this.player.currentInfo.lines) {
      const currentLineIndex = lineIndex
      const currentElemIndex = elemIndex

      const indexs = []
      lineIndex++
      elemIndex++

      switch (line.type) {
        case LineType.Interlude: {
          const elem = new InterludeLineElement(this.context, line)
          elem.position = position
          lineElemeMap.set(currentElemIndex, elem)
          indexs.push(currentElemIndex)
          break
        }
        case LineType.Normal: {
          const elem = new NormalLineElement(this.context, line, false)
          elem.position = position
          lineElemeMap.set(currentElemIndex, elem)
          indexs.push(currentElemIndex)
          for (const background of line.background || []) {
            const elem = new NormalLineElement(this.context, background, true)
            elem.position = position
            lineElemeMap.set(elemIndex, elem)
            indexs.push(elemIndex)
            elemIndex++
          }
        }
      }

      lineIndexMap.set(currentLineIndex, indexs)
    }

    this.handleClearLines()
    for (const line of lineElemeMap.values()) {
      this.root.appendChild(line.element)
    }

    this.lineElemeMap = lineElemeMap
    this.lineIndexMap = lineIndexMap
  }

  private handleRefreshLineSize() {
    for (const line of this.lineElemeMap.values()) {
      line.updateSize()
    }
  }

  private handleGetLineIsActive(elemIndex: number) {
    for (const lineIdx of this.player.currentIndex) {
      const elemIndices = this.lineIndexMap.get(lineIdx)
      if (elemIndices && elemIndices.includes(elemIndex)) {
        return true
      }
    }
    return false
  }

  private handleCalcLineScale(offset: number) {
    const config = this.config.current.effect.scale
    if (!config.enabled) {
      return void 0
    }

    const sigma = 2.2

    const min = Math.max(config.min, 0)
    const max = Math.min(config.max, 1)

    const gaussian = Math.exp(-(offset * offset) / (2 * sigma * sigma))

    return parseFloat((min + (max - min) * gaussian).toFixed(2))
  }
  private handleCalcLineBlur(offset: number) {
    const config = this.config.current.effect.blur
    if (!config.enabled) {
      return 0
    }

    const sigma = 2.2

    const min = Math.max(config.min, 0)
    const max = Math.min(config.max, 4.5)

    const gaussian = Math.exp(-(offset * offset) / (2 * sigma * sigma))

    return parseFloat((min + (max - min) * (1 - gaussian)).toFixed(2))
  }
  /**
   * @returns [transitionDuration, transitionDelay]
   */
  private handleCalcLineTransition(offset: number, played: boolean): [number, number] {
    const config = this.config.current.scroll.animation
    if (!config) {
      return [0, 0]
    }

    const duration = Math.max(config.duration ?? 0, 0)

    switch (config.mode) {
      case ScrollAnimationConfig.Mode.Smooth: {
        return [duration, Math.max(config.delay ?? 0, 0)]
      }
      case ScrollAnimationConfig.Mode.Ripple: {
        const step = Math.max(config.step ?? 20, 10)
        const range = Math.max(config.range ?? 3, 1)

        const distance = Math.min(Math.abs(offset), range)
        const normalized = distance / range

        // ease-out quadratic: fast start, gentle end
        const eased = 1 - (1 - normalized) ** 2

        return [duration, Math.round(eased * range * step)]
      }
      case ScrollAnimationConfig.Mode.Directional: {
        const step = Math.max(config.step ?? 40, 10)
        const range = Math.max(config.range ?? 5, 1)

        const distance = Math.min(Math.abs(offset), range)
        const normalized = distance / range

        if (played) {
          // far lines move first, in lines follow
          const eased = (1 - normalized) * (1 - normalized)
          return [duration, Math.round(eased * range * step)]
        } else {
          // near lines move first, far lines follow
          const eased = 1 - (1 - normalized) ** 2
          return [duration, Math.round(eased * range * step)]
        }
      }
    }
  }
  private handleUpdateLineStyle(targetIndex?: number, scrolling: boolean = false) {
    const linNumFull = this.lineElemeMap.size
    if (!linNumFull || !this.player.currentInfo.lines.length) {
      return
    }

    const currentSpace = Math.max(0, this.config.current.layout.gap)
    const currentContainerHeight = Math.max(0, this.root.height)

    const activePercent = Math.min(Math.max(this.config.current.scroll.anchor, 0), 100)
    const currentActivePosition = currentContainerHeight * (activePercent / 100)

    const currentActiveLines: number[] = []
    const topPositions: number[] = new Array(linNumFull)

    for (let i = 0; i < linNumFull; i++) {
      if (this.handleGetLineIsActive(i)) {
        currentActiveLines.push(i)
      }
    }
    if (!currentActiveLines.length) {
      const firstLineElems = this.lineIndexMap.get(0) || [0]
      currentActiveLines.push(...firstLineElems)
    }

    for (let i = 0; i < linNumFull; i++) {
      const element = this.lineElemeMap.get(i)
      if (!element) {
        continue
      }

      const isActiveLine = currentActiveLines.includes(i)

      if (i === 0) {
        topPositions[i] = 0
        continue
      }

      const lastTop = topPositions[i - 1]
      const lastElement = this.lineElemeMap.get(i - 1)
      const lastHeight = lastElement?.height ?? 0
      const baseTop = lastTop + lastHeight

      if (element.type === LineElementType.Normal && element.isBackground) {
        if (!scrolling && !isActiveLine) {
          topPositions[i] = baseTop - element.height
        } else {
          topPositions[i] = baseTop + currentSpace * 0.2
        }
        continue
      }

      topPositions[i] = baseTop + currentSpace
    }

    let currentActiveOffset: number
    if (scrolling && targetIndex !== undefined) {
      const targetElement = this.lineElemeMap.get(targetIndex)
      const targetHeight = targetElement?.height ?? 0
      currentActiveOffset = topPositions[targetIndex] + targetHeight / 2
    } else {
      const firstActiveIdx = currentActiveLines[0]
      const firstElement = this.lineElemeMap.get(firstActiveIdx)
      const firstElementHeight = firstElement?.height ?? 0
      currentActiveOffset = topPositions[firstActiveIdx] + firstElementHeight / 2
    }
    const offset = currentActivePosition - currentActiveOffset
    const currentTime = this.player.currentTime

    for (let i = 0; i < linNumFull; i++) {
      const element = this.lineElemeMap.get(i)
      if (!element) {
        continue
      }

      const isPlayedLine = currentActiveLines.length > 0 && i < currentActiveLines[0]
      const isActiveLine = currentActiveLines.includes(i)

      element.active = isActiveLine
      element.played = isPlayedLine

      const activeIndex = currentActiveLines[0] ?? 0
      const indexOffset = i - activeIndex

      const style: LineElementStyle = {
        top: topPositions[i] + offset,
      }

      const [transitionDuration, transitionDelay] = this.handleCalcLineTransition(indexOffset, isPlayedLine)
      style.transitionDuration = transitionDuration

      if (!isActiveLine && !scrolling) {
        style.transitionDelay = transitionDelay
        style.scale = this.handleCalcLineScale(indexOffset)
        style.blur = this.handleCalcLineBlur(indexOffset)
      }

      element.updateStyle(style)

      if (isActiveLine) {
        element.play(currentTime, true)
      } else {
        element.reset()
      }
    }
  }

  get element() {
    return this.root.element
  }

  destroy() {
    this.player.event.remove('play', this.onPlay)
    this.player.event.remove('pause', this.onPause)
    this.player.event.remove('lyricUpdate', this.onLyricUpadte)
    this.player.event.remove('linesUpdate', this.onLinesUpdate)

    this.root.event.remove('change-size', this.onSizeUpdate)
    this.config.event.remove('update', this.onConfigUpdate)

    this.handleClearLines()
  }
}
