import type { ComponentContext } from '@root/components/context'
import type { ConfigKeySet } from '@root/config'

import { applyClassName } from '@root/utils'

import Style from './style.module.scss'

export enum LineElementType {
  Normal,
  Interlude,
  Creator,
}

export interface LineElementStyle {
  top?: number
  left?: number
  scale?: number
  opacity?: number
  blur?: number
  hide?: boolean
  transitionDelay?: number
  transitionDuration?: number
}

export abstract class BaseLineElement {
  abstract get type(): LineElementType

  protected readonly wrapper: HTMLDivElement

  protected readonly size: { width: number; height: number }

  protected readonly status: { active: boolean; played: boolean; position: string }

  private readonly currentWrapperStyle: LineElementStyle = {}

  constructor(protected readonly context: ComponentContext) {
    this.wrapper = document.createElement('div')
    this.size = { width: 0, height: 0 }
    this.status = { active: false, played: false, position: '' }
  }

  set active(value: boolean) {
    if (value === this.status.active) {
      return
    }
    if (value) {
      this.wrapper.setAttribute('active', '')
    } else {
      this.wrapper.removeAttribute('active')
    }
    this.status.active = value
  }
  get active() {
    return this.status.active
  }

  set played(value: boolean) {
    if (value === this.status.played) {
      return
    }
    if (value) {
      this.wrapper.setAttribute('played', '')
    } else {
      this.wrapper.removeAttribute('played')
    }
    this.status.played = value
  }
  get played() {
    return this.status.played
  }

  set position(value: string) {
    if (value === this.status.position) {
      return
    }
    this.wrapper.setAttribute('position', value)
    this.status.position = value
  }
  get position() {
    return this.status.position
  }

  get element() {
    return this.wrapper
  }

  get height() {
    return this.size.height
  }

  get width() {
    return this.size.width
  }

  updateSize() {
    this.size.width = this.wrapper.clientWidth
    this.size.height = this.wrapper.clientHeight
  }

  updateConfig(keys?: ConfigKeySet) {
    if (!keys || keys.has('line.className')) {
      applyClassName(this.wrapper, [Style.wrapper, this.context.config.line.className])
    }
  }

  updateStyle(current: LineElementStyle) {
    const prev = this.currentWrapperStyle

    const style = this.wrapper.style

    // `transform` aggregates left / top / scale; rebuild only if any of them changed.
    if (current.top !== prev.top || current.left !== prev.left || current.scale !== prev.scale) {
      style.transform = `translate(${current.left || 0}px, ${current.top || 0}px) scale(${current.scale || 1})`
    }

    if (current.transitionDuration !== prev.transitionDuration) {
      style.transitionDuration = `${current.transitionDuration || 0}ms`
    }

    if (current.transitionDelay !== prev.transitionDelay) {
      style.transitionDelay = `${current.transitionDelay || 0}ms`
    }

    // `opacity` depends on both `hide` (override to 0) and `opacity` itself.
    if (current.hide !== prev.hide || current.opacity !== prev.opacity) {
      style.opacity = current.hide ? '0' : current.opacity ? `${current.opacity}` : ''
    }

    if (current.blur !== prev.blur) {
      style.filter = current.blur ? `blur(${current.blur}px)` : ''
    }

    prev.top = current.top
    prev.left = current.left
    prev.scale = current.scale
    prev.opacity = current.opacity
    prev.blur = current.blur
    prev.hide = current.hide
    prev.transitionDelay = current.transitionDelay
    prev.transitionDuration = current.transitionDuration
  }

  abstract play(time: number, isActive: boolean): void

  abstract pause(time: number, isActive: boolean): void

  abstract reset(): void

  destroy(): void {
    this.wrapper.replaceChildren()
    this.wrapper.remove()
  }
}
