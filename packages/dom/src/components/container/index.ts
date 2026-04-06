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

    this.current.element.addEventListener('scroll', this.onScroll.bind(this), { passive: false })
    this.current.element.addEventListener('wheel', this.onWheel.bind(this), { passive: false })

    this.updateConfig()
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

    this.current.element.style.setProperty('--lyric-player-container-width', `${width}`)
    this.current.element.style.setProperty('--lyric-player-container-height', `${height}`)
  }

  private onScroll(e: globalThis.Event) {
    this.event.emit('scroll', e)
  }

  private onWheel(e: WheelEvent) {
    this.event.emit('wheel', e)
  }

  updateConfig() {
    const classNames = [Style.container, this.context.config.style.className.container]
    applyClassName(this.current.element, classNames)

    const fontSize = this.context.config.style.fontSize
    this.current.element.style.setProperty(createStyleKey('font-size'), `${fontSize}px`)
    const fontWeight = this.context.config.style.fontWeight
    this.current.element.style.setProperty(createStyleKey('font-weight'), `${fontWeight}`)
    const fontFamily = this.context.config.style.fontFamily
    this.current.element.style.setProperty(createStyleKey('font-family'), `${fontFamily}`)
  }

  appendChild(element: HTMLDivElement) {
    this.current.element.appendChild(element)
  }

  clearChild() {
    this.current.element.replaceChildren()
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
