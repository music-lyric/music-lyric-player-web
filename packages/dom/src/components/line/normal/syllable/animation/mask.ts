import type { LineNormal, WordNormal } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { Config } from '@root/config'

export class MaskAnimation {
  private animation: Animation | null = null
  private delay: number = 0

  constructor(
    private readonly host: HTMLDivElement,
    private readonly context: ComponentContext,
    private readonly wordInfo: WordNormal,
    private readonly lineInfo: LineNormal,
  ) {}

  updateInfo(image: string, size: string, animation?: Animation) {
    const style = this.host.style
    style.maskImage = image
    style.maskSize = size

    this.dispose()
    if (animation) {
      this.animation = animation
      this.animation.pause()
    }
  }

  updateStyle(isPlay: boolean, isActive: boolean, currentTime: number, relativeTime: number) {
    if (!this.animation) {
      return
    }

    if (!isActive) {
      this.animation.currentTime = 0
      this.animation.finish()
      return
    }

    const delay = relativeTime < 0 ? -relativeTime : 0
    if (this.delay !== delay) {
      this.delay = delay
      this.animation.effect!.updateTiming({ delay })
    }

    const isFinished = currentTime >= this.wordInfo.time.end
    if (isFinished && this.animation.playState === 'finished') {
      return
    }

    this.animation.playbackRate = 1
    this.animation.currentTime = relativeTime < 0 ? 0 : relativeTime > this.lineInfo.time.duration ? this.lineInfo.time.duration : relativeTime
    if (isPlay) {
      this.animation.play()
    } else {
      this.animation.pause()
    }
  }

  updateConfig(keys?: Config.RootKeySet) {
    // pass
  }

  dispose() {
    this.animation?.cancel()
    this.animation = null
    this.delay = 0
  }
}
