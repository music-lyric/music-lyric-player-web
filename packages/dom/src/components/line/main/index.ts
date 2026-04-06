import { Context } from '@root/context'
import { BaseLine } from '../base'
import { Line, LineType } from '@music-lyric-kit/lyric'
import { NormalLine } from './normal'

export interface MainLineParams {
  context: Context
  index: number
  line: Line
}

export class MainLine extends BaseLine {
  override get type(): 'main' | 'producer' {
    return 'main'
  }

  private info: Line

  constructor({ context, index, line }: MainLineParams) {
    super(context, index)
    this.info = line

    if (this.info.type !== LineType.Normal) {
      return
    }

    const normal = new NormalLine({ context, info: this.info })
    this.current.element.appendChild(normal.element)
  }

  override play(time: number, isActive: boolean): void {}

  override pause(time: number, isActive: boolean): void {}

  override reset(): void {}
}
