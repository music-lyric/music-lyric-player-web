import { FontConfig } from './common'
import { Root, Scroll } from './root'

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
export const DEFAULT_CONFIG: Root = {
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
    duet: {
      enabled: true,
    },
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
            feather: {
              normal: 0.5,
              first: 1.5,
              last: 0.5,
            },
          },
          emphasize: {
            enabled: true,
            minDuration: 1000,
            disablePlaybackRate: 4,
            effects: {
              main: {
                enabled: true,
                scale: 0.1,
                offset: {
                  horizontal: 1,
                  vertical: 1,
                },
                easing: {
                  rise: 'cubic-bezier(0.2, 0.4, 0.58, 1)',
                  fall: 'cubic-bezier(0.3, 0, 0.58, 1)',
                },
              },
              glow: {
                enabled: true,
                color: '#000000',
                easing: 'cubic-bezier(0.2, 0.4, 0.58, 1)',
                maxRadius: 9,
                maxAlpha: 1,
              },
              float: {
                enabled: true,
                duration: {
                  scale: 1.4,
                  lead: 400,
                },
                amplitude: 2,
                easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
              },
            },
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
          hide: true,
        },
        active: {
          color: DEFAULT_COLOR,
          opacity: 0.8,
        },
      },
    },
  },
}
