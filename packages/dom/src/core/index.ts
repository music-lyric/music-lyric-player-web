import type { Line, Info } from '@music-lyric-kit/lyric'
import type { ConfigKeySet, ConfigRequired } from '@root/config'

import { DEFAULT_CONFIG } from '@root/config'
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { ConfigManager } from '@music-lyric-player/utils'

import { ConfigClient } from '@root/config'
import { ComponentContext, Root, Container, Style } from '@root/components'

import { CoreContext } from './context'
import { ScrollManager } from './scroll'
import { LineManager } from './line'
import { LayoutManager } from './layout'

export class DomLyricPlayer {
  public config: ConfigClient

  private context: CoreContext
  private player: BaseLyricPlayer

  private root: Root
  private container: Container
  private style: Style

  private scrollManager: ScrollManager
  private lineManager: LineManager
  private layoutManager: LayoutManager

  private pendingUpdateSize = false
  private pendingIsSeek = false

  constructor(player: BaseLyricPlayer) {
    const config = new ConfigManager(DEFAULT_CONFIG as ConfigRequired, {})

    const componentContext = new ComponentContext(config)

    const root = new Root()
    const container = new Container(componentContext, root.element)
    const style = new Style(componentContext, root.element, root.scope)

    const context = new CoreContext(player, config, root, container, style, componentContext)

    this.config = config
    this.context = context
    this.player = player

    this.root = root
    this.container = container
    this.style = style

    this.lineManager = new LineManager(context)
    this.scrollManager = new ScrollManager(context, this.handleScroll)
    this.layoutManager = new LayoutManager(context, this.lineManager)

    this.player.event.add('play', this.onPlay)
    this.player.event.add('pause', this.onPause)
    this.player.event.add('lyricUpdate', this.onLyricUpdate)
    this.player.event.add('linesUpdate', this.onLinesUpdate)

    this.container.event.add('change-size', this.onSizeUpdate)

    this.config.event.add('update', this.onConfigUpdate)
  }

  private scheduleLayoutUpdate(options?: { updateSize?: boolean; isSeek?: boolean }) {
    this.pendingUpdateSize = this.pendingUpdateSize || Boolean(options?.updateSize)
    this.pendingIsSeek = this.pendingIsSeek || Boolean(options?.isSeek)

    this.context.requestFrame(() => {
      const updateSize = this.pendingUpdateSize
      const isSeek = this.pendingIsSeek

      this.pendingUpdateSize = false
      this.pendingIsSeek = false

      if (updateSize) {
        this.lineManager.updateSize()
      }

      this.layoutManager.update(isSeek)
    })
  }

  private onSizeUpdate = () => {
    this.scheduleLayoutUpdate({
      updateSize: true,
    })
  }

  private onConfigUpdate = (keys: ConfigKeySet) => {
    this.container.updateConfig()
    this.style.updateConfig(keys)
    this.lineManager.updateConfig(keys)

    this.scheduleLayoutUpdate({
      updateSize: true,
    })
  }

  private onPlay = (_currentTime: number) => {
    this.scheduleLayoutUpdate()
  }

  private onPause = (currentTime: number) => {
    const activeElementSet = this.lineManager.queryActiveElementSet(this.player.currentIndex)

    for (const [index, element] of this.lineManager.elementMap) {
      element.pause(currentTime, activeElementSet.has(index))
    }
  }

  private onLyricUpdate = (_info: Info) => {
    this.scrollManager.clear()
    this.lineManager.updateLines(this.player.currentInfo.lines)
    this.layoutManager.reset()
    this.scheduleLayoutUpdate({
      updateSize: true,
    })
  }

  private onLinesUpdate = (_lines: Line[], _indexes: number[], _index: number, isSeek: boolean) => {
    this.scheduleLayoutUpdate({
      isSeek,
    })
  }

  private handleScroll = (_line: number, scrolling: boolean) => {
    if (this.context.destroyed) {
      return
    }

    if (scrolling) {
      this.container.setAttribute('scrolling')
    } else {
      this.container.removeAttribute('scrolling')
    }

    this.layoutManager.update()
  }

  get element() {
    return this.root.element
  }

  destroy() {
    this.player.event.remove('play', this.onPlay)
    this.player.event.remove('pause', this.onPause)
    this.player.event.remove('lyricUpdate', this.onLyricUpdate)
    this.player.event.remove('linesUpdate', this.onLinesUpdate)

    this.container.event.remove('change-size', this.onSizeUpdate)
    this.config.event.remove('update', this.onConfigUpdate)

    this.context.destroy()

    this.scrollManager.destroy()
    this.lineManager.destroy()

    this.style.destroy()
    this.container.destroy()
    this.root.destroy()
  }
}
