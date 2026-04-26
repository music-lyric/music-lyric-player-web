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
 * Syllable‑level (word‑by‑word) configuration.
 * Inherits all base properties; these values can be overridden per syllable.
 */
export interface NormalLineSyllableConfig extends NormalLineBaseConfig {
  /**
   * Whether to enable syllable‑level highlighting.
   * @default true
   */
  enabled?: boolean
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
