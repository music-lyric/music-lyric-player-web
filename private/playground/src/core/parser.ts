import type { ParserPipelineInput } from 'music-lyric-kit'
import type { ParserOptions } from './parser-options'
import type { StoredLyric } from './storage'

import { ParserPipeline } from 'music-lyric-kit'

const buildPipeline = (input: ParserPipelineInput, options: ParserOptions) => {
  const pipeline = new ParserPipeline(input).parse()

  if (options.pureClean.enabled) {
    pipeline.pure.clean({ firstLineWithMusicInfo: options.pureClean.firstLineWithMusicInfo } as never)
  }
  if (options.pureExtract.enabled) {
    pipeline.pure.extractCreator()
  }
  if (options.agentExtract.enabled) {
    pipeline.agent.extract()
  }
  if (options.backgroundExtract.enabled) {
    pipeline.background.extract({
      fullLine: options.backgroundExtract.fullLine,
      inLine: options.backgroundExtract.inLine,
      crossLine: options.backgroundExtract.crossLine,
    })
  }
  if (options.backgroundClean.enabled) {
    pipeline.background.clean()
  }
  if (options.interludeInsert.enabled) {
    pipeline.interlude.insert({
      checkTime: {
        first: options.interludeInsert.first,
        normal: options.interludeInsert.normal,
      },
    })
  }
  if (options.spaceInsert.enabled) {
    pipeline.space.insert({
      original: options.spaceInsert.original,
      extended: options.spaceInsert.extended,
    } as never)
  }
  if (options.stressMark.enabled) {
    pipeline.stress.mark({ checkTime: options.stressMark.checkTime })
  }

  pipeline.language.infer()
  pipeline.language.calculatePercent()

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
