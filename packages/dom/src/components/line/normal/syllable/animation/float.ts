import type { LineNormal, WordNormal } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { DomLyricPlayerConfig } from '@root/config'

export class FloatAnimation {
  private animation: Animation | null = null
  private duration: number = 0
  private delay: number = 0

  constructor(
    private readonly host: HTMLDivElement,
    private readonly context: ComponentContext,
    private readonly wordInfo: WordNormal,
    private readonly lineInfo: LineNormal,
  ) {
    this.updateConfig()
  }

  private init() {
    this.dispose()

    const config = this.context.config.line.normal.syllable.animation.float
    if (!config.enabled) {
      return
    }

    const duration = Math.max(1000, this.wordInfo.time.duration)
    this.duration = duration

    const delay = this.wordInfo.time.start - this.lineInfo.time.start
    this.delay = delay

    this.animation = this.host.animate([{ transform: `translateY(${config.from ?? 0}px)` }, { transform: `translateY(${config.to ?? 2}px)` }], {
      delay,
      duration,
      fill: 'both',
      composite: 'add',
      easing: 'ease',
    })
    this.animation.pause()
  }

  updateStyle(isPlay: boolean, isActive: boolean, currentTime: number, relativeTime: number) {
    if (!this.animation) {
      return
    }

    if (!isActive) {
      if (this.animation.playbackRate !== -1) {
        this.animation.playbackRate = -1
        this.animation.play()
      }
      return
    }

    // When the line is active but `currentTime` is still before its start (e.g. before-song fallback / seek)
    // pad the effect's delay so the float does not advance during the catch-up window.
    const initDelay = this.wordInfo.time.start - this.lineInfo.time.start
    const delay = relativeTime < 0 ? initDelay - relativeTime : initDelay
    if (this.delay !== delay) {
      this.delay = delay
      this.animation.effect!.updateTiming({ delay })
    }

    // Past effect end: use `.finish()` instead of `.play()` to avoid WAAPI's auto-rewind for animations whose `currentTime` lies past the effect end.
    if (relativeTime >= initDelay + this.duration) {
      if (this.animation.playState !== 'finished') {
        this.animation.finish()
      }
      return
    }

    this.animation.playbackRate = 1
    this.animation.currentTime = relativeTime > 0 ? relativeTime : 0
    if (isPlay) {
      this.animation.play()
    } else {
      this.animation.pause()
    }
  }

  updateConfig(keys?: DomLyricPlayerConfig.RootKeySet) {
    if (!keys) {
      this.init()
      return
    }

    if (keys.has('line.normal.syllable.animation.float')) {
      this.init()
    }
  }

  dispose() {
    this.animation?.cancel()
    this.animation = null
    this.duration = 0
    this.delay = 0
  }
}
