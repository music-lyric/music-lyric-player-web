import type { Line } from '@music-lyric-kit/lyric'
import type { DeepPartial } from '@music-lyric-player/utils'
import type { Options } from './options'

import { DEFAULT_OPTIONS } from './options'

import { Info } from '@music-lyric-kit/lyric'
import { ConfigManager, Event } from '@music-lyric-player/utils'

export interface BaseLyricPlayerEventMap {
  /**
   * When the player starts or resumes playback.
   * @param currentTime The current playback time.
   */
  play: (currentTime: number) => void

  /**
   * When the player pauses playback.
   * @param currentTime The current playback time.
   */
  pause: (currentTime: number) => void

  /**
   * When the entire lyric information is updated (e.g., loading a new lyric/song).
   * @param info The newly loaded lyric information object.
   */
  lyricUpdate: (info: Info) => void

  /**
   * When the currently active lyric lines change during playback.
   * @param lines An array of the currently active lyric lines.
   * @param indexs An array of the currently active lyric lines' indexes.
   * @param firstIndex The index of the first currently active lyric line (-1 if none).
   */
  linesUpdate: (lines: Line[], indexs: number[], index: number) => void
}

export class BaseLyricPlayer {
  readonly config = new ConfigManager<Options, DeepPartial<Options>>(DEFAULT_OPTIONS)

  readonly event: Event<BaseLyricPlayerEventMap> = new Event()

  private state: {
    playing: boolean
    frameId: number | null
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

    this.event.emit('linesUpdate', [...this.active.lines], [...this.active.index], this.handleGetActiveIndex())
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
    this.event.emit('linesUpdate', [...this.active.lines], [...this.active.index], this.handleGetActiveIndex())
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
    this.event.emit('linesUpdate', [], [], -1)
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
    return { lines, index }
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
    return [...this.active.lines]
  }

  /**
   * Indices of currently active lines.
   */
  get currentIndex() {
    return [...this.active.index]
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
