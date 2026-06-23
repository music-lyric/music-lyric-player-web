import type { Base } from './base'
import type { Main } from './main'
import type { Annotation } from './annotation'
import type { Slot } from './slot'

export * from './base'
export * from './emphasize'
export * from './animation'
export * from './main'
export * from './annotation'
export * from './slot'

/**
 * Configuration for vocal lyric lines.
 */
export interface Root {
  /**
   * Top‑to‑bottom order of the main vocal line and its annotation rows.
   * Only reorders; visibility stays governed by {@link Annotation} flags, and the main line is always shown.
   * Unknown or duplicate slots are dropped and any missing slot is appended in canonical order, so the effective value is always a full permutation.
   * @default [Slot.AnnotationRoman, Slot.Main, Slot.AnnotationTranslate]
   */
  sort?: readonly Slot[]
  /**
   * Base appearance shared by the main line and, as the root fallback, its annotation rows.
   */
  base?: Base
  /**
   * Main vocal line: rendering mode and per‑mode settings.
   */
  main?: Main
  /**
   * Annotation sub‑lines (translation / romanization).
   */
  annotation?: Annotation
}
