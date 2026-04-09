import { Event } from '@music-lyric-player/utils'
import { Context } from '@root/context'

import { applyClassName, createStyleKey } from '@root/utils'

import Style from './style.module.scss'

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

  private width = 0
  private height = 0
  private isVisible = false

  constructor(private readonly context: Context) {
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
    if (this.width === width && this.height === height) {
      return
    }

    this.width = width
    this.height = height

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
    const { style } = this.context.config
    applyClassName(this.dom, [Style.container, style.className.container])

    const domStyle = this.dom.style
    domStyle.setProperty(createStyleKey('font-size'), `${style.fontSize}px`)
    domStyle.setProperty(createStyleKey('font-weight'), `${style.fontWeight}`)
    domStyle.setProperty(createStyleKey('font-family'), `${style.fontFamily}`)
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

  get clientWidth() {
    return this.width
  }

  get clientHeight() {
    return this.height
  }

  get visible() {
    return this.isVisible
  }

  get element() {
    return this.dom
  }
}
