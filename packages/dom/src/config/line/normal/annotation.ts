import type { Base } from './base'

/**
 * Translation sub‑line.
 *
 * Inherits from {@link Base}; values left unset fall back to `annotation.base`.
 */
export interface Translate extends Base {
  /**
   * Whether to show the translation line.
   * @default true
   */
  visible?: boolean
}

/**
 * Romanization (e.g. pinyin) sub‑line.
 *
 * Inherits from {@link Base}; values left unset fall back to `annotation.base`.
 */
export interface Roman extends Base {
  /**
   * Whether to show the romanization line.
   * @default false
   */
  visible?: boolean
}

/**
 * Annotation sub‑lines rendered beneath the main vocal line
 * (translation and romanization).
 */
export interface Annotation {
  /**
   * Master switch for all annotation sub‑lines.
   * When `false`, both `translate` and `roman` are hidden regardless of their
   * individual `visible` settings.
   * @default true
   */
  visible?: boolean
  /**
   * Shared base for all annotation sub‑lines.
   * Each specific sub‑line inherits these values unless overridden.
   */
  base?: Base
  /**
   * Translation sub‑line overrides.
   */
  translate?: Translate
  /**
   * Romanization sub‑line overrides.
   */
  roman?: Roman
}
