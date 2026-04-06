import { ParserPipeline } from 'music-lyric-kit'

import { BaseLyricPlayer } from '@music-lyric-player/base'
import { DomLyricPlayer } from '@music-lyric-player/dom'

const content = ``

const parser = new ParserPipeline({ content, format: 'ttml-amll' })
const result = parser
  .parse()
  .pureClean()
  .pureExtract()
  .agentExtract()
  .backgroundExtract()
  .backgroundClean()
  .spaceInsert()
  .interludeInsert()
  .stressMark()
  .final()

const base = new BaseLyricPlayer()
const dom = new DomLyricPlayer(base)

if (result) {
  base.updateLyric(result.result)
}

document.addEventListener('DOMContentLoaded', () => {
  const mainElement = document.getElementById('main')
  if (mainElement) {
    mainElement.appendChild(dom.element)
  }
})
