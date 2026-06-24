import type { Roman } from './roman'
import type { Ruby } from './ruby'

export * from './roman'
export * from './ruby'

export interface Annotation {
  /**
   * Horizontal gap in `px` between adjacent words that carry annotation rows; words without any row stay flush.
   * @default 3
   * @min 0
   */
  gap?: number
  /**
   * Per‑word romanization following each syllable.
   */
  roman?: Roman
  /**
   * Per‑word ruby (furigana) riding above each syllable.
   */
  ruby?: Ruby
}
