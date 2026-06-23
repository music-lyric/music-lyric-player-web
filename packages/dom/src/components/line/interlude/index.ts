import type { Lyric } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { DomLyricPlayerConfig } from '@root/config'
import type { LineElementStyle } from '../base'

import { BaseLineElement, LineElementType } from '../base'
import { Dot } from './dot'

import { applyClassName, applyRole, PlayerRole } from '@root/utils'

import styles from './index.module.scss'

const DOT_COUNT = 3

export class InterludeLineElement extends BaseLineElement {
  override get type() {
    return LineElementType.Interlude as const
  }

  private container: HTMLDivElement
  private dots: Dot[]
  private animationActive = false

  constructor(
    context: ComponentContext,
    private readonly info: Lyric.LineInterlude,
  ) {
    super(context)

    this.container = document.createElement('div')
    this.element.appendChild(this.container)

    this.dots = []
    for (let i = 0; i < DOT_COUNT; i++) {
      const dot = new Dot(context, i)
      this.dots.push(dot)
      this.container.appendChild(dot.element)
    }

    this.updateConfig()
  }

  private buildClassName() {
    applyClassName(this.container, [styles.interlude])
    applyRole(this.container, PlayerRole.interlude)
  }

  private buildAnimations() {
    const raw = this.info.time.duration
    const slice = Number.isFinite(raw) ? Math.max(0, Math.floor(raw / DOT_COUNT)) : 0
    for (const dot of this.dots) {
      dot.build(slice)
    }
  }

  private updateAnimations(active: boolean) {
    if (this.animationActive === active) {
      return
    }
    this.animationActive = active
    if (active) {
      this.buildAnimations()
    } else {
      this.disposeAnimations()
    }
  }

  private driveAnimations(isPlay: boolean, isActive: boolean, relativeTime: number) {
    for (const dot of this.dots) {
      dot.drive(isPlay, isActive, relativeTime)
    }
  }

  private disposeAnimations() {
    for (const dot of this.dots) {
      dot.dispose()
    }
  }

  override updateConfig(keys?: DomLyricPlayerConfig.RootKeySet) {
    super.updateConfig(keys)

    if (!keys) {
      this.buildClassName()
    }

    if (!this.animationActive) {
      return
    }
    if (keys && !keys.has('line.interlude.style')) {
      return
    }

    this.buildAnimations()
  }

  override updateStyle(current: LineElementStyle) {
    super.updateStyle(current)
    this.updateAnimations(this.animatable)
  }

  override play(time: number, isActive: boolean) {
    this.driveAnimations(true, isActive, time - this.info.time.start)
  }

  override pause(time: number, isActive: boolean) {
    this.driveAnimations(false, isActive, time - this.info.time.start)
  }

  override reset(time: number) {
    this.driveAnimations(false, false, time - this.info.time.start)
  }

  override destroy() {
    this.disposeAnimations()
    super.destroy()
  }
}
