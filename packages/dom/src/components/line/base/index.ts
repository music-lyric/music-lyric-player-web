import { Context } from '@root/context'

import { applyClassName, createCssText } from '@root/utils'

import Style from './style.module.scss'

export interface BaseLineStyles {
  top: number
  left: number
  scale: number
  opacity: number
  blur: number
  hide: boolean
  transitionDelay: number
  transitionDuration: number
}

export const DEFAULT_BASE_LINE_TRANSFORMS: BaseLineStyles = {
  top: 0,
  left: 0,
  scale: 1,
  opacity: 0,
  blur: 0,
  hide: false,
  transitionDelay: 0,
  transitionDuration: 500,
}

export abstract class BaseLine {
  abstract get type(): 'main' | 'producer'

  protected context: Context

  protected current: {
    index: number
    element: HTMLDivElement
  }

  constructor(context: Context, index: number) {
    this.context = context
    this.current = {
      index,
      element: document.createElement('div'),
    }

    const classNames = [Style.wrapper, context.config.current.line.wrapper.className]
    applyClassName(this.current.element, classNames)
  }

  updateTransforms(transforms: BaseLineStyles) {
    const style: Partial<CSSStyleDeclaration> = {}

    style.transform = [`translateX(${transforms.left}px)`, `translateY(${transforms.top}px)`, `scale(${transforms.scale})`].join(' ')

    style.transitionDuration = `${transforms.transitionDuration}ms`
    style.transitionDelay = `${transforms.transitionDelay}ms`
    style.filter = `blur(${transforms.blur}px)`
    style.opacity = transforms.hide ? '0 !important' : `${transforms.opacity}`

    this.current.element.setAttribute('style', createCssText(style))
  }

  abstract play(time: number, isActive: boolean): void

  abstract pause(time: number, isActive: boolean): void

  abstract reset(): void

  destroy() {
    this.current.element.remove()
  }

  set active(isActive: boolean) {
    if (isActive) {
      this.current.element.setAttribute('active', '')
    } else {
      this.current.element.removeAttribute('active')
    }
  }

  set postion(value: string) {
    this.current.element.setAttribute('postion', value)
  }

  get index() {
    return this.current.index
  }

  get width() {
    return this.current.element.clientWidth
  }

  get height() {
    return this.current.element.clientHeight
  }

  get element() {
    return this.current.element
  }
}
