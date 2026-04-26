import { ConfigManager, DeepRequired } from '@music-lyric-player/utils'

import { Padding, FontConfig } from './common'
import { EffectConfig } from './effect'
import { LineConfig } from './line'
import { ScrollAnimationMode, ScrollConfig } from './scroll'

export * from './common'
export * from './effect'
export * from './line'
export * from './scroll'

export interface Config {
  /**
   * Container config.
   */
  container?: {
    /**
     * Custom CSS class name for the outermost wrapper.
     * @default ""
     */
    className?: string
    /**
     * Container padding.
     *
     * @unit px
     * @default "20px"
     *
     * @example 1 value: `"20px"` → all sides
     * @example 2 values: `"20px 10px"` → top/bottom | left/right
     * @example 3 values: `"20px 10px 30px"` → top | left/right | bottom
     * @example 4 values: `"20px 10px 30px 5px"` → top | right | bottom | left
     */
    padding?: Padding
    /**
     * Container edge fade.
     */
    fade?: {
      /**
       * Enable edge fade.
       * @default true
       */
      enabled?: boolean
      /**
       * Top edge fade range.
       * @default "5%"
       */
      top?: `${number}%`
      /**
       * Bottom edge fade range.
       * @default "10%"
       */
      bottom?: `${number}%`
    }
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
  effect?: EffectConfig

  /**
   * Viewport scrolling engine config.
   */
  scroll?: ScrollConfig

  /**
   * Lyric line config.
   */
  line?: LineConfig
}

const DEFAULT_COLOR = '#000000' as const

const DEFAULT_FONT_CONFIG: FontConfig = {
  size: 30,
  weight: 500,
  family: 'sans-serif',
} as const

const DEFAULT_EXTENDED_FONT_SIZE = Math.round(DEFAULT_FONT_CONFIG.size! * 0.6)

export const DEFAULT_CONFIG: Config = {
  container: {
    className: '',
    padding: '20px',
    fade: {
      enabled: true,
      top: '5%',
      bottom: '10%',
    },
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
    blur: {
      enabled: true,
      min: 0.4,
      max: 4.5,
    },
  },

  scroll: {
    anchor: 50,
    animation: {
      mode: ScrollAnimationMode.Smooth,
      duration: 500,
      delay: 0,
      easing: 'ease',
    },
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
}

export type ConfigRequired = DeepRequired<Config>

export type ConfigClient = ConfigManager<ConfigRequired, Config>
