import { Info, Line } from '@music-lyric-kit/lyric'
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { ConfigManager } from '@music-lyric-player/utils'
import { Container, MainLine } from '@root/components'
import { BaseLine, BaseLineStyle, DEFAULT_BASE_LINE_STYLE } from '@root/components/line/base'
import { ConfigClient, DEFAULT_CONFIG } from '@root/config'
import { Context } from '@root/context'

export class DomLyricPlayer {
  public config: ConfigClient = new ConfigManager(DEFAULT_CONFIG, {})

  private context: Context
  private player: BaseLyricPlayer

  private container: Container
  private lines: BaseLine[]

  private onDestroy: Array<() => void> = []

  constructor(player: BaseLyricPlayer) {
    this.context = new Context(this.config)
    this.player = player

    this.container = new Container(this.context)
    this.lines = []

    const onLyricUpadte = this.onLyricUpadte.bind(this)
    const onLinesUpdate = this.onLinesUpdate.bind(this)

    this.player.event.add('lyric-update', onLyricUpadte)
    this.player.event.add('lines-update', onLinesUpdate)
    this.onDestroy.push(() => {
      this.player.event.remove('lyric-update', onLyricUpadte)
      this.player.event.remove('lines-update', onLinesUpdate)
    })

    this.config.on(this.onConfigUpdate.bind(this))
  }

  private onConfigUpdate() {
    this.container.updateConfig()
  }

  private onLyricUpadte(info: Info) {
    this.handleInitLines()
    requestAnimationFrame(() => {
      this.handleUpdateLines()
    })
  }
  private onLinesUpdate(lines: Line[]) {
    this.handleUpdateLines()
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
      const element = new MainLine({
        context: this.context,
        line,
        index: 0,
      })
      result.push(element)
    }

    this.handleClearLines()
    for (const line of result) {
      this.container.appendChild(line.element)
    }

    this.lines = result
  }

  private handleUpdateLines() {
    console.log('handleUpdateLines')

    const currentLines = this.player.currentInfo.lines
    const currentActiveLines = this.player.currentLines
    const currentLineElements = this.lines

    if (!currentLineElements.length || !currentLines.length) {
      return
    }

    const currentSpace = this.config.current.style.fontSize * 0.6

    const styles: BaseLineStyle[] = this.lines.map(() => ({ ...DEFAULT_BASE_LINE_STYLE }))

    const activeIndices: number[] = []
    for (const line of currentActiveLines) {
      const index = currentLines.indexOf(line)
      if (index !== -1) {
        activeIndices.push(index)
      }
    }
    activeIndices.sort((a, b) => a - b)

    if (!activeIndices.length) {
      activeIndices.push(0)
    }

    const containerHeight = this.container.height
    const anchorRatio = this.config.current.scroll.activePosition * 0.01

    let activeGroupHeight = 0
    for (let k = 0; k < activeIndices.length; k++) {
      const idx = activeIndices[k]
      activeGroupHeight += this.lines[idx]?.height ?? 0
      if (k < activeIndices.length - 1) {
        activeGroupHeight += currentSpace
      }
    }

    let activeGroupTop = containerHeight * anchorRatio - activeGroupHeight / 2

    for (let k = 0; k < activeIndices.length; k++) {
      const idx = activeIndices[k]
      styles[idx].top = activeGroupTop
      activeGroupTop += (this.lines[idx]?.height ?? 0) + currentSpace
    }

    const firstActiveIndex = activeIndices[0]
    let nextTop = styles[firstActiveIndex].top
    for (let i = firstActiveIndex - 1; i >= 0; i--) {
      const lineHeight = this.lines[i]?.height ?? 0
      nextTop = nextTop - lineHeight - currentSpace
      styles[i].top = nextTop
    }

    const lastActiveIndex = activeIndices[activeIndices.length - 1]
    let prevTop = styles[lastActiveIndex].top
    let prevHeight = this.lines[lastActiveIndex]?.height ?? 0
    for (let i = lastActiveIndex + 1; i < this.lines.length; i++) {
      prevTop = prevTop + prevHeight + currentSpace
      styles[i].top = prevTop
      prevHeight = this.lines[i]?.height ?? 0
    }

    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].updateStyle(styles[i])
    }
  }

  get element() {
    return this.container.element
  }
}
