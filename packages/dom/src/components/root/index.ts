import { applyClassName } from '@root/utils'
import { createRandomHex } from '@music-lyric-player/utils'

import styles from './index.module.scss'

const INSTANCE_ATTRIBUTE = 'lyric-player-instance-id'

export class Root {
  private readonly id: string
  private readonly dom: HTMLDivElement

  constructor() {
    this.id = createRandomHex(3)

    this.dom = document.createElement('div')
    this.dom.setAttribute(INSTANCE_ATTRIBUTE, this.id)
    applyClassName(this.dom, [styles.root])
  }

  destroy() {
    this.dom.replaceChildren()
    this.dom.remove()
  }

  /**
   * The outermost DOM element that consumers attach to the page.
   */
  get element() {
    return this.dom
  }

  /**
   * Unique id of this player instance, also reflected on the root element via the `lyric-player-instance` attribute.
   */
  get instanceId() {
    return this.id
  }

  /**
   * CSS selector that uniquely targets this root element. Combines the scoped
   * class with a per-instance attribute so StyleManager's runtime CSS variables
   * stay isolated when multiple players coexist on the page.
   */
  get scope() {
    return `.${styles.root}[${INSTANCE_ATTRIBUTE}="${this.id}"]`
  }
}
