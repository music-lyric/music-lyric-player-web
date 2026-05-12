import type { StoredLyric } from './storage'

import { ParserPipeline } from 'music-lyric-kit'

const parseLrc = (original: string, roman?: string, translate?: string) => {
  return new ParserPipeline({ content: { original, roman, translate }, format: 'lrc' })
    .parse()
    .pureClean()
    .pureExtract()
    .agentExtract()
    .backgroundExtract()
    .backgroundClean()
    .interludeInsert()
    .spaceInsert()
    .stressMark()
    .final()
}

const parseTtml = (content: string) => {
  return new ParserPipeline({ content, format: 'ttml-amll' })
    .parse()
    .pureClean()
    .pureExtract()
    .agentExtract()
    .backgroundExtract()
    .backgroundClean()
    .interludeInsert()
    .spaceInsert()
    .stressMark()
    .final()
}

export const parseStoredLyric = (lyric: StoredLyric) => {
  if (lyric.format === 'ttml') {
    if (!lyric.ttmlOriginal) return null
    return parseTtml(lyric.ttmlOriginal)
  }
  if (!lyric.lrcOriginal) return null
  return parseLrc(lyric.lrcOriginal, lyric.lrcRoman, lyric.lrcTranslate)
}
