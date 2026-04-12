import { ConfigManager, DeepPartial } from '@music-lyric-player/utils'

export interface FontConfig {
  /**
   * Font size (in px).
   * @default 30
   */
  size?: number
  /**
   * Font weight (100 - 900).
   * @default 700
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
   * color value.
   * @default "#000000"
   * @example "rgba(255, 255, 255, 0.8)" or "#000000"
   */
  color?: string
  /**
   * Opacity level (0.0 - 1.0).
   */
  opacity?: number
}

export namespace NormalLineConfig {
  export interface Common {
    /**
     * Font settings.
     */
    font?: FontConfig
    /**
     * Custom CSS class name appended to the current element's DOM.
     * @default ""
     */
    className: string
    /**
     * Style for the inactive state.
     */
    normalStyle?: StyleConfig
    /**
     * Style for the active state.
     */
    activeStyle?: StyleConfig
  }

  export interface Syllable extends Common {
    /**
     * Whether to enable syllable-level highlighting/display features (e.g., karaoke coloring effect).
     * @default true
     */
    visible: boolean
  }

  export interface Translate extends Common {
    /**
     * Whether to show translated lyrics.
     * @default true
     */
    visible: boolean
  }

  export interface Roman extends Common {
    /**
     * Whether to show transliterated lyrics (Roman/Pinyin).
     * @default false
     */
    visible: boolean
  }

  export interface Extended {
    /**
     * If false, both translate and roman lines will be forcibly hidden.
     * @default true
     */
    visible: boolean
    /**
     * Translation line config.
     */
    translate: Translate
    /**
     * Roman line config.
     */
    roman: Roman
  }

  export interface All extends Common {
    /**
     * Syllable config.
     */
    syllable: Syllable
    /**
     * Extended config.
     */
    extended: Extended
  }
}

export interface InterludeLineConfig {
  /**
   * Size of the interlude indicator (e.g., diameter of the dots or font size in pixels).
   * @default 16
   */
  size: number
  /**
   * Custom CSS class name for the interlude container.
   * @default ""
   */
  className: string
  /**
   * Style for the inactive state.
   */
  normalStyle: StyleConfig
  /**
   * Style for the active state.
   */
  activeStyle: StyleConfig
}

export interface Config {
  /**
   * config for the player's root container node.
   */
  root: {
    /**
     * Custom CSS class name for the outermost wrapper.
     * @default ""
     */
    className: string
  }

  /**
   * Lyric line and layout system config.
   */
  line: {
    /**
     * Global geometric layout rules.
     */
    layout: {
      /**
       * Horizontal alignment of lyrics within the container.
       * @default "left"
       */
      align: 'left' | 'center' | 'right'
      /**
       * Vertical base spacing between lines (in px).
       * @default 24
       */
      gap: number
      /**
       * Duet rules.
       */
      duet: {
        /**
         * Whether to enable duet layout.
         * @default true
         * @example When enabled, multi-singer lyrics will be specially formatted. For instance: Singer A is forced to the left, Singer B to the right, overriding the global align setting.
         */
        enable: boolean
      }
    }
    /**
     * Line wrapper.
     */
    wrapper: {
      /**
       * Custom CSS class name for the line wrapper.
       * @default ""
       */
      className: string
    }
    /**
     * Normal lines.
     */
    normal: NormalLineConfig.All
    /**
     * Interlude lines.
     */
    interlude: InterludeLineConfig
  }

  /**
   * Viewport scrolling engine config.
   */
  scroll: {
    /**
     * Vertical anchor position of the active line in the scroll container (percentage: 0-100).
     * @default 50
     * @example 50 means the currently singing line will always stay in the exact vertical center of the container; 30 means it stays closer to the top.
     */
    activePosition: number
  }
}

const DEFAULT_COLOR = '#000000' as const

const DEFAULT_FONT_CONFIG: FontConfig = {
  size: 30,
  weight: 500,
  family: 'sans-serif',
} as const

const DEFAULT_EXTENDED_FONT_SIZE = Math.round(DEFAULT_FONT_CONFIG.size! * 0.6)

export const DEFAULT_CONFIG: Config = {
  root: {
    className: '',
  },

  line: {
    layout: {
      align: 'left',
      gap: 30,
      duet: {
        enable: true,
      },
    },
    wrapper: {
      className: '',
    },
    normal: {
      font: DEFAULT_FONT_CONFIG,
      className: '',
      normalStyle: {
        color: DEFAULT_COLOR,
        opacity: 0.5,
      },
      activeStyle: {
        color: DEFAULT_COLOR,
        opacity: 1,
      },
      syllable: {
        visible: true,
        className: '',
      },
      extended: {
        visible: true,
        translate: {
          visible: true,
          className: '',
          font: {
            size: DEFAULT_EXTENDED_FONT_SIZE,
          },
          normalStyle: {
            opacity: 0.4,
          },
          activeStyle: {
            opacity: 0.6,
          },
        },
        roman: {
          visible: false,
          className: '',
          font: {
            size: DEFAULT_EXTENDED_FONT_SIZE,
          },
          normalStyle: {
            opacity: 0.4,
          },
          activeStyle: {
            opacity: 0.6,
          },
        },
      },
    },
    interlude: {
      size: 16,
      className: '',
      normalStyle: {
        color: DEFAULT_COLOR,
        opacity: 0,
      },
      activeStyle: {
        color: DEFAULT_COLOR,
        opacity: 0.8,
      },
    },
  },

  scroll: {
    activePosition: 50,
  },
} as const

export type ConfigClient = ConfigManager<Config, DeepPartial<Config>>
