import { FontConfig } from './common'
import { Config, Scroll } from './root'

const DEFAULT_COLOR = '#000000' as const

const DEFAULT_FONT_CONFIG: FontConfig = {
  size: 30,
  weight: 500,
  family: 'sans-serif',
} as const

const DEFAULT_EXTENDED_FONT_SIZE = Math.round(DEFAULT_FONT_CONFIG.size! * 0.6)

/**
 * Built‑in default configuration.
 *
 * Used as the fallback when a user‑supplied {@link Config} omits fields.
 */
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
      mode: Scroll.Animation.Mode.Smooth,
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
        animation: {
          float: {
            enabled: true,
            from: 0,
            to: -2,
          },
          mask: {
            enabled: true,
          },
        },
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
