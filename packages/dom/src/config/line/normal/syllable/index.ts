import type { Base } from '../base'
import type { Word } from './word'
import type { Roman } from './annotation'

export * from './animation'
export * from './word'
export * from './annotation'

/**
 * Renderable units within a word, used by {@link Root.sort} to stack them top‑to‑bottom.
 */
export enum WordSlot {
  /**
   * The word's main text.
   */
  Word = 'word',
  /**
   * The per‑word romanization that follows the word.
   */
  Roman = 'word-roman',
  /**
   * The per‑word ruby (furigana). Reserved slot — not rendered yet.
   */
  Ruby = 'word-ruby',
}

/**
 * Syllable (word‑by‑word karaoke) settings for the main line.
 *
 * Inherits from {@link Base}; values left unset fall back to the line base.
 */
export interface Root extends Base {
  /**
   * Top‑to‑bottom order of the word text and its per‑word annotation rows (romanization, ruby).
   * Unknown or duplicate slots are dropped and missing ones appended, so the effective value is always a full permutation.
   * @default [WordSlot.Roman, WordSlot.Word, WordSlot.Ruby]
   */
  sort?: readonly WordSlot[]
  /**
   * Horizontal gap in `px` between adjacent words that carry per‑word annotation rows; words without any row stay flush.
   * @default 3
   * @min 0
   */
  gap?: number
  /**
   * The main word text and its own settings (animation).
   */
  word?: Word
  /**
   * Per‑word romanization following each syllable.
   */
  roman?: Roman
}
