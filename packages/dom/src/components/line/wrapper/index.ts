import { Context } from '@root/context'

import { applyClassName, createCssText } from '@root/utils'

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

export abstract class LineElementWrapper {
  abstract get type(): LineElementType

  protected context: Context

  protected wrapper: HTMLDivElement

  constructor(context: Context) {
    this.context = context
    this.wrapper = document.createElement('div')

    const classNames = [Style.wrapper, this.context.config.style.className.line.wrapper]
    applyClassName(this.wrapper, classNames)
  }

  abstract play(time: number, isActive: boolean): void

  abstract pause(time: number, isActive: boolean): void

  abstract reset(): void

  destroy() {
    this.wrapper.remove()
  }

  set style(current: LineElementStyle) {
    const style: Partial<CSSStyleDeclaration> = {}

    style.transform = [`translateX(${current.left}px)`, `translateY(${current.top}px)`, `scale(${current.scale})`].join(' ')

    style.transitionDuration = `${current.transitionDuration}ms`
    style.transitionDelay = `${current.transitionDelay}ms`
    style.filter = `blur(${current.blur}px)`
    style.opacity = current.hide ? '0 !important' : `${current.opacity}`

    this.wrapper.setAttribute('style', createCssText(style))
  }

  set active(isActive: boolean) {
    if (isActive) {
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
}
