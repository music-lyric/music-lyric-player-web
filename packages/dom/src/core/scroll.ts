import { BaseLyricPlayer } from '@music-lyric-player/base'
import { Root } from '@root/components'
import { ConfigClient } from '@root/config'

export class ScrollHandler {
  private scrolling = false
  private active: number = -1
  private timer: any | null = null

  constructor(
    private readonly player: BaseLyricPlayer,
    private readonly config: ConfigClient,
    private readonly root: Root,
    private readonly onChange: (line: number, scrolling: boolean) => void,
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

    this.scrolling = true
    this.active = nextIndex
    this.onChange(nextIndex, true)
    this.updateTimer()
  }

  private updateTimer() {
    this.clearTimer()
    this.timer = setTimeout(() => {
      this.scrolling = false
      this.active = -1
      this.timer = null
      this.onChange(-1, false)
    }, 3 * 1000)
  }

  private clearTimer() {
    if (this.timer !== null) {
      clearTimeout(this.timer)
    }
  }

  clear() {
    this.clearTimer()
    this.active = -1
  }

  destroy() {
    this.clearTimer()
    this.root.event.remove('wheel', this.onWheel)
  }

  get current() {
    return {
      scrolling: this.scrolling,
      active: this.active,
    }
  }
}
