import type { Lyric } from '@music-lyric-kit/lyric'

import { PlayerRole } from '@root/constants'

import { AnnotationBaseElement } from './base'

import styles from './index.module.scss'

export class AnnotationTranslateElement extends AnnotationBaseElement {
  constructor(info: Lyric.LineNormal) {
    super(info, PlayerRole.line.normal.annotation.translation, styles.translate)
  }

  protected override resolve(info: Lyric.LineNormal) {
    return info.annotation.translates?.[0]?.content
  }
}
