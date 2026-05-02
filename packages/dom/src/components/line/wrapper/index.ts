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

  private readonly wrapper: {
    dom: HTMLDivElement
    width: number
    height: number
    active: boolean
    played: boolean
    position: string
    style: LineElementStyle
  }

  constructor(protected readonly context: ComponentContext) {
    this.wrapper = {
      dom: document.createElement('div'),
      width: 0,
      height: 0,
      active: false,
      played: false,
      position: '',
      style: {},
    }
  }

  updateSize() {
    this.wrapper.width = this.wrapper.dom.clientWidth
    this.wrapper.height = this.wrapper.dom.clientHeight
  }

  updateConfig(keys?: ConfigKeySet) {
    if (!keys || keys.has('line.className')) {
      applyClassName(this.wrapper.dom, [Style.wrapper, this.context.config.line.className])
    }
  }

  updateStyle(current: LineElementStyle) {
    const prev = this.wrapper.style

    const style = this.wrapper.dom.style

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
    this.wrapper.dom.replaceChildren()
    this.wrapper.dom.remove()
  }

  set active(value: boolean) {
    if (value === this.wrapper.active) {
      return
    }
    if (value) {
      this.wrapper.dom.setAttribute('active', '')
    } else {
      this.wrapper.dom.removeAttribute('active')
    }
    this.wrapper.active = value
  }
  get active() {
    return this.wrapper.active
  }

  set played(value: boolean) {
    if (value === this.wrapper.played) {
      return
    }
    if (value) {
      this.wrapper.dom.setAttribute('played', '')
    } else {
      this.wrapper.dom.removeAttribute('played')
    }
    this.wrapper.played = value
  }
  get played() {
    return this.wrapper.played
  }

  set position(value: string) {
    if (value === this.wrapper.position) {
      return
    }
    this.wrapper.dom.setAttribute('position', value)
    this.wrapper.position = value
  }
  get position() {
    return this.wrapper.position
  }

  get height() {
    return this.wrapper.height
  }
  get width() {
    return this.wrapper.width
  }

  get element() {
    return this.wrapper.dom
  }
}
