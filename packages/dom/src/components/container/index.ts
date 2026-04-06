import type { Context } from '@root/context'

import { Event } from '@music-lyric-player/utils'
import { createStyleKey } from '@root/utils'

import style from './style.module.scss'

export interface ContainerEventMap {
  'change-visible': (visible: boolean) => void
  'change-size': (width: number, height: number) => void
  scroll: (event: globalThis.Event) => void
  wheel: (event: WheelEvent) => void
}

export class Container {
  readonly event: Event<ContainerEventMap> = new Event()

  private context: Context

  private watcher: { resize: ResizeObserver; intersection: IntersectionObserver }
  private current: {
    element: HTMLDivElement
    visible: boolean
    width: number
    height: number
  }

  constructor(context: Context) {
    this.context = context

    this.current = {
      element: document.createElement('div'),
      visible: false,
      width: 0,
      height: 0,
    }

    this.watcher = {
      resize: new ResizeObserver(this.onResize.bind(this)),
      intersection: new IntersectionObserver(this.onIntersection.bind(this)),
    }

    this.watcher.resize.observe(this.current.element)
    this.watcher.intersection.observe(this.current.element)

    const className = context.config.current.container.className
    if (className) {
      this.current.element.classList.add(className)
    } else {
      this.current.element.classList.add(style.container)
    }

    this.current.element.addEventListener('scroll', this.onScroll.bind(this), { passive: false })
    this.current.element.addEventListener('wheel', this.onWheel.bind(this), { passive: false })

    this.context.config.on(this.onConfigUpdate.bind(this))
    this.onConfigUpdate()
  }

  private onIntersection(entries: IntersectionObserverEntry[]) {
    const visible = entries[0]?.isIntersecting ?? false
    this.current.visible = visible
    this.event.emit('change-visible', visible)
  }

  private onResize(entries: ResizeObserverEntry[]) {
    const width = this.current.element.clientWidth
    const height = this.current.element.clientHeight

    this.current.width = width
    this.current.height = height

    this.event.emit('change-size', width, height)
  }

  private onScroll(e: globalThis.Event) {
    this.event.emit('scroll', e)
  }

  private onWheel(e: WheelEvent) {
    this.event.emit('wheel', e)
  }

  private onConfigUpdate() {
    const fontSize = this.context.config.current.container.fontSize
    this.current.element.style.setProperty(createStyleKey('font-size'), `${fontSize}px`)
  }

  appendChild(element: HTMLDivElement) {
    this.current.element.appendChild(element)
  }

  clearChild() {
    this.current.element.innerHTML = ''
  }

  destroy() {
    this.event.clear()
    this.watcher.resize.disconnect()
    this.watcher.intersection.disconnect()
    this.current.element.remove()
  }

  get width() {
    return this.current.width
  }

  get height() {
    return this.current.height
  }

  get visible() {
    return this.current.visible
  }

  get element() {
    return this.current.element
  }
}
