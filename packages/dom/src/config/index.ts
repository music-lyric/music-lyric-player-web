import { ConfigManager, DeepPartial } from '@music-lyric-player/utils'

export interface Config {
  /** Scrolling and positioning behavior logic */
  scroll: {
    /**
     * Vertical focal position of the active line within the container (percentage).
     * @description 50 means centered, 20 means positioned towards the top.
     * @default 50
     */
    activePosition: number
  }

  /** Functional behavior of lyric lines */
  line: {
    /**
     * Horizontal alignment of the lyric text.
     * @default 'left'
     */
    align: 'left' | 'center' | 'right'

    /** Configuration for standard lyric lines */
    normal: {
      /**
       * Whether to enable per-word/syllable-based highlighting (Karaoke mode).
       * @default true
       */
      syllable: boolean
      /** Extended content configuration */
      extended: {
        /**
         * Whether to display the translation of the lyrics.
         * @default true
         */
        translate: boolean
        /**
         * Whether to display romanization/pinyin/transliteration.
         * @default true
         */
        roman: boolean
      }
    }
  }

  /** Visual and CSS-related styling */
  style: {
    /**
     * Base font size in pixels.
     * @default 30
     */
    fontSize: number
    /**
     * CSS font-family property.
     * @default ''
     */
    fontFamily: string
    /**
     * Font weight (100-900).
     * @default 500
     */
    fontWeight: number

    /**
     * Custom CSS class names for fine-grained DOM styling.
     * @description Changes to these properties should ideally not trigger a DOM reconstruction.
     */
    className: {
      /** Class for the outermost container */
      container: string
      line: {
        /** Class for the wrapper of an entire line (including original, translation, etc.) */
        wrapper: string
        normal: {
          /** Class for the standard lyric text area wrapper */
          wrapper: string
          /** Class for the original lyric text */
          original: string
          /** Class for individual syllable/word elements */
          syllable: string
          /** Class for extended content (translation/romanization) */
          extended: string
        }
      }
    }
  }
}

export const DEFAULT_CONFIG: Config = {
  scroll: {
    activePosition: 50,
  },
  line: {
    align: 'left',
    normal: {
      syllable: true,
      extended: {
        translate: true,
        roman: true,
      },
    },
  },
  style: {
    fontSize: 30,
    fontFamily: '',
    fontWeight: 500,
    className: {
      container: '',
      line: {
        wrapper: '',
        normal: {
          wrapper: '',
          original: '',
          syllable: '',
          extended: '',
        },
      },
    },
  },
}

export type ConfigClient = ConfigManager<Config, DeepPartial<Config>>
