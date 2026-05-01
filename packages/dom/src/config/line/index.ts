import type * as Normal from './normal'
import type * as Interlude from './interlude'

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
   * Vocal line configuration.
   */
  normal?: Normal.Root
  /**
   * Interlude (instrumental) line configuration.
   */
  interlude?: Interlude.Root
}

export type { Normal, Interlude }
