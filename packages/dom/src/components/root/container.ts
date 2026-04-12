import { Event } from '@music-lyric-player/utils'
import { Context } from '@root/context'

import { applyClassName } from '@root/utils'

import Styles from './style.module.scss'

export interface ContainerEventMap {
  'change-visible': (visible: boolean) => void
  'change-size': (width: number, height: number) => void
  scroll: (event: globalThis.Event) => void
  wheel: (event: WheelEvent) => void
}

export class Container {
  readonly event: Event<ContainerEventMap> = new Event()

  private readonly dom: HTMLDivElement
  private readonly resizeObserver: ResizeObserver
  private readonly intersectionObserver: IntersectionObserver

  private size: { width: number; height: number }
  private isVisible: boolean

  constructor(private readonly context: Context) {
    this.size = { width: 0, height: 0 }
    this.isVisible = false

    this.dom = document.createElement('div')

    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.intersectionObserver = new IntersectionObserver(this.handleIntersection)

    this.resizeObserver.observe(this.dom)
    this.intersectionObserver.observe(this.dom)

    this.dom.addEventListener('scroll', this.handleScroll, { passive: false })
    this.dom.addEventListener('wheel', this.handleWheel, { passive: false })

    this.updateConfig()
  }

  private handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const visible = entries[0]?.isIntersecting ?? false
    if (this.isVisible === visible) {
      return
    }

    this.isVisible = visible
    this.event.emit('change-visible', visible)
  }

  private handleResize = (entries: ResizeObserverEntry[]) => {
    const entry = entries[0]
    if (!entry) {
      return
    }

    const { width, height } = entry.contentRect
    if (this.size.width === width && this.size.height === height) {
      return
    }

    this.size = { width, height }
    this.event.emit('change-size', width, height)

    const domStyle = this.dom.style
    domStyle.setProperty('--lyric-player-container-width', `${width}px`)
    domStyle.setProperty('--lyric-player-container-height', `${height}px`)
  }

  private handleScroll = (e: globalThis.Event) => {
    this.event.emit('scroll', e)
  }

  private handleWheel = (e: WheelEvent) => {
    this.event.emit('wheel', e)
  }

  updateConfig() {
    applyClassName(this.dom, [Styles.container])
  }

  appendChild(child: HTMLDivElement) {
    this.dom.appendChild(child)
  }

  clearChild() {
    this.dom.replaceChildren()
  }

  destroy() {
    this.event.clear()

    this.resizeObserver.disconnect()
    this.intersectionObserver.disconnect()

    this.dom.removeEventListener('scroll', this.handleScroll)
    this.dom.removeEventListener('wheel', this.handleWheel)

    this.dom.remove()
  }

  get width() {
    return this.size.width
  }

  get height() {
    return this.size.height
  }

  get visible() {
    return this.isVisible
  }

  get element() {
    return this.dom
  }
}
