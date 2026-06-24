import { Lyric } from '@music-lyric-kit/lyric'

import { PlayerRole } from '@root/constants'

import { AnnotationBaseElement } from './base'

import styles from './index.module.scss'

export class AnnotationRomanElement extends AnnotationBaseElement {
  constructor(info: Lyric.LineNormal) {
    super(info, PlayerRole.line.normal.annotation.romanization, styles.roman)
  }

  protected override resolve(info: Lyric.LineNormal) {
    return info.annotation.first(Lyric.LineAnnotationKind.Roman)?.content
  }
}
