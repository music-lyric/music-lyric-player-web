import type { BaseLyricPlayerEventMap } from './interface'

import { Lyric } from '@music-lyric-kit/lyric'
import { ConfigManager, Event } from '@music-lyric-player/utils'
import { BaseLyricPlayerConfig } from './config'

import { satisfies } from 'semver'

// Parse results must satisfy this caret range of the supported lyric format version, else they are rejected.
const SUPPORTED_VERSION_RANGE = `^${Lyric.Version}`

export class BaseLyricPlayer {
  readonly config: BaseLyricPlayerConfig.RootManager = new ConfigManager(BaseLyricPlayerConfig.DEFAULT as BaseLyricPlayerConfig.RootRequired)

  readonly event: Event<BaseLyricPlayerEventMap> = new Event()

  private state: {
    playing: boolean
    frameId: number | null
    timerId: number | null
    scanIndex: number
  }
  private active: {
    lines: Lyric.Line[]
    index: number[]
  }
  private time: {
    start: number
    seek: number
  }

  private offset: {
    temp: number
    meta: number
  }
  private info: Lyric.Info

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

    this.offset = {
      temp: 0,
      meta: 0,
    }
    this.info = new Lyric.Info()

    this.config.event.add('update', this.onConfigUpdate)
  }

  private onConfigUpdate = (keys: BaseLyricPlayerConfig.RootKeySet) => {
    // Toggling meta usage re-derives the lyric offset from the current info.
    const metaToggled = keys.has('offset.useMeta')
    if (metaToggled) {
      this.handleRefreshOffset()
    }
    // Offset changed = time shift, re-match active lines against the new effective time.
    if (metaToggled || keys.has('offset.global')) {
      this.handleSyncTime()
    }
  }

  // Get current playback time.
  private handleGetCurrentTime() {
    if (!this.state.playing) {
      return this.time.seek
    }
    return this.time.seek + (performance.now() - this.time.start)
  }

  // Real playback time shifted by the combined offset; all lyric matching runs against this.
  private handleGetEffectiveTime() {
    return this.handleGetCurrentTime() + this.currentOffset
  }

  // Refresh meta offset.
  private handleRefreshOffset() {
    if (this.config.current.offset.useMeta) {
      const meta = this.info.metas.find((item) => item.type === Lyric.MetaType.Offset)
      const value = meta?.content
      const result = typeof value === 'number' && Number.isFinite(value) ? value : 0
      this.offset.meta = result
    } else {
      this.offset.meta = 0
    }
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

  private handleBridgeActive(lines: Lyric.Line[], index: number[]): { lines: Lyric.Line[]; index: number[] } {
    if (!this.config.current.bridgeActive || index.length < 2) {
      return { lines, index }
    }
    const min = index[0]
    const max = index[index.length - 1]
    if (max - min + 1 === index.length) {
      return { lines, index }
    }
    const existing = new Map<number, Lyric.Line>()
    for (let i = 0; i < index.length; i++) {
      existing.set(index[i], lines[i])
    }
    const bridgedLines: Lyric.Line[] = []
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

  private handleSyncTime(time?: number) {
    if (!this.info.lines.length) {
      return
    }

    if (time === undefined) {
      time = this.handleGetEffectiveTime()
    }

    if (!Number.isFinite(time)) {
      return
    }

    const lines: Lyric.Line[] = []
    const index: number[] = []

    let firstIndex = this.info.lines.length
    for (let i = 0; i < this.info.lines.length; i++) {
      const line = this.info.lines[i]
      // Lines are assumed sorted by time.start ascending, so the first line starting after `time` ends the scan.
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

    const newActiveLines: Lyric.Line[] = []
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

    const now = this.handleGetEffectiveTime()
    this.handleUpdateActiveLines(now)

    switch (this.config.current.driver) {
      case 'animation':
        this.state.frameId = globalThis.requestAnimationFrame(this.onTick)
        break
      case 'timer':
        this.state.timerId = globalThis.setTimeout(this.onTick, 16)
        break
    }
  }

  updateLyric(info: Lyric.Info) {
    if (!info) {
      return
    }

    // Reject parse results whose lyric format version is incompatible, clearing any current lyric.
    let target = info
    if (!satisfies(info.version, SUPPORTED_VERSION_RANGE)) {
      console.warn(`[music-lyric-player] ignored lyric with incompatible version "${info.version}", expected "${SUPPORTED_VERSION_RANGE}"`)
      target = new Lyric.Info()
    }

    this.pause()
    this.info = target

    this.handleRefreshOffset()
    if (this.config.current.offset.resetTempOnLyricChange) {
      this.offset.temp = 0
    }

    this.active.lines = []
    this.active.index = []

    this.state.scanIndex = 0
    this.time.seek = 0

    this.event.emit('lyricUpdate', target)
    this.event.emit('linesUpdate', [], [], -1, false)
  }

  /**
   * Start playback
   * @param time Optional time in ms to seek to before starting playback. If not provided, playback will start from the current position.
   */
  play(time?: number) {
    this.pause()

    if (typeof time === 'number' && Number.isFinite(time)) {
      this.time.seek = time
      this.handleSyncTime()
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
      // Only emit when actually transitioning from playing to paused
      this.event.emit('pause', this.time.seek)
    }
    if (this.state.frameId !== null) {
      globalThis.cancelAnimationFrame(this.state.frameId)
      this.state.frameId = null
    }
    if (this.state.timerId !== null) {
      globalThis.clearTimeout(this.state.timerId)
      this.state.timerId = null
    }
  }

  /**
   * Stop playback
   */
  dispose() {
    this.pause()
    this.event.clear()
    this.config.event.remove('update', this.onConfigUpdate)

    this.active.lines = []
    this.active.index = []

    this.info = new Lyric.Info()
  }

  /**
   * Update the temp offset in ms (the user's temporary adjustment).
   * Stacked on top of the global config offset and the lyric's meta offset, then resyncs immediately.
   * @param value temp offset in ms; non-finite values are treated as 0.
   */
  updateTempOffset(value: number) {
    this.offset.temp = Number.isFinite(value) ? value : 0
    this.handleSyncTime()
  }

  /**
   * Find all active lines at the given time (ms). Does not mutate internal state.
   * Assumes `info.lines` is sorted by `time.start` ascending.
   * @param time time in ms to find active lines for.
   */
  matchLinesWithTime(time: number): { lines: Lyric.Line[]; index: number[] } {
    const effective = time + this.currentOffset
    const lines: Lyric.Line[] = []
    const index: number[] = []
    for (let i = 0; i < this.info.lines.length; i++) {
      const line = this.info.lines[i]
      // Lines are assumed sorted by time.start ascending, so the first line starting after `time` ends the scan.
      if (line.time.start > effective) {
        break
      }
      if (this.handleGetLineTime(i) > effective) {
        lines.push(line)
        index.push(i)
      }
    }
    return this.handleBridgeActive(lines, index)
  }

  /**
   * Convert a content (lyric) time to the playback clock by removing the active offset.
   * Seeking playback to the returned time makes a line at `contentTime` become active.
   * @param contentTime content time in ms (e.g. a line's start).
   */
  convertContentTime(contentTime: number): number {
    return contentTime - this.currentOffset
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

  /**
   * The current effective lyric offset in ms (config offset + lyric meta offset + temp offset).
   */
  get currentOffset() {
    const value = this.config.current.offset.global + this.offset.meta + this.offset.temp
    return Number.isFinite(value) ? value : 0
  }
}
