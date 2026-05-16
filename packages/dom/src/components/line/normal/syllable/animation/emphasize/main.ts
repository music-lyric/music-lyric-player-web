import { round } from '@root/utils'

import { EffectBase } from './base'

export class MainEffect extends EffectBase {
  private get config() {
    return this.context.config.line.normal.syllable.animation.emphasize.effects.main
  }

  override get enabled() {
    return this.config.enabled
  }

  init(intensity: number, duration: number, delay: number, stagger: number) {
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
    this.reset(duration, delay, stagger)

    const riseEasing = config.easing.rise

    const peakEasing = config.easing.fall
    const peakScale = round(1 + config.scale * intensity, 3)

    const offsetX = round(config.offset.horizontal * intensity, 3)
    const offsetY = round(-config.offset.vertical * intensity, 3)

    const animations = this.animations
    for (let i = 0; i < count; i++) {
      const offset = count / 2 - i
      const value = delay + stagger * i
      const animation = chars[i].animate(
        [
          { offset: 0, transform: 'scale(1) translate(0px, 0px)', easing: riseEasing },
          { offset: 0.5, transform: `scale(${peakScale}) translate(${round(-offsetX * offset, 3)}px, ${offsetY}px)`, easing: peakEasing },
          { offset: 1, transform: 'scale(1) translate(0px, 0px)' },
        ],
        {
          duration: duration,
          delay: Number.isFinite(value) ? value : 0,
          fill: 'both',
          composite: 'replace',
        },
      )
      animation.pause()
      animations.push(animation)
    }
  }
}
