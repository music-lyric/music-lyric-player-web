import type { BaseLyricPlayer } from '@music-lyric-player/base'
import type { Config } from '@root/config'
import type { ComponentContext, Root, Container, Style } from '@root/components'

interface ScrollState {
  active: boolean
  activeIndex: number
}
interface LayoutState {
  frameId: number | null
}
interface ComponentState {
  root: Root
  container: Container
  style: Style
  context: ComponentContext
}

export class CoreContext {
  private isDestroyed = false

  public readonly player: BaseLyricPlayer
  public readonly config: Config.RootManager
  public readonly component: ComponentState
  public readonly scroll: ScrollState = {
    active: false,
    activeIndex: -1,
  }
  public readonly layout: LayoutState = {
    frameId: null,
  }

  constructor(
    player: BaseLyricPlayer,
    config: Config.RootManager,
    root: Root,
    container: Container,
    style: Style,
    componentContext: ComponentContext,
  ) {
    this.player = player
    this.config = config
    this.component = { root, container, style, context: componentContext }
  }

  get destroyed() {
    return this.isDestroyed
  }

  get isHideInterlude() {
    return this.config.current.line.interlude.style.normal.opacity <= 0
  }

  requestFrame(callback: () => void) {
    if (this.isDestroyed) {
      return
    }

    this.cancelFrame()

    this.layout.frameId = requestAnimationFrame(() => {
      this.layout.frameId = null

      if (this.isDestroyed) {
        return
      }

      callback()
    })
  }

  cancelFrame() {
    if (this.layout.frameId !== null) {
      cancelAnimationFrame(this.layout.frameId)
      this.layout.frameId = null
    }
  }

  destroy() {
    this.isDestroyed = true

    this.cancelFrame()

    this.scroll.active = false
    this.scroll.activeIndex = -1
  }
}
