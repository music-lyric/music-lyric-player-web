import { ParserPipeline } from 'music-lyric-kit'

import type { StoredLyric, LyricFormat } from './storage'

import { $ } from './utils'

export interface LyricInputCallbacks {
  onApply: (lyric: StoredLyric) => void
  onClear: () => void
}

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

export const initLyricInput = (initial: StoredLyric | undefined, callbacks: LyricInputCallbacks): void => {
  const tabs = Array.from(document.querySelectorAll<HTMLDivElement>('.lyric-format-tab'))
  const lrcSection = $('lyric-section-lrc') as HTMLDivElement
  const ttmlSection = $('lyric-section-ttml') as HTMLDivElement

  const lrcOriginal = $('lrc-original') as HTMLTextAreaElement
  const lrcRoman = $('lrc-roman') as HTMLTextAreaElement
  const lrcTranslate = $('lrc-translate') as HTMLTextAreaElement

  const ttmlOriginal = $('ttml-original') as HTMLTextAreaElement
  const ttmlFileBtn = $('ttml-file-btn') as HTMLButtonElement
  const ttmlFileName = $('ttml-file-name') as HTMLSpanElement
  const ttmlFileInput = $('ttml-file-input') as HTMLInputElement

  const applyBtn = $('lyric-apply-btn') as HTMLButtonElement
  const clearBtn = $('lyric-clear-btn') as HTMLButtonElement

  let currentFormat: LyricFormat = initial?.format ?? 'lrc'

  const setFormat = (format: LyricFormat): void => {
    currentFormat = format
    tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.format === format))
    lrcSection.style.display = format === 'lrc' ? 'grid' : 'none'
    ttmlSection.style.display = format === 'ttml' ? 'flex' : 'none'
  }

  // Restore initial values
  if (initial) {
    if (initial.format === 'lrc') {
      lrcOriginal.value = initial.lrcOriginal ?? ''
      lrcRoman.value = initial.lrcRoman ?? ''
      lrcTranslate.value = initial.lrcTranslate ?? ''
    } else {
      ttmlOriginal.value = initial.ttmlOriginal ?? ''
      if (initial.ttmlFileName) {
        ttmlFileName.textContent = initial.ttmlFileName
        ttmlFileName.classList.add('selected')
      }
    }
  }
  setFormat(currentFormat)

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setFormat(tab.dataset.format as LyricFormat)
    })
  })

  ttmlFileBtn.addEventListener('click', () => ttmlFileInput.click())

  ttmlFileInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const text = await file.text()
    ttmlOriginal.value = text
    ttmlFileName.textContent = file.name
  })

  applyBtn.addEventListener('click', () => {
    if (currentFormat === 'lrc') {
      const original = lrcOriginal.value.trim()
      if (!original) {
        alert('Please provide LRC original content.')
        return
      }
      callbacks.onApply({
        format: 'lrc',
        lrcOriginal: original,
        lrcRoman: lrcRoman.value.trim() || undefined,
        lrcTranslate: lrcTranslate.value.trim() || undefined,
      })
    } else {
      const original = ttmlOriginal.value.trim()
      if (!original) {
        alert('Please provide TTML original content or choose a file.')
        return
      }
      callbacks.onApply({
        format: 'ttml',
        ttmlOriginal: original,
        ttmlFileName: ttmlFileName.textContent || undefined,
      })
    }
  })

  ttmlFileInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const text = await file.text()
    ttmlOriginal.value = text
    ttmlFileName.textContent = file.name
    ttmlFileName.classList.add('selected')
  })

  clearBtn.addEventListener('click', () => {
    lrcOriginal.value = ''
    lrcRoman.value = ''
    lrcTranslate.value = ''
    ttmlOriginal.value = ''
    ttmlFileName.textContent = 'No file selected'
    ttmlFileName.classList.remove('selected')
    ttmlFileInput.value = ''
    callbacks.onClear()
  })
}
