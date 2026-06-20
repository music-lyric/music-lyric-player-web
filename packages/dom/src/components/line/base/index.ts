import type { ComponentContext } from '@root/components/context'
import type { DomLyricPlayerConfig } from '@root/config'

import { applyClassName, buildLineVariableKey } from '@root/utils'

import styles from './index.module.scss'

const ANIMATION_DURATION_KEY = buildLineVariableKey('animation', '', 'duration')
const ANIMATION_DELAY_KEY = buildLineVariableKey('animation', '', 'delay')

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

  private readonly wrapper: {
    dom: HTMLDivElement
    width: number
    height: number
    index: number
    active: boolean
    animated: boolean
    played: boolean
    position: string
    style: LineElementStyle
  }

  constructor(protected readonly context: ComponentContext) {
    this.wrapper = {
      dom: document.createElement('div'),
      width: 0,
      height: 0,
      index: -1,
      active: false,
      animated: false,
      played: false,
      position: '',
      style: {},
    }

    this.wrapper.dom.addEventListener('click', this.handleClick)
    this.wrapper.dom.addEventListener('contextmenu', this.handleContextMenu)
  }

  private handleClick = (event: MouseEvent) => {
    this.context.event.emit('lineClick', this.wrapper.index, event)
  }

  private handleContextMenu = (event: MouseEvent) => {
    this.context.event.emit('lineContextMenu', this.wrapper.index, event)
  }

  updateSize() {
    this.wrapper.width = this.wrapper.dom.clientWidth
    this.wrapper.height = this.wrapper.dom.clientHeight
  }

  updateConfig(keys?: DomLyricPlayerConfig.RootKeySet) {
    if (!keys || keys.has('line.className')) {
      applyClassName(this.wrapper.dom, [styles.wrapper, this.context.config.line.className])
    }
  }

  updateStyle(current: LineElementStyle) {
    const prev = this.wrapper.style

    const style = this.wrapper.dom.style

    // `transform` aggregates left / top / scale; rebuild only if any of them changed.
    if (current.top !== prev.top || current.left !== prev.left || current.scale !== prev.scale) {
      style.transform = `translate(${current.left || 0}px, ${current.top || 0}px) scale(${current.scale || 1})`
    }

    // Pushed to the wrapper as CSS vars so the scss transition can derive per-property timing from them:
    // `transform` uses them as-is, while `opacity` / `filter` run at a fraction of the duration to lead the move.
    if (current.transitionDuration !== prev.transitionDuration) {
      style.setProperty(ANIMATION_DURATION_KEY, `${current.transitionDuration || 0}ms`)
    }

    if (current.transitionDelay !== prev.transitionDelay) {
      style.setProperty(ANIMATION_DELAY_KEY, `${current.transitionDelay || 0}ms`)
    }

    // `opacity` depends on both `hide` (override to 0) and `opacity` itself.
    if (current.hide !== prev.hide || current.opacity !== prev.opacity) {
      style.opacity = current.hide ? '0' : current.opacity ? `${current.opacity}` : ''
    }

    if (current.blur !== prev.blur) {
      style.filter = current.blur ? `blur(${current.blur}px)` : ''
    }

    prev.top = current.top
    prev.left = current.left
    prev.scale = current.scale
    prev.opacity = current.opacity
    prev.blur = current.blur
    prev.hide = current.hide
    prev.transitionDelay = current.transitionDelay
    prev.transitionDuration = current.transitionDuration
  }

  abstract play(time: number, isActive: boolean): void

  abstract pause(time: number, isActive: boolean): void

  abstract reset(time: number): void

  destroy(): void {
    this.wrapper.dom.removeEventListener('click', this.handleClick)
    this.wrapper.dom.removeEventListener('contextmenu', this.handleContextMenu)
    this.wrapper.dom.replaceChildren()
    this.wrapper.dom.remove()
  }

  set index(value: number) {
    this.wrapper.index = value
  }
  get index() {
    return this.wrapper.index
  }

  set active(value: boolean) {
    if (value === this.wrapper.active) {
      return
    }
    if (value) {
      this.wrapper.dom.setAttribute('active', '')
    } else {
      this.wrapper.dom.removeAttribute('active')
    }
    this.wrapper.active = value
  }
  get active() {
    return this.wrapper.active
  }

  // Whether this line is inside the animation window (active line ± buffer), set by layout each frame.
  set animated(value: boolean) {
    if (value === this.wrapper.animated) {
      return
    }
    if (value) {
      this.wrapper.dom.setAttribute('animated', '')
    } else {
      this.wrapper.dom.removeAttribute('animated')
    }
    this.wrapper.animated = value
  }
  get animated() {
    return this.wrapper.animated
  }

  set played(value: boolean) {
    if (value === this.wrapper.played) {
      return
    }
    if (value) {
      this.wrapper.dom.setAttribute('played', '')
    } else {
      this.wrapper.dom.removeAttribute('played')
    }
    this.wrapper.played = value
  }
  get played() {
    return this.wrapper.played
  }

  set position(value: string) {
    if (value === this.wrapper.position) {
      return
    }
    this.wrapper.dom.setAttribute('position', value)
    this.wrapper.position = value
  }
  get position() {
    return this.wrapper.position
  }

  get height() {
    return this.wrapper.height
  }
  get width() {
    return this.wrapper.width
  }

  get element() {
    return this.wrapper.dom
  }
}
