import type { ParserPipelineInput } from 'music-lyric-kit'
import type { ParserOptions } from './parser-options'
import type { StoredLyric } from './storage'

import { ParserPipeline } from 'music-lyric-kit'

const buildPipeline = (input: ParserPipelineInput, options: ParserOptions) => {
  const pipeline = new ParserPipeline(input).parse()

  if (options.pureClean.enabled) {
    pipeline.pureClean({ firstLineWithMusicInfo: options.pureClean.firstLineWithMusicInfo } as never)
  }
  if (options.pureExtract.enabled) {
    pipeline.pureExtract()
  }
  if (options.agentExtract.enabled) {
    pipeline.agentExtract()
  }
  if (options.backgroundExtract.enabled) {
    pipeline.backgroundExtract({
      fullLine: options.backgroundExtract.fullLine,
      inLine: options.backgroundExtract.inLine,
      crossLine: options.backgroundExtract.crossLine,
    })
  }
  if (options.backgroundClean.enabled) {
    pipeline.backgroundClean()
  }
  if (options.interludeInsert.enabled) {
    pipeline.interludeInsert({
      checkTime: {
        first: options.interludeInsert.first,
        normal: options.interludeInsert.normal,
      },
    })
  }
  if (options.spaceInsert.enabled) {
    pipeline.spaceInsert({
      original: options.spaceInsert.original,
      extended: options.spaceInsert.extended,
    } as never)
  }
  if (options.stressMark.enabled) {
    pipeline.stressMark({ checkTime: options.stressMark.checkTime })
  }

  return pipeline.final()
}

export const parseStoredLyric = (lyric: StoredLyric, options: ParserOptions) => {
  if (lyric.format === 'ttml') {
    if (!lyric.ttmlOriginal) return null
    return buildPipeline({ content: lyric.ttmlOriginal, format: 'ttml-amll' }, options)
  }
  if (!lyric.lrcOriginal) return null
  return buildPipeline(
    {
      content: {
        original: lyric.lrcOriginal,
        roman: lyric.lrcRoman,
        translate: lyric.lrcTranslate,
      },
      format: 'lrc',
    },
    options,
  )
}
