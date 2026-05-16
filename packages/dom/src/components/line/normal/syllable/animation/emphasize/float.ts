import { round } from '@root/utils'

import { EffectBase } from './base'

export class FloatEffect extends EffectBase {
  private get config() {
    return this.context.config.line.normal.syllable.animation.emphasize.effects.float
  }

  override get enabled() {
    return this.config.enabled
  }

  init(baseDuration: number, delay: number, stagger: number) {
    this.dispose()

    if (!this.enabled) {
      return
    }

    const chars = this.chars
    const count = chars.length
    if (!count) {
      return
    }

    const config = this.config

    const durationScale = config.duration.scale
    const duration = Number.isFinite(baseDuration * durationScale) ? baseDuration * durationScale : 0
    const leading = config.duration.lead
    this.reset(duration, delay, stagger, leading)

    const easing = config.easing
    const peakTransform = `translateY(${round(-config.amplitude, 3)}px)`

    const animations = this.animations
    for (let i = 0; i < count; i++) {
      const value = delay + stagger * i - leading
      const animation = chars[i].animate(
        [
          { offset: 0, transform: 'translateY(0px)', easing: easing },
          { offset: 0.5, transform: peakTransform, easing: easing },
          { offset: 1, transform: 'translateY(0px)' },
        ],
        {
          duration,
          delay: Number.isFinite(value) ? value : 0,
          fill: 'both',
          composite: 'add',
        },
      )
      animation.pause()
      animations.push(animation)
    }
  }
}
