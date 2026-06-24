import type { Lyric } from '@music-lyric-kit/lyric'

import { PlayerRole } from '@root/constants'

import { WordAnnotationBaseElement } from './base'

import styles from './index.module.scss'

export class WordRomanElement extends WordAnnotationBaseElement {
  constructor(info: Lyric.WordNormal) {
    super(info, PlayerRole.line.normal.text.word.roman, styles.wordRoman)
  }

  protected override resolve(info: Lyric.WordNormal) {
    return info.annotation?.romans?.[0]?.content
  }
}
