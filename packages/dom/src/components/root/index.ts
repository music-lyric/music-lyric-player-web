import type { ContainerEventMap } from './container'

import { Event } from '@music-lyric-player/utils'
import { Context } from '@root/context'

import { Container } from './container'
import { Style } from './style'

import Styles from './style.module.scss'
import { applyClassName } from '@root/utils'

export class Root {
  readonly event: Event<ContainerEventMap>

  private readonly container: Container
  private readonly style: Style

  private readonly dom: HTMLDivElement

  constructor(private readonly context: Context) {
    const container = new Container(context)
    this.container = container
    this.event = container.event

    const style = new Style(context)
    this.style = style

    this.dom = document.createElement('div')
    applyClassName(this.dom, [Styles.root])

    this.dom.appendChild(this.style.element)
    this.dom.appendChild(this.container.element)

    this.updateConfig()
  }

  updateConfig() {
    this.container.updateConfig()
    this.style.updateConfig()
  }

  setAttribute(name: string, value?: string) {
    this.container.setAttribute(name, value)
  }

  removeAttribute(name: string) {
    this.container.removeAttribute(name)
  }

  appendChild(child: HTMLDivElement) {
    this.container.appendChild(child)
  }

  clearChild() {
    this.container.clearChild()
  }

  destroy() {
    this.container.destroy()

    this.dom.replaceChildren()
    this.dom.remove()
  }

  get width() {
    return this.container.width
  }

  get height() {
    return this.container.height
  }

  get visible() {
    return this.container.visible
  }

  get element() {
    return this.dom
  }
}
