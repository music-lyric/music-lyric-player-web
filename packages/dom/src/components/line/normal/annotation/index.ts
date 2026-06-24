import type { Lyric } from '@music-lyric-kit/lyric'
import type { AnnotationBaseElement } from './base'

import { DomLyricPlayerConfig as Config } from '@root/config'
import { AnnotationTranslateElement } from './translate'
import { AnnotationRomanElement } from './roman'

export { AnnotationBaseElement } from './base'
export { AnnotationTranslateElement } from './translate'
export { AnnotationRomanElement } from './roman'

export interface AnnotationDescriptor {
  /**
   * Layout slot this annotation occupies within a line.
   */
  readonly slot: Config.Line.Normal.LineSlot
  /**
   * Whether the annotation is turned on for the given annotation config.
   */
  isEnabled(annotation: Config.RootRequired['line']['normal']['annotation']): boolean
  /**
   * Build the row element for a line.
   */
  create(info: Lyric.LineNormal): AnnotationBaseElement
}

export const ANNOTATION_DESCRIPTORS: readonly AnnotationDescriptor[] = [
  {
    slot: Config.Line.Normal.LineSlot.AnnotationTranslate,
    isEnabled: (annotation) => annotation.translate.visible,
    create: (info) => new AnnotationTranslateElement(info),
  },
  {
    slot: Config.Line.Normal.LineSlot.AnnotationRoman,
    isEnabled: (annotation) => annotation.roman.visible,
    create: (info) => new AnnotationRomanElement(info),
  },
]
