import { Lyric } from '@music-lyric-kit/lyric'

import { PlayerRole } from '@root/constants'

import { AnnotationBaseElement } from './base'

import styles from './index.module.scss'

export class AnnotationRomanElement extends AnnotationBaseElement {
  constructor(info: Lyric.Parsed.ParsedLineContent, language: Lyric.LanguageTag | undefined) {
    super(info, language, PlayerRole.line.normal.annotation.romanization, styles.roman)
  }

  protected override resolve(info: Lyric.Parsed.ParsedLineContent, language: Lyric.LanguageTag | undefined) {
    return Lyric.Parsed.getParsedLineRoman(info, language)
  }
}
