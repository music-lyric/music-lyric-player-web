import type { Line } from '@music-lyric-kit/lyric'
import type { ConfigRequired } from '@root/config'

import { DEFAULT_CONFIG } from '@root/config'
import { Info } from '@music-lyric-kit/lyric'
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { ConfigManager } from '@music-lyric-player/utils'

import { Context } from '@root/context'
import { ConfigClient } from '@root/config'
import { Root } from '@root/components'

import { ScrollManager } from './scroll'
import { LineManager } from './line'
import { LayoutManager } from './layout'

export class DomLyricPlayer {
  public config: ConfigClient

  private context: Context
  private player: BaseLyricPlayer

  private root: Root

  private scrollManager: ScrollManager
  private lineManager: LineManager
  private layoutManager: LayoutManager

  constructor(player: BaseLyricPlayer) {
    const config = new ConfigManager(DEFAULT_CONFIG as ConfigRequired, {})
    const context = new Context(config)
    const root = new Root(context)

    this.config = config
    this.context = context
    this.root = root
    this.player = player

    this.lineManager = new LineManager(context, config, root)
    this.scrollManager = new ScrollManager(this.player, this.root, this.handleScroll.bind(this))
    this.layoutManager = new LayoutManager(config, this.player, this.root, this.lineManager, this.scrollManager)

    this.player.event.add('play', this.onPlay)
    this.player.event.add('pause', this.onPause)
    this.player.event.add('lyricUpdate', this.onLyricUpadte)
    this.player.event.add('linesUpdate', this.onLinesUpdate)

    this.root.event.add('change-size', this.onSizeUpdate)

    this.config.event.add('update', this.onConfigUpdate)
  }

  private onSizeUpdate = () => {
    requestAnimationFrame(() => {
      this.lineManager.updateSize()
      this.layoutManager.update()
    })
  }

  private onConfigUpdate = () => {
    this.root.updateConfig()
    this.lineManager.updateConfig()
    requestAnimationFrame(() => {
      this.lineManager.updateSize()
      this.layoutManager.update()
    })
  }

  private onPlay = (currentTime: number) => {
    requestAnimationFrame(() => {
      this.layoutManager.update()
    })
  }

  private onPause = (currentTime: number) => {
    for (const [index, element] of this.lineManager.elementMap) {
      const isActive = this.lineManager.isActiveElement(index, this.player.currentIndex)
      element.pause(currentTime, isActive)
    }
  }

  private onLyricUpadte = (info: Info) => {
    this.scrollManager.clear()
    this.lineManager.updateLines(this.player.currentInfo.lines)
    requestAnimationFrame(() => {
      this.lineManager.updateSize()
      this.layoutManager.update()
    })
  }

  private onLinesUpdate = (lines: Line[], indexs: number[], index: number, isSeek: boolean) => {
    requestAnimationFrame(() => {
      this.layoutManager.update(isSeek)
    })
  }

  private handleScroll(line: number, scrolling: boolean) {
    if (scrolling) {
      this.root.setAttribute('scrolling')
    } else {
      this.root.removeAttribute('scrolling')
    }
    this.layoutManager.update()
  }

  get element() {
    return this.root.element
  }

  destroy() {
    this.player.event.remove('play', this.onPlay)
    this.player.event.remove('pause', this.onPause)
    this.player.event.remove('lyricUpdate', this.onLyricUpadte)
    this.player.event.remove('linesUpdate', this.onLinesUpdate)

    this.root.event.remove('change-size', this.onSizeUpdate)
    this.config.event.remove('update', this.onConfigUpdate)

    this.scrollManager.destroy()
    this.lineManager.destroy()
  }
}
