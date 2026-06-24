import type { Lyric } from '@music-lyric-kit/lyric'
import type { WordAnnotationBaseElement } from './base'

import { DomLyricPlayerConfig as Config } from '@root/config'
import { WordRomanElement } from './roman'

export { WordAnnotationBaseElement } from './base'
export { WordRomanElement } from './roman'

const { WordSlot } = Config.Line.Normal.Syllable

type SyllableConfig = Config.RootRequired['line']['normal']['main']['syllable']

export interface WordAnnotationDescriptor {
  /**
   * Word slot this annotation occupies within a word cell.
   */
  readonly slot: Config.Line.Normal.Syllable.WordSlot
  /**
   * Whether the annotation is turned on for the given syllable config.
   */
  isEnabled(syllable: SyllableConfig): boolean
  /**
   * Build the row element for a word.
   */
  create(info: Lyric.WordNormal): WordAnnotationBaseElement
}

export const WORD_ANNOTATION_DESCRIPTORS: readonly WordAnnotationDescriptor[] = [
  {
    slot: WordSlot.AnnotationRoman,
    isEnabled: (syllable) => syllable.annotation.roman.visible,
    create: (info) => new WordRomanElement(info),
  },
  // Ruby (furigana) row: reserved slot — wire a WordRubyElement here once word ruby rendering lands.
]
