import type { Lyric } from '@music-lyric-kit/lyric'
import type { ComponentContext } from '@root/components/context'

import { PlayerRole } from '@root/constants'

import { WordAnnotationBaseElement } from './base'

import styles from './index.module.scss'

export class WordRubyElement extends WordAnnotationBaseElement {
  constructor(context: ComponentContext, wordInfo: Lyric.Common.WordNormal, lineInfo: Lyric.Parsed.ParsedLineContent, forceOwnWipe?: boolean) {
    // Ruby has a single furigana set per word, so it carries no language choice.
    super(context, wordInfo, lineInfo, undefined, PlayerRole.line.normal.text.word.ruby, styles.wordRuby, forceOwnWipe)
  }

  protected override resolve(info: Lyric.Common.WordNormal) {
    return info.annotation?.rubies[0]
  }
}
