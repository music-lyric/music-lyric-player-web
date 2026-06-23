import type { Base } from './base'
import type { SyllableAnimation } from './animation'

/**
 * Syllable (word‑by‑word karaoke) settings for the main line.
 *
 * Inherits from {@link Base}; values left unset fall back to the line {@link Root.base}.
 */
export interface MainSyllable extends Base {
  /**
   * Per‑syllable animation effects.
   */
  animation?: SyllableAnimation
}

/**
 * The main vocal line: its rendering mode and per‑mode settings.
 */
export interface Main {
  /**
   * Which renderer the main line uses.
   * - `syllable`: word‑by‑word karaoke highlighting. This is a preference — lyrics without syllable timing always fall back to plain.
   * - `plain`: the whole line as plain text with only the normal / active / played state styles.
   * @default 'syllable'
   */
  use?: 'syllable' | 'plain'
  /**
   * Syllable (karaoke) settings.
   */
  syllable?: MainSyllable
  // TODO: add a `plain?` block for plain‑specific appearance once a concrete need arises; plain currently inherits the syllable styles.
}
