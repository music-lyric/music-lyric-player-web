import type { Lyric } from '@music-lyric-kit/lyric'
import type { WordAnnotationBaseElement } from './base'

import { DomLyricPlayerConfig } from '@root/config'
import { WordRomanElement } from './roman'
import { WordRubyElement } from './ruby'

export { WordAnnotationBaseElement } from './base'
export { WordRomanElement } from './roman'
export { WordRubyElement } from './ruby'

export interface WordAnnotationDescriptor {
  /**
   * Word slot this annotation occupies within a word cell.
   */
  readonly slot: DomLyricPlayerConfig.Line.Normal.Syllable.WordSlot
  /**
   * Whether the annotation is turned on for the given syllable config.
   */
  isEnabled(syllable: DomLyricPlayerConfig.RootRequired['line']['normal']['main']['syllable']): boolean
  /**
   * Build the row element for a word.
   */
  create(info: Lyric.WordNormal): WordAnnotationBaseElement
}

export const WORD_ANNOTATION_DESCRIPTORS: readonly WordAnnotationDescriptor[] = [
  {
    slot: DomLyricPlayerConfig.Line.Normal.Syllable.WordSlot.AnnotationRoman,
    isEnabled: (syllable) => syllable.annotation.roman.visible,
    create: (info) => new WordRomanElement(info),
  },
  {
    slot: DomLyricPlayerConfig.Line.Normal.Syllable.WordSlot.AnnotationRuby,
    isEnabled: (syllable) => syllable.annotation.ruby.visible,
    create: (info) => new WordRubyElement(info),
  },
]
