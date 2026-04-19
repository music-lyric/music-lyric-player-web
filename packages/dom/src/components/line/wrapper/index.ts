import { Context } from '@root/context'

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

  constructor(protected readonly context: Context) {
    this.wrapper = document.createElement('div')
    this.size = { width: 0, height: 0 }
  }

  set active(value: boolean) {
    if (value) {
      this.wrapper.setAttribute('active', '')
    } else {
      this.wrapper.removeAttribute('active')
    }
  }

  set played(value: boolean) {
    if (value) {
      this.wrapper.setAttribute('played', '')
    } else {
      this.wrapper.removeAttribute('played')
    }
  }

  set position(value: string) {
    this.wrapper.setAttribute('position', value)
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

  updateConfig() {
    applyClassName(this.wrapper, [Style.wrapper, this.context.config.line.className])
  }

  updateStyle(current: LineElementStyle) {
    const domStyle = this.wrapper.style

    domStyle.transform = `translate(${current.left || 0}px, ${current.top || 0}px) scale(${current.scale || 1})`

    domStyle.transitionDuration = `${current.transitionDuration || 0}ms`
    domStyle.transitionDelay = `${current.transitionDelay || 0}ms`

    if (current.hide) {
      domStyle.opacity = '0'
    } else if (current.opacity) {
      domStyle.opacity = `${current.opacity}`
    } else {
      domStyle.opacity = ''
    }

    if (current.blur) {
      domStyle.filter = `blur(${current.blur}px)`
    } else {
      domStyle.filter = ''
    }
  }

  abstract play(time: number, isActive: boolean): void

  abstract pause(time: number, isActive: boolean): void

  abstract reset(): void

  destroy(): void {
    this.wrapper.replaceChildren()
    this.wrapper.remove()
  }
}
