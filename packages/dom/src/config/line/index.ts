import * as Interlude from './interlude'

import * as Normal from './normal'

/**
 * Lyric line configuration.
 *
 * Splits into:
 * - {@link Normal}    — vocal lines (with optional translation / romanization)
 * - {@link Interlude} — instrumental gaps between vocal segments
 */
export interface Root {
  /**
   * Extra CSS class appended to every line wrapper.
   * @default ""
   */
  className?: string
  /**
   * Number of lines on each side of the active line that keep their per-line animations built and stay promoted to a compositor layer.
   * Larger values reduce pops when the active line changes quickly, at the cost of more simultaneous animations and layers.
   * @default 2
   * @min 0
   */
  animationWindow?: number
  /**
   * Vocal line configuration.
   */
  normal?: Normal.Root
  /**
   * Interlude (instrumental) line configuration.
   */
  interlude?: Interlude.Root
}

export { Normal, Interlude }
