import type { Line } from '@music-lyric-kit/lyric'

import { DEFAULT_LINE_ELEMENT_STYLE } from '@root/components'
import { DEFAULT_CONFIG } from '@root/config'

import { Info, LineType } from '@music-lyric-kit/lyric'
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { ConfigManager } from '@music-lyric-player/utils'

import { Context } from '@root/context'
import { ConfigClient } from '@root/config'
import { Container, BaseLineElement, NormalLineElement, InterludeLineElement } from '@root/components'

import { ScrollHandler } from './scroll'

export class DomLyricPlayer {
  public config: ConfigClient

  private context: Context
  private player: BaseLyricPlayer

  private container: Container
  private lineMap: Map<number, BaseLineElement>

  private scroll: ScrollHandler

  constructor(player: BaseLyricPlayer) {
    const config = new ConfigManager(DEFAULT_CONFIG, {})
    const context = new Context(config)
    const container = new Container(context)

    this.config = config
    this.context = context
    this.container = container
    this.player = player

    this.lineMap = new Map()
    this.scroll = new ScrollHandler(player, config, container)
    this.scroll.onScroll = this.onScroll.bind(this)

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
    for (const line of this.lineMap.values()) {
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
    for (const [index, element] of this.lineMap) {
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
    for (const line of this.lineMap.values()) {
      line.destroy()
    }
    this.lineMap.clear()
  }

  private handleInitLines() {
    const result = new Map<number, BaseLineElement>()

    for (let i = 0; i < this.player.currentInfo.lines.length; i++) {
      const line = this.player.currentInfo.lines[i]
      if (!line) {
        continue
      }
      switch (line.type) {
        case LineType.Normal: {
          const element = new NormalLineElement(this.context, line)
          result.set(i, element)
          break
        }
        case LineType.Interlude: {
          const element = new InterludeLineElement(this.context, line)
          result.set(i, element)
          break
        }
      }
    }

    this.handleClearLines()
    this.lineMap = result

    for (const line of result.values()) {
      this.container.appendChild(line.element)
    }
  }

  private handleRefreshLineSize() {
    for (const line of this.lineMap.values()) {
      line.updateSize()
    }
  }

  private handleGetLineIsActive(index: number) {
    return this.player.currentIndex.includes(index)
  }

  private handleUpdateLines(line?: number) {
    const allLinesInfo = this.player.currentInfo.lines

    if (!this.lineMap.size || !allLinesInfo.length) {
      return
    }

    const lineGap = this.config.current.style.fontSize * 0.8
    const containerHeight = this.container.clientHeight
    const anchorY = containerHeight * (this.config.current.scroll.activePosition / 100)

    let activeIndices: number[] = []
    for (const index of this.lineMap.keys()) {
      if (this.handleGetLineIsActive(index)) {
        activeIndices.push(index)
      }
    }

    if (activeIndices.length === 0) {
      activeIndices = [0]
    }

    const topPositions: number[] = new Array(this.lineMap.size).fill(0)
    let y = 0
    for (const [index, element] of this.lineMap) {
      topPositions[index] = y
      y += element.height + lineGap
    }

    let anchorCenter: number
    if (line && line >= 0) {
      anchorCenter = topPositions[line] + this.lineMap.get(line)!.height / 2
    } else {
      const firstActiveIdx = activeIndices[0]
      const lastActiveIdx = activeIndices[activeIndices.length - 1]
      const activeGroupTop = topPositions[firstActiveIdx]
      const activeGroupBottom = topPositions[lastActiveIdx] + this.lineMap.get(lastActiveIdx)!.height
      anchorCenter = (activeGroupTop + activeGroupBottom) / 2
    }

    const offset = anchorY - anchorCenter

    const currentTime = this.player.currentTime

    for (const [index, element] of this.lineMap) {
      const isActive = this.handleGetLineIsActive(index)

      element.updateStyle({
        ...DEFAULT_LINE_ELEMENT_STYLE,
        top: topPositions[index] + offset,
      })

      if (isActive) {
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
