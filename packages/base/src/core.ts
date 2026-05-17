import type { Line } from '@music-lyric-kit/lyric'
import type { BaseLyricPlayerEventMap } from './interface'

import { Info } from '@music-lyric-kit/lyric'
import { ConfigManager, Event } from '@music-lyric-player/utils'
import { BaseLyricPlayerConfig } from './config'

export class BaseLyricPlayer {
  readonly config: BaseLyricPlayerConfig.RootManager = new ConfigManager(BaseLyricPlayerConfig.DEFAULT)

  readonly event: Event<BaseLyricPlayerEventMap> = new Event()

  private state: {
    playing: boolean
    frameId: number | null
    timerId: number | null
    scanIndex: number
  }
  private active: {
    lines: Line[]
    index: number[]
  }
  private time: {
    start: number
    seek: number
  }
  private info: Info

  constructor() {
    this.state = {
      playing: false,
      frameId: null,
      timerId: null,
      scanIndex: 0,
    }
    this.active = {
      lines: [],
      index: [],
    }
    this.time = {
      start: 0,
      seek: 0,
    }
    this.info = new Info()
  }

  private handleGetCurrentTime() {
    if (!this.state.playing) {
      return this.time.seek
    }
    return this.time.seek + (performance.now() - this.time.start)
  }

  private handleGetLineTime(index: number): number {
    if (index < 0 || index >= this.info.lines.length) {
      return 0
    }

    if (index === this.info.lines.length - 1) {
      return Infinity
    }

    const line = this.info.lines[index]
    const nextLine = this.info.lines[index + 1]
    return Math.max(line.time.end, nextLine.time.start)
  }

  private handleGetActiveIndex() {
    return this.active.index.length > 0 ? this.active.index[0] : -1
  }

  private handleBridgeActive(lines: Line[], index: number[]): { lines: Line[]; index: number[] } {
    if (!this.config.current.bridgeActive || index.length < 2) {
      return { lines, index }
    }
    const min = index[0]
    const max = index[index.length - 1]
    if (max - min + 1 === index.length) {
      return { lines, index }
    }
    const existing = new Map<number, Line>()
    for (let i = 0; i < index.length; i++) {
      existing.set(index[i], lines[i])
    }
    const bridgedLines: Line[] = []
    const bridgedIndex: number[] = []
    for (let i = min; i <= max; i++) {
      const line = existing.get(i) ?? this.info.lines[i]
      if (!line) continue
      bridgedLines.push(line)
      bridgedIndex.push(i)
    }
    return { lines: bridgedLines, index: bridgedIndex }
  }

  private handleEmitLinesUpdate(isSeek: boolean) {
    const bridged = this.handleBridgeActive(this.active.lines, this.active.index)
    this.event.emit('linesUpdate', bridged.lines, bridged.index, this.handleGetActiveIndex(), isSeek)
  }

  private handleSyncTime(time: number) {
    const lines: Line[] = []
    const index: number[] = []

    let firstIndex = this.info.lines.length
    for (let i = 0; i < this.info.lines.length; i++) {
      const line = this.info.lines[i]
      if (line.time.start > time) {
        firstIndex = i
        break
      }

      if (this.handleGetLineTime(i) > time) {
        lines.push(line)
        index.push(i)
      }
    }

    this.state.scanIndex = firstIndex

    this.active.lines = lines
    this.active.index = index

    this.handleEmitLinesUpdate(true)
  }

  private handleUpdateActiveLines(now: number) {
    let hasChanged = false

    const newActiveLines: Line[] = []
    const newActiveIndex: number[] = []

    for (let i = 0; i < this.active.lines.length; i++) {
      const line = this.active.lines[i]
      const infoIndex = this.active.index[i]

      if (now >= this.handleGetLineTime(infoIndex)) {
        hasChanged = true
      } else {
        newActiveLines.push(line)
        newActiveIndex.push(infoIndex)
      }
    }

    while (this.state.scanIndex < this.info.lines.length) {
      const nextLine = this.info.lines[this.state.scanIndex]
      if (now >= nextLine.time.start) {
        if (now < this.handleGetLineTime(this.state.scanIndex)) {
          newActiveLines.push(nextLine)
          newActiveIndex.push(this.state.scanIndex)
          hasChanged = true
        }
        this.state.scanIndex++
      } else {
        break
      }
    }

    if (!hasChanged) {
      return
    }

    this.active.lines = newActiveLines
    this.active.index = newActiveIndex
    this.handleEmitLinesUpdate(false)
  }

  private onTick = () => {
    if (!this.state.playing) {
      return
    }

    const now = this.handleGetCurrentTime()
    this.handleUpdateActiveLines(now)

    switch (this.config.current.driver) {
      case 'animation':
        this.state.frameId = window.requestAnimationFrame(this.onTick)
        break
      case 'timer':
        this.state.timerId = window.setTimeout(this.onTick, 16)
        break
    }
  }

  updateLyric(info: Info) {
    if (!info) {
      return
    }

    this.pause()
    this.info = info

    this.active.lines = []
    this.active.index = []

    this.state.scanIndex = 0
    this.time.seek = 0

    this.event.emit('lyricUpdate', info)
    this.event.emit('linesUpdate', [], [], -1, false)
  }

  /**
   * Start playback
   * @param time Optional time in ms to seek to before starting playback. If not provided, playback will start from the current position.
   */
  play(time?: number) {
    this.pause()

    if (typeof time === 'number' && !Number.isNaN(time)) {
      this.time.seek = time
      this.handleSyncTime(time)
    }

    this.time.start = performance.now()
    this.state.playing = true
    this.onTick()

    this.event.emit('play', this.handleGetCurrentTime())
  }

  /**
   * Pause playback
   */
  pause() {
    if (this.state.playing) {
      this.time.seek = this.handleGetCurrentTime()
      this.state.playing = false
    }
    if (this.state.frameId !== null) {
      cancelAnimationFrame(this.state.frameId)
      this.state.frameId = null
    }
    if (this.state.timerId !== null) {
      clearTimeout(this.state.timerId)
      this.state.timerId = null
    }

    this.event.emit('pause', this.handleGetCurrentTime())
  }

  /**
   * Stop playback
   */
  dispose() {
    this.pause()
    this.event.clear()

    this.active.lines = []
    this.active.index = []

    this.info = new Info()
  }

  /**
   * Find all active lines at the given time (ms). Does not mutate internal state.
   * @param time time in ms to find active lines for.
   */
  matchLinesWithTime(time: number): { lines: Line[]; index: number[] } {
    const lines: Line[] = []
    const index: number[] = []
    for (let i = 0; i < this.info.lines.length; i++) {
      const line = this.info.lines[i]
      if (line.time.start > time) {
        break
      }
      if (this.handleGetLineTime(i) > time) {
        lines.push(line)
        index.push(i)
      }
    }
    return this.handleBridgeActive(lines, index)
  }

  /**
   * Whether the player is currently playing.
   */
  get currentPlaying() {
    return this.state.playing
  }

  /**
   * Current active lines.
   */
  get currentLines() {
    return this.handleBridgeActive(this.active.lines, this.active.index).lines
  }

  /**
   * Indices of currently active lines.
   */
  get currentIndex() {
    return this.handleBridgeActive(this.active.lines, this.active.index).index
  }

  /**
   * The index of the primary active line, or -1 if none.
   */
  get currentActive() {
    return this.handleGetActiveIndex()
  }

  /**
   * The current lyric info object.
   */
  get currentInfo() {
    return this.info
  }

  /**
   * The current playback time in ms.
   */
  get currentTime() {
    return this.handleGetCurrentTime()
  }
}
