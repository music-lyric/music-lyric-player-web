import type { Lyric } from '@music-lyric-kit/lyric'
import type { WordAnnotationBaseElement } from './base'

import { DomLyricPlayerConfig } from '@root/config'
import { WordRomanElement } from './roman'
import { WordRubyElement } from './ruby'

import { resolveLanguage } from '@root/utils'

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
   * Resolve the preferred language for this row, or `undefined` when the row has no language choice (ruby).
   */
  language(normal: DomLyricPlayerConfig.RootRequired['line']['normal']): Lyric.LanguageTag | undefined
  /**
   * Build the row element for a word.
   */
  create(info: Lyric.WordNormal, language: Lyric.LanguageTag | undefined): WordAnnotationBaseElement
}

export const WORD_ANNOTATION_DESCRIPTORS: readonly WordAnnotationDescriptor[] = [
  {
    slot: DomLyricPlayerConfig.Line.Normal.Syllable.WordSlot.AnnotationRoman,
    isEnabled: (syllable) => syllable.annotation.roman.visible,
    language: (normal) => resolveLanguage(normal.main.syllable.annotation.roman.language, normal.annotation.roman.language, normal.base.language),
    create: (info, language) => new WordRomanElement(info, language),
  },
  {
    slot: DomLyricPlayerConfig.Line.Normal.Syllable.WordSlot.AnnotationRuby,
    isEnabled: (syllable) => syllable.annotation.ruby.visible,
    language: () => undefined,
    create: (info) => new WordRubyElement(info),
  },
]

export { WordAnnotationBaseElement } from './base'

export { WordRomanElement } from './roman'

export { WordRubyElement } from './ruby'
