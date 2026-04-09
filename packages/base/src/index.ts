import type { Line } from '@music-lyric-kit/lyric'
import type { DeepPartial } from '@music-lyric-player/utils'
import type { Options } from './options'

import { DEFAULT_OPTIONS } from './options'

import { Info } from '@music-lyric-kit/lyric'
import { ConfigManager, Event } from '@music-lyric-player/utils'

export interface BaseLyricPlayerEventMap {
  'lyric-update': (info: Info) => void
  'lines-update': (lines: Line[]) => void
}

export class BaseLyricPlayer {
  readonly config: ConfigManager<Options, DeepPartial<Options>> = new ConfigManager(DEFAULT_OPTIONS)

  readonly event: Event<BaseLyricPlayerEventMap> = new Event()

  private state: {
    playing: boolean
    frameId: number | null
    index: number
    lines: Line[]
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
      index: 0,
      lines: [],
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

  private handleSyncTime(time: number) {
    const result: Line[] = []

    let firstIndex = this.info.lines.length
    for (let i = 0; i < this.info.lines.length; i++) {
      const line = this.info.lines[i]
      if (line.time.start > time) {
        firstIndex = i
        break
      }

      if (this.handleGetLineTime(i) > time) {
        result.push(line)
      }
    }

    this.state.lines = result
    this.state.index = firstIndex

    this.event.emit('lines-update', [...this.state.lines])
  }

  private handleUpdateActiveLines(now: number) {
    let hasChanged = false

    const activeLines = this.state.lines.filter((line) => {
      const infoIndex = this.info.lines.indexOf(line)
      if (now >= this.handleGetLineTime(infoIndex)) {
        hasChanged = true
        return false
      }
      return true
    })

    while (this.state.index < this.info.lines.length) {
      const nextLine = this.info.lines[this.state.index]

      if (now >= nextLine.time.start) {
        if (now < this.handleGetLineTime(this.state.index)) {
          activeLines.push(nextLine)
          hasChanged = true
        }
        this.state.index++
      } else {
        break
      }
    }

    if (hasChanged) {
      this.state.lines = activeLines
      this.event.emit('lines-update', [...this.state.lines])
    }
  }

  private onTick = () => {
    if (!this.state.playing) {
      return
    }

    const now = this.handleGetCurrentTime()
    this.handleUpdateActiveLines(now)

    this.state.frameId = requestAnimationFrame(this.onTick)
  }

  updateLyric(info: Info) {
    this.pause()
    this.info = info

    this.state.index = 0
    this.state.lines = []
    this.time.seek = 0

    this.event.emit('lyric-update', info)
    this.event.emit('lines-update', [])
  }

  play(time?: number) {
    this.pause()

    if (typeof time === 'number' && !Number.isNaN(time)) {
      this.time.seek = time
      this.handleSyncTime(time)
    }

    this.time.start = performance.now()
    this.state.playing = true
    this.onTick()
  }

  pause() {
    if (this.state.playing) {
      this.time.seek = this.handleGetCurrentTime()
      this.state.playing = false
    }
    if (this.state.frameId !== null) {
      cancelAnimationFrame(this.state.frameId)
      this.state.frameId = null
    }
  }

  dispose(): void {
    this.pause()
    this.event.clear()
    this.state.lines = []
    this.info = new Info()
  }

  get currentLines() {
    return [...this.state.lines]
  }

  get currentInfo() {
    return this.info
  }

  get currentTime() {
    return this.handleGetCurrentTime()
  }
}
