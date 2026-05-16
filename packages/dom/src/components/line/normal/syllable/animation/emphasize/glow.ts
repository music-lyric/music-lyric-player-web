import { parseColor, clamp, round } from '@root/utils'

import { EffectBase } from './base'

export class GlowEffect extends EffectBase {
  private get config() {
    return this.context.config.line.normal.syllable.animation.emphasize.effects.glow
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
    const color = parseColor(config.color)
    if (!color) {
      return
    }

    this.reset(duration, delay, stagger)

    const radius = round(Math.min(config.maxRadius, intensity * config.maxRadius), 3)
    const alpha = round(clamp(intensity * config.maxAlpha, 0, 1), 3)
    const reset = `0 0 ${radius}px rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`
    const peak = `0 0 ${radius}px rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`

    const animations = this.animations
    for (let i = 0; i < count; i++) {
      const value = delay + stagger * i
      const animation = chars[i].animate(
        [
          { offset: 0, textShadow: reset, easing: config.easing },
          { offset: 0.5, textShadow: peak, easing: config.easing },
          { offset: 1, textShadow: reset },
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
