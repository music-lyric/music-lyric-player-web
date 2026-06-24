import type { Lyric } from '@music-lyric-kit/lyric'

import { PlayerRole } from '@root/constants'

import { WordAnnotationBaseElement } from './base'

import styles from './index.module.scss'

export class WordRubyElement extends WordAnnotationBaseElement {
  constructor(info: Lyric.WordNormal) {
    super(info, PlayerRole.line.normal.text.word.ruby, styles.wordRuby)
  }

  protected override resolve(info: Lyric.WordNormal) {
    return info.annotation?.ruby?.content
  }
}
