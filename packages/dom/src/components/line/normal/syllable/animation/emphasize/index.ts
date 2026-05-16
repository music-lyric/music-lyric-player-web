import type { LineNormal, WordNormal } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { Config } from '@root/config'

import { clamp } from '@root/utils'

import { MainEffect } from './main'
import { GlowEffect } from './glow'
import { FloatEffect } from './float'

export class EmphasizeAnimation {
  static PADDING_HORIZONTAL = 9
  static PADDING_VERTICAL = 5

  private readonly main: MainEffect
  private readonly glow: GlowEffect
  private readonly float: FloatEffect

  private inited = false

  private get config() {
    return this.context.config.line.normal.syllable.animation.emphasize
  }

  constructor(
    private readonly context: ComponentContext,
    private readonly wordInfo: WordNormal,
    private readonly lineInfo: LineNormal,
    private readonly chars: HTMLSpanElement[],
  ) {
    this.main = new MainEffect(context, chars)
    this.glow = new GlowEffect(context, chars)
    this.float = new FloatEffect(context, chars)
  }

  get enable() {
    if (!this.config.enabled) {
      return false
    }
    if (!this.wordInfo.config.stress || !this.wordInfo.content) {
      return false
    }
    const effects = this.config.effects
    if (!effects.main.enabled && !effects.glow.enabled && !effects.float.enabled) {
      return false
    }
    return true
  }

  private get visible() {
    return this.enable && this.chars.length > 0
  }

  private get params() {
    // Short syllables get a much softer treatment (cubic); long ones less than linear (sqrt).
    const min = Math.max(0, this.config.minDuration)
    const raw = Math.max(min, this.wordInfo.time.duration)

    let mainIntensity = raw / 2000
    mainIntensity = mainIntensity > 1 ? Math.sqrt(mainIntensity) : mainIntensity ** 3
    mainIntensity = clamp(mainIntensity * 0.6, 0, 1.2)

    let glowIntensity = raw / 3000
    glowIntensity = glowIntensity > 1 ? Math.sqrt(glowIntensity) : glowIntensity ** 3
    glowIntensity = clamp(glowIntensity * 0.5, 0, 0.8)

    const duration = Number.isFinite(raw) ? raw : 0
    const delay = this.wordInfo.time.start - this.lineInfo.time.start
    const stagger = duration / 2.5 / this.chars.length

    return { mainIntensity, glowIntensity, duration, delay, stagger }
  }

  private init() {
    this.dispose()

    if (!this.visible) {
      return
    }

    const params = this.params
    this.main.init(params.mainIntensity, params.duration, params.delay, params.stagger)
    this.glow.init(params.glowIntensity, params.duration, params.delay, params.stagger)
    this.float.init(params.duration, params.delay, params.stagger)

    this.inited = true
  }

  updateStyle(isPlay: boolean, isActive: boolean, currentTime: number, relativeTime: number) {
    if (!this.inited) {
      return
    }

    const adjustment = relativeTime < 0 ? -relativeTime : 0
    this.main.updateDelay(adjustment)
    this.glow.updateDelay(adjustment)
    this.float.updateDelay(adjustment)

    const localTime = relativeTime > 0 ? relativeTime : 0
    const disableRate = this.config.disablePlaybackRate

    this.main.drive(isPlay, isActive, relativeTime, localTime, disableRate)
    this.glow.drive(isPlay, isActive, relativeTime, localTime, disableRate)
    this.float.drive(isPlay, isActive, relativeTime, localTime, disableRate)
  }

  updateConfig(keys?: Config.RootKeySet) {
    if (!keys) {
      this.init()
      return
    }

    // Not emphasize changes, nothing to do.
    if (!keys.has('line.normal.syllable.animation.emphasize')) {
      return
    }

    if (
      this.inited !== this.visible ||
      keys.has('line.normal.syllable.animation.emphasize.enabled') ||
      keys.has('line.normal.syllable.animation.emphasize.minDuration')
    ) {
      this.init()
      return
    }

    if (!this.visible) {
      return
    }

    const params = this.params
    if (keys.has('line.normal.syllable.animation.emphasize.effects.main')) {
      this.main.init(params.mainIntensity, params.duration, params.delay, params.stagger)
    }
    if (keys.has('line.normal.syllable.animation.emphasize.effects.glow')) {
      this.glow.init(params.glowIntensity, params.duration, params.delay, params.stagger)
    }
    if (keys.has('line.normal.syllable.animation.emphasize.effects.float')) {
      this.float.init(params.duration, params.delay, params.stagger)
    }
  }

  dispose() {
    this.main.dispose()
    this.glow.dispose()
    this.float.dispose()
    this.inited = false
  }
}
