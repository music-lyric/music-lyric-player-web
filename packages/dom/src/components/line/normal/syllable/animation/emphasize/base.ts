import type { ComponentContext } from '@root/components/context'

export abstract class EffectBase {
  /** Per-character WAAPI animations created by `init` and driven by `drive`. */
  protected animations: Animation[] = []

  // Animation duration in ms for single character.
  protected duration = 0
  // Line-relative ms at which the first character's animation starts.
  protected delay = 0
  // Per-character delay increment within the word.
  protected stagger = 0
  // ms subtracted from every character's delay (float lead-in; 0 for others).
  protected leading = 0

  private currentDelays: number[] = []

  constructor(
    protected readonly context: ComponentContext,
    protected readonly chars: HTMLSpanElement[],
  ) {}

  protected reset(duration: number, delay: number, stagger: number, leading: number = 0) {
    this.duration = duration
    this.delay = delay
    this.stagger = stagger
    this.leading = leading
    this.currentDelays = []
  }

  abstract get enabled(): boolean

  updateDelay(value: number) {
    const count = this.animations.length
    if (!count) {
      return
    }

    const delay = this.delay
    const stagger = this.stagger
    const leading = this.leading
    for (let i = 0; i < count; i++) {
      const target = delay + stagger * i - leading + value
      if (this.currentDelays[i] === target) {
        continue
      }
      this.currentDelays[i] = target
      this.animations[i].effect!.updateTiming({
        delay: Number.isFinite(target) ? target : 0,
      })
    }
  }

  drive(isPlay: boolean, isActive: boolean, relativeTime: number, localTime: number, disableRate: number) {
    const animations = this.animations
    const count = animations.length
    if (!count) {
      return
    }

    // Line-switch wind-down: fast-forward any in-flight animation via `playbackRate` so the residual peak collapses quickly.
    // `currentTime` is left untouched so we don't trigger WAAPI's auto-rewind by putting the effect in 'after' phase before play().
    if (!isActive) {
      for (let i = 0; i < count; i++) {
        const animation = animations[i]
        if (animation.playState === 'finished') {
          continue
        }
        if (animation.playbackRate !== disableRate) {
          animation.playbackRate = disableRate
        }
        if (isPlay) {
          animation.play()
        } else {
          animation.pause()
        }
      }
      return
    }

    const delay = this.delay
    const stagger = this.stagger
    const duration = this.duration
    const leading = this.leading

    for (let i = 0; i < count; i++) {
      const animation = animations[i]
      const end = delay + stagger * i - leading + duration
      // Past natural end:
      // Use `.finish()` instead of `.play()` to avoid WAAPI's auto-rewind for animations whose `currentTime` lies past the effect end.
      if (relativeTime >= end) {
        if (animation.playState !== 'finished') {
          animation.finish()
        }
        continue
      }
      animation.playbackRate = 1
      animation.currentTime = localTime
      if (isPlay) {
        animation.play()
      } else {
        animation.pause()
      }
    }
  }

  dispose() {
    for (let i = 0; i < this.animations.length; i++) {
      this.animations[i].cancel()
    }
    this.animations = []
    this.duration = 0
    this.delay = 0
    this.stagger = 0
    this.leading = 0
  }
}
