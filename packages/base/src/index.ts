import type { Line } from '@music-lyric-kit/lyric'
import type { DeepPartial } from '@music-lyric-player/utils'
import type { Options } from './options'

import { DEFAULT_OPTIONS } from './options'

import { Info } from '@music-lyric-kit/lyric'
import { ConfigManager } from '@music-lyric-player/utils'
import { BaseLyricPlayerEvent } from './event'

export class BaseLyricPlayer extends BaseLyricPlayerEvent {
  readonly config: ConfigManager<Options, DeepPartial<Options>> = new ConfigManager(DEFAULT_OPTIONS)

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
    super()
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

  private handleSyncTime(time: number) {
    const result: Line[] = []

    let firstIndex = this.info.lines.length
    for (let i = 0; i < this.info.lines.length; i++) {
      const line = this.info.lines[i]
      if (line.time.start > time) {
        firstIndex = i
        break
      }

      const nextLine = this.info.lines[i + 1]
      const effectiveEnd = nextLine ? Math.max(line.time.end, nextLine.time.start) : line.time.end

      if (effectiveEnd > time) {
        result.push(line)
      }
    }

    this.state.lines = result
    this.state.index = firstIndex

    this.handleEmitEvent('lines-update', result)
  }

  private handleUpdateActiveLines(now: number) {
    let hasChanged = false

    for (let i = this.state.lines.length - 1; i >= 0; i--) {
      const line = this.state.lines[i]
      const infoIndex = this.info.lines.indexOf(line)

      const nextLineInInfo = infoIndex !== -1 ? this.info.lines[infoIndex + 1] : undefined
      const effectiveEnd = nextLineInInfo ? Math.max(line.time.end, nextLineInInfo.time.start) : line.time.end

      if (now >= effectiveEnd) {
        this.state.lines.splice(i, 1)
        hasChanged = true
      }
    }

    while (this.state.index < this.info.lines.length) {
      const nextLine = this.info.lines[this.state.index]

      if (now >= nextLine.time.start) {
        const nextNextLine = this.info.lines[this.state.index + 1]
        const effectiveEnd = nextNextLine ? Math.max(nextLine.time.end, nextNextLine.time.start) : nextLine.time.end

        if (now < effectiveEnd) {
          this.state.lines.push(nextLine)
          hasChanged = true
        }
        this.state.index++
      } else {
        break
      }
    }

    if (!hasChanged) {
      return
    }

    this.handleEmitEvent('lines-update', this.state.lines)
  }

  private onTick = () => {
    if (!this.state.playing) {
      return
    }

    const now = this.handleGetCurrentTime()
    this.handleUpdateActiveLines(now)

    this.state.frameId = requestAnimationFrame(() => this.onTick())
  }

  updateLyric(info: Info) {
    this.pause()
    this.info = info

    this.state.index = 0
    this.state.lines = []
    this.time.seek = 0

    this.handleEmitEvent('lyric-update', info)
    this.handleEmitEvent('lines-update', [])
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
    this.handleClearEvent()
    this.state.lines = []
    this.info = new Info()
  }

  get current(): Line[] {
    return [...this.state.lines]
  }
}
