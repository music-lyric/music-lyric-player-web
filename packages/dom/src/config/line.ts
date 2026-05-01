import { FontConfig, StateStyleConfig, StyleConfig } from './common'

/**
 * State style configuration for normal lyric lines.
 * Extends the generic state styles with a `played` state.
 */
export interface NormalLineStyleConfig extends StateStyleConfig {
  /**
   * Style for the already‑played state.
   * Falls back to `normal` if not provided.
   */
  played?: StyleConfig
}

/**
 * Base configuration shared by normal lyric lines and extended lines.
 */
export interface NormalLineBaseConfig {
  /**
   * Custom CSS class name appended to the line's DOM element.
   * @default ""
   */
  className?: string
  /**
   * Font settings.
   * If omitted, inherits from a higher‑level default (e.g., the global font config).
   */
  font?: FontConfig
  /**
   * State‑based style overrides.
   */
  style?: NormalLineStyleConfig
}

/**
 * Configuration for the float animation of syllables on a normal lyric line.
 * The animation makes syllables gently move vertically (float) during playback,
 * creating a subtle visual effect synchronized with the audio.
 */
export interface NormalLineSyllableFloatAnimationConfig {
  /**
   * Whether to enable the float animation for syllables.
   * When set to `false`, syllables will remain stationary.
   * @default true
   */
  enabled?: boolean
  /**
   * The starting vertical offset of the float animation, relative to the
   * syllable's original position. Negative values move the syllable upward,
   * positive values move it downward.
   * @default 0
   * @unit px
   */
  from?: number
  /**
   * The ending vertical offset of the float animation, relative to the
   * syllable's original position. Negative values move the syllable upward,
   * positive values move it downward.
   * @default 2
   * @unit px
   */
  to?: number
}

/**
 * Configuration for the mask (wipe) animation of syllables on a normal lyric line.
 * The animation reveals each syllable progressively from left to right,
 * synchronized with the audio playback — similar to a karaoke-style wipe effect.
 */
export interface NormalLineSyllableMaskAnimationConfig {
  /**
   * Whether to enable the mask animation for syllables.
   * When set to `false`, syllables will appear fully highlighted at once
   * instead of being revealed progressively from left to right.
   * @default true
   */
  enabled?: boolean
}

/**
 * Animation configuration for syllable-level effects.
 */
export interface NormalLineSyllableAnimationConfig {
  /**
   * Float animation configuration. Controls the vertical floating motion
   * of syllables during playback.
   */
  float?: NormalLineSyllableFloatAnimationConfig
  /**
   * Mask animation configuration. Controls the karaoke-style wipe effect
   * that progressively reveals each syllable from left to right,
   * synchronized with the audio playback.
   */
  mask?: NormalLineSyllableMaskAnimationConfig
}

/**
 * Syllable-level (word-by-word) configuration for normal lyric lines.
 * Inherits all base properties from {@link NormalLineBaseConfig}; these
 * values can be overridden specifically for syllable-level rendering.
 */
export interface NormalLineSyllableConfig extends NormalLineBaseConfig {
  /**
   * Whether to enable syllable-level (word-by-word) highlighting.
   * When disabled, the entire line will be highlighted as a whole instead
   * of progressing syllable by syllable.
   * @default true
   */
  enabled?: boolean
  /**
   * Animation effects applied to individual syllables during playback.
   */
  animation?: NormalLineSyllableAnimationConfig
}

/**
 * Translation line configuration.
 * Inherits all base properties; values not set here fall back to `extended.base`.
 */
export interface NormalLineTranslateConfig extends NormalLineBaseConfig {
  /**
   * Whether to show the translation line.
   * @default true
   */
  visible?: boolean
}

/**
 * Romanization (e.g., pinyin) line configuration.
 * Inherits all base properties; values not set here fall back to `extended.base`.
 */
export interface NormalLineRomanConfig extends NormalLineBaseConfig {
  /**
   * Whether to show the romanization line.
   * @default false
   */
  visible?: boolean
}

/**
 * Configuration for normal (vocal) lyrics.
 */
export interface NormalLineConfig {
  /**
   * Base configuration applied to the main lyric line.
   */
  base?: NormalLineBaseConfig
  /**
   * Syllable‑level (word‑by‑word) configuration.
   */
  syllable?: NormalLineSyllableConfig
  /**
   * Extended lines (translation / romanization) configuration.
   */
  extended?: {
    /**
     * Global switch for all extended lines.
     * When `false`, both translate and roman lines are hidden regardless of their individual `visible` settings.
     * @default true
     */
    visible?: boolean
    /**
     * Shared base configuration for all extended lines.
     * Each specific line (translate, roman) inherits these values unless overridden.
     */
    base?: NormalLineBaseConfig
    /**
     * Translation line specific overrides.
     */
    translate?: NormalLineTranslateConfig
    /**
     * Romanization line specific overrides.
     */
    roman?: NormalLineRomanConfig
  }
}

/**
 * Configuration for interlude (instrumental) lines.
 */
export interface InterludeLineConfig {
  /**
   * Custom CSS class name for the interlude container.
   * @default ""
   */
  className?: string
  /**
   * Size of the interlude indicator (e.g., dot diameter) in px.
   * @default 16
   */
  size?: number
  /**
   * State‑based style overrides (normal and active only).
   */
  style?: StateStyleConfig
}

/**
 * Top‑level line configuration grouping normal and interlude settings.
 */
export interface LineConfig {
  /**
   * Custom CSS class name for the line wrapper.
   * @default ""
   */
  className?: string
  /**
   * Normal (vocal) line configuration.
   */
  normal?: NormalLineConfig
  /**
   * Interlude (instrumental) line configuration.
   */
  interlude?: InterludeLineConfig
}
