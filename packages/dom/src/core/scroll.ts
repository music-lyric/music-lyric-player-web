import type { BaseLyricPlayer } from '@music-lyric-player/base'
import type { Root } from '@root/components'

export class ScrollManager {
  private scrolling = false
  private active: number = -1
  private timer: any | null = null

  constructor(
    private readonly player: BaseLyricPlayer,
    private readonly root: Root,
    private readonly handleScroll: (line: number, scrolling: boolean) => void,
  ) {
    this.root.event.add('wheel', this.onWheel)
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()

    const currentLines = this.player.currentInfo.lines
    if (!currentLines.length) {
      return
    }

    const direction = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0
    if (direction === 0) {
      return
    }

    if (this.active === -1) {
      this.active = this.player.currentIndex[0] ?? -1
    }

    const nextIndex = this.active + direction
    if (nextIndex < 0 || nextIndex >= currentLines.length) {
      return
    }

    this.scrolling = true
    this.active = nextIndex
    this.handleScroll(nextIndex, true)
    this.updateTimer()
  }

  private updateTimer() {
    this.clearTimer()
    this.timer = setTimeout(() => {
      this.scrolling = false
      this.active = -1
      this.timer = null
      this.handleScroll(-1, false)
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
