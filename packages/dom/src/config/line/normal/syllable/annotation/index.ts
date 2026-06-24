import type { Roman } from './roman'

export * from './roman'

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
}
