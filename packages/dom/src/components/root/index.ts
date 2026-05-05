import { applyClassName } from '@root/utils'

import styles from './index.module.scss'

export class Root {
  private readonly dom: HTMLDivElement

  constructor() {
    this.dom = document.createElement('div')
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
   * CSS selector that targets this root element. Used by Style to scope
   * runtime CSS variables.
   */
  get scope() {
    return `.${styles.root}`
  }
}
