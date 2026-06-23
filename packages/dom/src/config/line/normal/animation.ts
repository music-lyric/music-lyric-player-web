import type { SyllableEmphasizeAnimation } from './emphasize'

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
  /**
   * Per‑character "emphasize" effect for stressed syllables.
   * See {@link SyllableEmphasizeAnimation}.
   */
  emphasize?: SyllableEmphasizeAnimation
}
