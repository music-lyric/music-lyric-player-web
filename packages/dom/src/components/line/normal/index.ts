import type { LineNormal } from '@music-lyric-kit/lyric'
import type { Context } from '@root/context'

import { BaseLineElement, LineElementType } from '../wrapper'

import { MainNode } from './main'
import { ExtendedNode } from './extended'

import { applyClassName } from '@root/utils'

import Style from './style.module.scss'

export class NormalLineElement extends BaseLineElement {
  override get type(): LineElementType {
    return LineElementType.Normal
  }

  private container: HTMLDivElement

  private main!: MainNode
  private extended!: ExtendedNode

  constructor(
    context: Context,
    private readonly info: LineNormal,
  ) {
    super(context)

    this.container = document.createElement('div')
    this.wrapper.appendChild(this.container)

    this.init()
    this.updateConfig()
  }

  private init() {
    this.main = new MainNode(this.context, this.info)
    this.container.appendChild(this.main.element)

    if (this.info.content.extended.length) {
      this.extended = new ExtendedNode(this.context, this.info)
      this.container.appendChild(this.extended.element)
    }
  }

  override updateConfig() {
    super.updateConfig()
    applyClassName(this.container, [Style.normal, this.context.config.style.className.line.normal.wrapper])
  }

  override play(time: number, isActive: boolean) {
    this.main.play(time, isActive)
  }

  override pause(time: number, isActive: boolean) {
    this.main.pause(time, isActive)
  }

  override reset() {
    this.main.reset()
  }
}
