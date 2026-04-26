import type { BaseLyricPlayer } from '@music-lyric-player/base'
import type { ConfigClient } from '@root/config'
import type { ComponentContext, Root } from '@root/components'

interface ScrollState {
  active: boolean
  activeIndex: number
}
interface LayoutState {
  frameId: number | null
}
interface ComponentState {
  root: Root
  context: ComponentContext
}

export class CoreContext {
  private isDestroyed = false

  public readonly player: BaseLyricPlayer
  public readonly config: ConfigClient
  public readonly component: ComponentState
  public readonly scroll: ScrollState = {
    active: false,
    activeIndex: -1,
  }
  public readonly layout: LayoutState = {
    frameId: null,
  }

  constructor(player: BaseLyricPlayer, config: ConfigClient, root: Root, componentContext: ComponentContext) {
    this.player = player
    this.config = config
    this.component = { root, context: componentContext }
  }

  get destroyed() {
    return this.isDestroyed
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
