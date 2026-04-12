import { BaseLyricPlayer } from '@music-lyric-player/base'
import { Root } from '@root/components'
import { ConfigClient } from '@root/config'

export class ScrollHandler {
  private active: number | null = null
  private timer: any | null = null

  constructor(
    private readonly player: BaseLyricPlayer,
    private readonly config: ConfigClient,
    private readonly root: Root,
  ) {
    this.root.event.add('wheel', this.onWheel)
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()

    const currentLines = this.player.currentLines.length
    if (!currentLines) {
      return
    }

    const direction = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0
    if (direction === 0) {
      return
    }

    if (this.active === null) {
      this.active = this.player.currentActive
    }

    const nextIndex = this.active + direction
    if (nextIndex < 0 || nextIndex >= this.player.currentInfo.lines.length) {
      return
    }

    this.active = nextIndex
    this.onScroll(nextIndex)
    this.updateTimer()
  }

  private updateTimer() {
    this.clearTimer()
    this.timer = setTimeout(() => {
      this.timer = null
      this.active = null
      this.onScroll(-1)
    }, 3 * 1000)
  }

  private clearTimer() {
    if (this.timer !== null) {
      clearTimeout(this.timer)
    }
  }

  clear() {
    this.clearTimer()
    this.active = null
  }

  destroy() {
    this.clearTimer()
    this.root.event.remove('wheel', this.onWheel)
  }

  onScroll(line: number) {}
}
