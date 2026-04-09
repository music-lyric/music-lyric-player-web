import { Context } from '@root/context'

import { applyClassName } from '@root/utils'

import Style from './style.module.scss'

export enum LineElementType {
  Normal,
  Interlude,
  Creator,
}

export interface LineElementStyle {
  top: number
  left: number
  scale: number
  opacity: number
  blur: number
  hide: boolean
  transitionDelay: number
  transitionDuration: number
}

export const DEFAULT_LINE_ELEMENT_STYLE: LineElementStyle = {
  top: 0,
  left: 0,
  scale: 1,
  opacity: 1,
  blur: 0,
  hide: false,
  transitionDelay: 0,
  transitionDuration: 500,
}

export abstract class BaseLineElement {
  abstract get type(): LineElementType

  protected readonly wrapper: HTMLDivElement

  constructor(protected readonly context: Context) {
    this.wrapper = document.createElement('div')
  }

  set active(value: boolean) {
    if (value) {
      this.wrapper.setAttribute('active', '')
    } else {
      this.wrapper.removeAttribute('active')
    }
  }

  set position(value: string) {
    this.wrapper.setAttribute('position', value)
  }

  get width() {
    return this.wrapper.clientWidth
  }

  get height() {
    return this.wrapper.clientHeight
  }

  get element() {
    return this.wrapper
  }

  updateConfig() {
    applyClassName(this.wrapper, [Style.wrapper, this.context.config.style.className.line.wrapper])
  }

  updateStyle(current: LineElementStyle) {
    const domStyle = this.wrapper.style

    domStyle.transform = `translate(${current.left}px, ${current.top}px) scale(${current.scale})`

    domStyle.transitionDuration = `${current.transitionDuration}ms`
    domStyle.transitionDelay = `${current.transitionDelay}ms`

    domStyle.filter = `blur(${current.blur}px)`
    domStyle.opacity = current.hide ? '0' : `${current.opacity}`
  }

  abstract play(time: number, isActive: boolean): void

  abstract pause(time: number, isActive: boolean): void

  abstract reset(): void

  destroy(): void {
    this.wrapper.replaceChildren()
    this.wrapper.remove()
  }
}
