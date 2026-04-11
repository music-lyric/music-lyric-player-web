import type { Line } from '@music-lyric-kit/lyric'

import { DEFAULT_LINE_ELEMENT_STYLE } from '@root/components'
import { DEFAULT_CONFIG } from '@root/config'

import { Info, LineType } from '@music-lyric-kit/lyric'
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { ConfigManager } from '@music-lyric-player/utils'

import { Context } from '@root/context'
import { ConfigClient } from '@root/config'
import { Container, BaseLineElement, NormalLineElement } from '@root/components'

export class DomLyricPlayer {
  public config: ConfigClient = new ConfigManager(DEFAULT_CONFIG, {})

  private context: Context
  private player: BaseLyricPlayer

  private container: Container
  private lines: BaseLineElement[]

  constructor(player: BaseLyricPlayer) {
    this.context = new Context(this.config)
    this.player = player

    this.container = new Container(this.context)
    this.lines = []

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
    for (const line of this.lines) {
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
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i]
      if (!line) {
        continue
      }
      const isActive = this.handleGetLineIsActive(i)
      line.pause(currentTime, isActive)
    }
  }

  private onLyricUpadte = (info: Info) => {
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

  private handleClearLines() {
    for (const line of this.lines) {
      line.destroy()
    }
    this.lines = []
  }

  private handleInitLines() {
    const result = []

    for (const line of this.player.currentInfo.lines) {
      switch (line.type) {
        case LineType.Normal: {
          const element = new NormalLineElement(this.context, line)
          result.push(element)
          break
        }
      }
    }

    this.handleClearLines()
    for (const line of result) {
      this.container.appendChild(line.element)
    }

    this.lines = result
  }

  private handleRefreshLineSize() {
    for (const line of this.lines) {
      line.updateSize()
    }
  }

  private handleGetLineIsActive(index: number) {
    const target = this.player.currentInfo.lines[index]
    if (!target) {
      return false
    }
    return this.player.currentLines.includes(target)
  }

  private handleUpdateLines() {
    const allLinesInfo = this.player.currentInfo.lines
    const lineElements = this.lines

    if (!lineElements.length || !allLinesInfo.length) {
      return
    }

    const lineGap = this.config.current.style.fontSize * 0.6
    const containerHeight = this.container.clientHeight
    const anchorY = containerHeight * (this.config.current.scroll.activePosition / 100)

    let activeIndices: number[] = []
    for (let i = 0; i < lineElements.length; i++) {
      if (this.handleGetLineIsActive(i)) {
        activeIndices.push(i)
      }
    }

    if (activeIndices.length === 0) {
      activeIndices = [0]
    }

    const topPositions: number[] = new Array(lineElements.length).fill(0)
    let y = 0
    for (let i = 0; i < lineElements.length; i++) {
      topPositions[i] = y
      y += lineElements[i].height + lineGap
    }

    const firstActiveIdx = activeIndices[0]
    const lastActiveIdx = activeIndices[activeIndices.length - 1]
    const activeGroupTop = topPositions[firstActiveIdx]
    const activeGroupBottom = topPositions[lastActiveIdx] + lineElements[lastActiveIdx].height
    const activeGroupCenter = (activeGroupTop + activeGroupBottom) / 2

    const offset = anchorY - activeGroupCenter

    const currentTime = this.player.currentTime

    for (let i = 0; i < lineElements.length; i++) {
      const line = lineElements[i]
      const isActive = this.handleGetLineIsActive(i)

      line.updateStyle({
        ...DEFAULT_LINE_ELEMENT_STYLE,
        top: topPositions[i] + offset,
      })

      if (isActive) {
        line.active = true
        line.play(currentTime, true)
      } else {
        line.active = false
        line.reset()
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
