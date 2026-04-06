import { Info, Line } from '@music-lyric-kit/lyric'
import { BaseLyricPlayer } from '@music-lyric-player/base'
import { Container, MainLine } from '@root/components'
import { BaseLine } from '@root/components/line/base'
import { NormalLine } from '@root/components/line/main/normal'
import { ConfigClient, ConfigInstance } from '@root/config'
import { Context } from '@root/context'

export class DomLyricPlayer {
  public config = ConfigInstance

  private context: Context
  private player: BaseLyricPlayer

  private container: Container
  private lines: BaseLine[]

  private onDestroy: Array<() => void> = []

  constructor(player: BaseLyricPlayer) {
    this.context = {
      config: this.config,
    }
    this.player = player

    this.container = new Container(this.context)
    this.lines = []

    const onLyricUpadte = this.onLyricUpadte.bind(this)
    const onLinesUpdate = this.onLinesUpdate.bind(this)

    this.player.event.add('lyric-update', onLyricUpadte)
    this.player.event.add('lines-update', onLinesUpdate)
    this.onDestroy.push(() => {
      this.player.event.remove('lyric-update', onLyricUpadte)
      this.player.event.remove('lines-update', onLinesUpdate)
    })
  }

  private onLyricUpadte(info: Info) {
    this.handleInitLines()
  }
  private onLinesUpdate(lines: Line[]) {
    console.log(lines)
  }

  private handleClearLines() {
    for (const line of this.lines) {
      line.destroy()
    }
    this.lines = []
  }
  private handleInitLines() {
    const result = []

    for (const line of this.player.currentInfo.lines) {
      const element = new MainLine({
        context: this.context,
        line,
        index: 0,
      })
      result.push(element)
    }

    this.handleClearLines()
    for (const line of result) {
      this.container.appendChild(line.element)
    }

    this.lines = result
  }

  get element() {
    return this.container.element
  }
}
