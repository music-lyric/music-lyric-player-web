import type { FontConfig, StateStyleConfig, StyleConfig } from '../common'

/**
 * State styles for a vocal lyric line.
 *
 * Extends the generic two‑state model (`normal` / `active`) with a third
 * `played` state for already‑sung lines.
 */
export interface StateStyle extends StateStyleConfig {
  /**
   * Style for already‑played lines.
   * Falls back to `normal` if omitted.
   */
  played?: StyleConfig
}

/**
 * Common appearance shared by the main vocal line and its extended sub‑lines.
 */
export interface Base {
  /**
   * Extra CSS class appended to this line element.
   * @default ""
   */
  className?: string
  /**
   * Font appearance.
   * Falls back to a higher‑level default if omitted.
   */
  font?: FontConfig
  /**
   * State‑based style overrides.
   */
  style?: StateStyle
}

/**
 * Vertical float animation for syllables.
 *
 * Each syllable lifts gently from `from` to `to` (in `px`) during playback,
 * adding subtle motion in sync with the audio.
 */
export interface SyllableFloatAnimation {
  /**
   * Whether to enable the float animation.
   * @default true
   */
  enabled?: boolean
  /**
   * Starting vertical offset relative to the syllable's natural position, in `px`.
   * Negative moves up, positive moves down.
   * @default 0
   */
  from?: number
  /**
   * Ending vertical offset relative to the syllable's natural position, in `px`.
   * Negative moves up, positive moves down.
   * @default 2
   */
  to?: number
}

/**
 * Soft‑edge feather amounts for the karaoke mask wipe.
 *
 * The mask gradient extends a fade region beyond each syllable's box so the
 * wipe transitions smoothly. The first and last words of a line use enlarged
 * envelopes so the wipe enters and leaves without a visible cut at the edges.
 */
export interface SyllableMaskAnimationFeather {
  /**
   * Base feather size as a fraction of the syllable's font height.
   * Applied to every word; larger values produce a softer, wider gradient edge.
   * @default 0.5
   * @min 0
   * @max 2
   */
  normal?: number
  /**
   * Multiplier applied on top of `normal` for the leading envelope of the
   * first word in a line.
   * Increases entry softness so the wipe doesn't appear to cut in abruptly.
   * @default 1.5
   * @min 0
   * @max 5
   */
  first?: number
  /**
   * Multiplier applied on top of `normal` for the trailing envelope of the
   * last word in a line.
   * Trims the exit so the wipe finishes cleanly at the line's right edge.
   * @default 0.5
   * @min 0
   * @max 5
   */
  last?: number
}

/**
 * Karaoke‑style mask animation for syllables.
 *
 * Reveals each syllable progressively from left to right, in sync with the audio.
 */
export interface SyllableMaskAnimation {
  /**
   * Whether to enable the mask animation.
   * When disabled, syllables flip to the active style instantly instead of
   * being wiped in.
   * @default true
   */
  enabled?: boolean
  /**
   * Soft‑edge feather sizing. See {@link SyllableMaskAnimationFeather}.
   */
  feather?: SyllableMaskAnimationFeather
}

/**
 * Animation set applied at the syllable level.
 */
export interface SyllableAnimation {
  /**
   * Vertical floating motion. See {@link SyllableFloatAnimation}.
   */
  float?: SyllableFloatAnimation
  /**
   * Karaoke wipe. See {@link SyllableMaskAnimation}.
   */
  mask?: SyllableMaskAnimation
}

/**
 * Syllable‑level (word‑by‑word) configuration for vocal lines.
 *
 * Inherits from {@link Base}; values left unset fall back to the parent line.
 */
export interface Syllable extends Base {
  /**
   * Whether to enable syllable‑level highlighting.
   * When disabled, the entire line lights up at once instead of progressing
   * syllable by syllable.
   * @default true
   */
  enabled?: boolean
  /**
   * Per‑syllable animation effects.
   */
  animation?: SyllableAnimation
}

/**
 * Translation sub‑line.
 *
 * Inherits from {@link Base}; values left unset fall back to `extended.base`.
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
 * Inherits from {@link Base}; values left unset fall back to `extended.base`.
 */
export interface Roman extends Base {
  /**
   * Whether to show the romanization line.
   * @default false
   */
  visible?: boolean
}

/**
 * Extended sub‑lines rendered beneath the main vocal line
 * (translation and romanization).
 */
export interface Extended {
  /**
   * Master switch for all extended sub‑lines.
   * When `false`, both `translate` and `roman` are hidden regardless of their
   * individual `visible` settings.
   * @default true
   */
  visible?: boolean
  /**
   * Shared base for all extended sub‑lines.
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

/**
 * Configuration for vocal lyric lines.
 */
export interface Root {
  /**
   * Base appearance of the main vocal line.
   */
  base?: Base
  /**
   * Syllable‑level (word‑by‑word) settings.
   */
  syllable?: Syllable
  /**
   * Extended sub‑lines (translation / romanization).
   */
  extended?: Extended
}
