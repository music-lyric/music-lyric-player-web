import { ConfigManager, DeepRequired } from '@music-lyric-player/utils'

export interface FontConfig {
  /**
   * Font size (in px).
   * @default 30
   */
  size?: number
  /**
   * Font weight (100–900).
   * @default 500
   */
  weight?: number
  /**
   * Font family name.
   * @default "sans-serif"
   * @example "'PingFang SC', 'Helvetica Neue', Arial, sans-serif"
   */
  family?: string
}

export interface StyleConfig {
  /**
   * Color value.
   * @default "#000000"
   * @example "rgba(255, 255, 255, 0.8)" or "#000000"
   */
  color?: string
  /**
   * Opacity level (0.0–1.0).
   * @default 1
   */
  opacity?: number
}

export interface StateStyleConfig {
  /**
   * Style for the inactive state.
   */
  normal?: StyleConfig
  /**
   * Style for the active state.
   */
  active?: StyleConfig
}

export namespace NormalLineConfig {
  interface StateStyle extends StateStyleConfig {
    /**
     * Style for the already played state.
     * If not provided, it usually falls back to `normal`.
     */
    played?: StyleConfig
  }

  export interface Base {
    /**
     * Custom CSS class name appended to the current element's DOM.
     * @default ""
     */
    className?: string
    /**
     * Font settings.
     */
    font?: FontConfig
    /**
     * State-based style overrides.
     */
    style?: StateStyle
  }

  export interface Syllable extends Base {
    /**
     * Whether to enable syllable-level (word-by-word) highlighting.
     * @default true
     */
    enabled?: boolean
  }

  export interface Translate extends Base {
    /**
     * Whether to show translated lyrics.
     * @default true
     */
    visible?: boolean
  }

  export interface Roman extends Base {
    /**
     * Whether to show romanized (pinyin) lyrics.
     * @default false
     */
    visible?: boolean
  }

  export interface Extended {
    /**
     * If false, both translate and roman lines will be forcibly hidden.
     * @default true
     */
    visible?: boolean
    /**
     * Shared base config for all extended lines.
     */
    base?: Base
    /**
     * Translation line config.
     */
    translate?: Translate
    /**
     * Romanization line config.
     */
    roman?: Roman
  }
}

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
   * State-based style overrides.
   */
  style?: StateStyleConfig
}

export interface Config {
  /**
   * Root container config.
   */
  root?: {
    /**
     * Custom CSS class name for the outermost wrapper.
     * @default ""
     */
    className?: string
  }

  /**
   * Global geometric layout rules.
   */
  layout?: {
    /**
     * Horizontal alignment of lyrics within the container.
     * @default "left"
     */
    align?: 'left' | 'center' | 'right'
    /**
     * Vertical base spacing between lines (in px).
     * @default 30
     */
    gap?: number
  }

  /**
   * Visual effects applied to lines based on distance from the active line.
   */
  // TODO
  effect?: {
    /**
     * Scale transform effect.
     */
    scale?: {
      /**
       * Whether to enable the scale effect.
       * @default false
       */
      enabled?: boolean
      /**
       * Minimum scale ratio (applied to the farthest lines).
       * @default 0.65
       */
      min?: number
      /**
       * Maximum scale ratio (applied to the active line).
       * @default 1
       */
      max?: number
    }
  }

  /**
   * Viewport scrolling engine config.
   */
  scroll?: {
    /**
     * Vertical anchor position of the active line within the scroll container.
     *
     * Expressed as a percentage (0–100) of the container height.
     * - `50` — active line stays at the vertical center.
     * - `30` — active line stays closer to the top.
     *
     * @default 50
     */
    anchor?: number
  }

  /**
   * Lyric line config.
   */
  line?: {
    /**
     * Custom CSS class name for the line wrapper.
     * @default ""
     */
    className?: string
    /**
     * Normal (vocal) line config.
     */
    normal?: {
      /**
       * Base config.
       */
      base?: NormalLineConfig.Base
      /**
       * Syllable-level (word-by-word) config.
       */
      syllable?: NormalLineConfig.Syllable
      /**
       * Extended (e.g. translation / romanization) config.
       */
      extended?: NormalLineConfig.Extended
    }
    /**
     * Interlude (instrumental break) line config.
     */
    interlude?: InterludeLineConfig
  }
}

const DEFAULT_COLOR = '#000000' as const

const DEFAULT_FONT_CONFIG: FontConfig = {
  size: 30,
  weight: 500,
  family: 'sans-serif',
} as const

const DEFAULT_EXTENDED_FONT_SIZE = Math.round(DEFAULT_FONT_CONFIG.size! * 0.6)

export const DEFAULT_CONFIG: DeepRequired<Config> = {
  root: {
    className: '',
  },

  layout: {
    align: 'left',
    gap: 30,
  },

  effect: {
    scale: {
      enabled: false,
      min: 0.65,
      max: 1,
    },
  },

  scroll: {
    anchor: 50,
  },

  line: {
    className: '',
    normal: {
      base: {
        className: '',
        font: DEFAULT_FONT_CONFIG,
        style: {
          normal: {
            color: DEFAULT_COLOR,
            opacity: 0.6,
          },
          active: {
            color: DEFAULT_COLOR,
            opacity: 1,
          },
          played: {
            color: DEFAULT_COLOR,
            opacity: 0.4,
          },
        },
      },
      syllable: {
        enabled: true,
        className: '',
      },
      extended: {
        visible: true,
        base: {
          className: '',
          font: {
            size: DEFAULT_EXTENDED_FONT_SIZE,
          },
          style: {
            normal: {
              opacity: 0.4,
            },
            active: {
              opacity: 0.6,
            },
          },
        },
        translate: {
          visible: true,
          className: '',
        },
        roman: {
          visible: false,
          className: '',
        },
      },
    },
    interlude: {
      className: '',
      size: 16,
      style: {
        normal: {
          color: DEFAULT_COLOR,
          opacity: 0.2,
        },
        active: {
          color: DEFAULT_COLOR,
          opacity: 0.8,
        },
      },
    },
  },
} as DeepRequired<Config>

export type ConfigClient = ConfigManager<DeepRequired<Config>, Config>
