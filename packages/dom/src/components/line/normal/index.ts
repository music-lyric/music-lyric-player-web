import type { LineNormal } from '@music-lyric-kit/lyric'
import type { Context } from '@root/context'

import { BaseLineElement, LineElementType } from '../wrapper'

import { MainNode } from './main'
import { ExtendedNode } from './extended'

import { applyClassName } from '@root/utils'

import Style from './style.module.scss'

export class NormalLineElement extends BaseLineElement {
  override get type() {
    return LineElementType.Normal as const
  }

  private readonly info: LineNormal
  private readonly isBackgroundLine: boolean

  private container: HTMLDivElement

  private main!: MainNode
  private extended!: ExtendedNode

  constructor(context: Context, info: LineNormal, isBackground: boolean) {
    super(context)

    this.info = info
    this.isBackgroundLine = isBackground

    this.container = document.createElement('div')
    this.wrapper.appendChild(this.container)

    this.init()
    this.updateConfig()
  }

  private init() {
    this.main = new MainNode(this.context, this.info)
    this.container.appendChild(this.main.element)

    if (this.info.content.extended.length && this.context.config.line.normal.extended.visible) {
      this.extended = new ExtendedNode(this.context, this.info)
      this.container.appendChild(this.extended.element)
    }
  }

  override updateConfig() {
    const className = [Style.normal, this.context.config.line.normal.className, this.isBackgroundLine ? Style.background : '']
    applyClassName(this.container, className)

    super.updateConfig()
    this.main?.updateConfig()
    this.extended?.updateConfig()
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

  get isBackground() {
    return this.isBackgroundLine
  }
}
