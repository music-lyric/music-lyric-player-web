import type { LineNormal } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'
import type { Config } from '@root/config'

import { BaseLineElement, LineElementType } from '../wrapper'
import { MainElement } from './main'
import { ExtendedElement } from './extended'

import { applyClassName } from '@root/utils'

import styles from './index.module.scss'

export class NormalLineElement extends BaseLineElement {
  override get type() {
    return LineElementType.Normal as const
  }

  private readonly info: LineNormal
  private readonly isBackgroundLine: boolean

  private container: HTMLDivElement

  private main: MainElement | null = null
  private extended: ExtendedElement | null = null

  constructor(context: ComponentContext, info: LineNormal, isBackground: boolean) {
    super(context)

    this.info = info
    this.isBackgroundLine = isBackground

    this.container = document.createElement('div')
    this.element.appendChild(this.container)

    this.updateConfig()
  }

  private applyClassName() {
    const className = [styles.normal, this.context.config.line.normal.base.className, this.isBackgroundLine ? styles.background : '']
    applyClassName(this.container, className)
  }

  private buildMain() {
    this.removeMain()
    this.main = new MainElement(this.context, this.info)
    this.container.appendChild(this.main.element)
  }
  private removeMain() {
    this.main?.dispose()
    this.main = null
  }

  private buildExtended() {
    this.removeExtended()
    this.extended = new ExtendedElement(this.context, this.info)
    this.container.appendChild(this.extended.element)
  }
  private removeExtended() {
    this.extended?.dispose()
    this.extended = null
  }
  private get needShowExtended() {
    return this.info.content.extended.length > 0 && this.context.config.line.normal.extended.visible
  }

  override updateConfig(keys?: Config.RootKeySet) {
    super.updateConfig(keys)

    if (!keys) {
      this.container.replaceChildren()
      this.applyClassName()
      this.buildMain()
      if (this.needShowExtended) {
        this.buildExtended()
      } else {
        this.removeExtended()
      }
      return
    }

    if (keys.has('line.normal.base.className')) {
      this.applyClassName()
    }

    if (keys.has('line.normal.extended.visible')) {
      if (this.needShowExtended && !this.extended) {
        this.buildExtended()
      } else if (!this.needShowExtended && this.extended) {
        this.removeExtended()
      }
    }

    this.main?.updateConfig(keys)
    this.extended?.updateConfig(keys)
  }

  override play(time: number, isActive: boolean) {
    this.main?.play(time, isActive)
  }

  override pause(time: number, isActive: boolean) {
    this.main?.pause(time, isActive)
  }

  override reset() {
    this.main?.reset()
  }

  override destroy() {
    this.removeMain()
    this.removeExtended()
    super.destroy()
  }

  get isBackground() {
    return this.isBackgroundLine
  }
}
