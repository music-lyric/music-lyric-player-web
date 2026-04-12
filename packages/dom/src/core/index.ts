import type { Line } from '@music-lyric-kit/lyric'
import type { LineElement } from '@root/components'

import { DEFAULT_LINE_ELEMENT_STYLE, LineElementType } from '@root/components'
import { DEFAULT_CONFIG } from '@root/config'

import { Info, LineType } from '@music-lyric-kit/lyric'
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { ConfigManager } from '@music-lyric-player/utils'

import { Context } from '@root/context'
import { ConfigClient } from '@root/config'
import { Container, NormalLineElement, InterludeLineElement } from '@root/components'

import { ScrollHandler } from './scroll'

export class DomLyricPlayer {
  public config: ConfigClient

  private context: Context
  private player: BaseLyricPlayer

  private container: Container

  private lineElemeMap: Map<number, LineElement>
  private lineIndexMap: Map<number, number[]>

  private scroll: ScrollHandler

  constructor(player: BaseLyricPlayer) {
    const config = new ConfigManager(DEFAULT_CONFIG, {})
    const context = new Context(config)
    const container = new Container(context)

    this.config = config
    this.context = context
    this.container = container
    this.player = player

    this.scroll = new ScrollHandler(player, config, container)
    this.scroll.onScroll = this.onScroll.bind(this)

    this.lineElemeMap = new Map()
    this.lineIndexMap = new Map()

    this.player.event.add('play', this.onPlay)
    this.player.event.add('pause', this.onPause)
    this.player.event.add('lyricUpdate', this.onLyricUpadte)
    this.player.event.add('linesUpdate', this.onLinesUpdate)

    this.container.event.add('change-size', this.onSizeUpdate)

    this.config.event.add('update', this.onConfigUpdate)
  }

  private onSizeUpdate = () => {
    requestAnimationFrame(() => {
      this.handleRefreshLineSize()
    })
  }

  private onConfigUpdate = () => {
    this.container.updateConfig()
    for (const line of this.lineElemeMap.values()) {
      line.updateConfig()
    }
    requestAnimationFrame(() => {
      this.handleRefreshLineSize()
    })
  }

  private onPlay = (currentTime: number) => {
    this.handleUpdateLines()
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
      this.handleUpdateLines()
    })
  }

  private onLinesUpdate = (lines: Line[]) => {
    requestAnimationFrame(() => {
      this.handleUpdateLines()
    })
  }

  private onScroll(line: number) {
    this.handleUpdateLines(line)
  }

  private handleClearLines() {
    for (const line of this.lineElemeMap.values()) {
      line.destroy()
    }
    this.lineElemeMap.clear()
    this.lineIndexMap.clear()
  }

  private handleInitLines() {
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
          lineElemeMap.set(currentElemIndex, elem)
          indexs.push(currentElemIndex)
          break
        }
        case LineType.Normal: {
          const elem = new NormalLineElement(this.context, line, false)
          lineElemeMap.set(currentElemIndex, elem)
          indexs.push(currentElemIndex)
          for (const background of line.background || []) {
            const elem = new NormalLineElement(this.context, background, true)
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
      this.container.appendChild(line.element)
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

  private handleUpdateLines(targetIndex?: number) {
    const linNumFull = this.lineElemeMap.size
    if (!linNumFull || !this.player.currentInfo.lines.length) {
      return
    }

    const currentSpace = this.config.current.style.fontSize * 0.8
    const currentContainerHeight = this.container.clientHeight
    const currentActivePosition = currentContainerHeight * (this.config.current.scroll.activePosition / 100)

    const isInScrolling = targetIndex !== void 0 && targetIndex >= 0
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
        if (!isInScrolling && !isActiveLine) {
          topPositions[i] = baseTop - element.height
        } else {
          topPositions[i] = baseTop + currentSpace * 0.5
        }
        continue
      }

      topPositions[i] = baseTop + currentSpace
    }

    let currentActiveOffset: number
    if (isInScrolling) {
      const targetElement = this.lineElemeMap.get(targetIndex)
      const targetHeight = targetElement?.height ?? 0
      currentActiveOffset = topPositions[targetIndex] + targetHeight / 2
    } else {
      const firstActiveIdx = currentActiveLines[0]
      const lastActiveIdx = currentActiveLines[currentActiveLines.length - 1]
      const activeGroupTop = topPositions[firstActiveIdx]
      const lastElementHeight = this.lineElemeMap.get(lastActiveIdx)?.height ?? 0
      const activeGroupBottom = topPositions[lastActiveIdx] + lastElementHeight
      currentActiveOffset = (activeGroupTop + activeGroupBottom) / 2
    }
    const offset = currentActivePosition - currentActiveOffset
    const currentTime = this.player.currentTime

    for (let i = 0; i < linNumFull; i++) {
      const element = this.lineElemeMap.get(i)
      if (!element) {
        continue
      }
      const isActiveLine = currentActiveLines.includes(i)
      element.updateStyle({
        ...DEFAULT_LINE_ELEMENT_STYLE,
        top: topPositions[i] + offset,
      })
      if (isActiveLine) {
        element.active = true
        element.play(currentTime, true)
      } else {
        element.active = false
        element.reset()
      }
    }
  }

  get element() {
    return this.container.element
  }

  destroy() {
    this.player.event.remove('play', this.onPlay)
    this.player.event.remove('pause', this.onPause)
    this.player.event.remove('lyricUpdate', this.onLyricUpadte)
    this.player.event.remove('linesUpdate', this.onLinesUpdate)

    this.container.event.remove('change-size', this.onSizeUpdate)
    this.config.event.remove('update', this.onConfigUpdate)

    this.handleClearLines()
  }
}
