import type { ComponentContext } from '@root/components/context'
import type { ConfigKeySet } from '@root/config'
import type { ContainerEventMap } from './container'

import { Event } from '@music-lyric-player/utils'

import { Container } from './container'
import { Style } from './style'

import { applyClassName } from '@root/utils'

import Styles from './style.module.scss'

export class Root {
  readonly event: Event<ContainerEventMap>

  private readonly container: Container
  private readonly style: Style

  private readonly dom: HTMLDivElement

  constructor(private readonly context: ComponentContext) {
    this.dom = document.createElement('div')
    applyClassName(this.dom, [Styles.root])

    const style = new Style(context, this.dom)
    this.style = style

    const container = new Container(context, this.dom)
    this.container = container
    this.event = container.event

    this.updateConfig()
  }

  updateConfig(keys?: ConfigKeySet) {
    this.container.updateConfig()
    this.style.updateConfig(keys)
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
