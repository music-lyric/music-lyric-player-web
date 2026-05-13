import { PARSER_OPTIONS_STORAGE_KEY } from './constants'
import { deepMerge } from '@root/utils'

export interface ParserOptions {
  pureClean: {
    enabled: boolean
    firstLineWithMusicInfo: boolean
  }
  pureExtract: {
    enabled: boolean
  }
  agentExtract: {
    enabled: boolean
  }
  backgroundExtract: {
    enabled: boolean
    fullLine: boolean
    inLine: boolean
    crossLine: boolean
  }
  backgroundClean: {
    enabled: boolean
  }
  interludeInsert: {
    enabled: boolean
    first: number
    normal: number
  }
  spaceInsert: {
    enabled: boolean
    original: boolean
    extended: boolean
  }
  stressMark: {
    enabled: boolean
    checkTime: number
  }
}

export const DEFAULT_PARSER_OPTIONS: ParserOptions = {
  pureClean: { enabled: true, firstLineWithMusicInfo: true },
  pureExtract: { enabled: true },
  agentExtract: { enabled: true },
  backgroundExtract: { enabled: true, fullLine: true, inLine: true, crossLine: true },
  backgroundClean: { enabled: true },
  interludeInsert: { enabled: true, first: 5000, normal: 10000 },
  spaceInsert: { enabled: true, original: true, extended: true },
  stressMark: { enabled: true, checkTime: 3000 },
}

const cloneDefaults = (): ParserOptions => JSON.parse(JSON.stringify(DEFAULT_PARSER_OPTIONS))

export const loadParserOptions = (): ParserOptions => {
  let stored: unknown = {}
  try {
    stored = JSON.parse(localStorage.getItem(PARSER_OPTIONS_STORAGE_KEY) ?? '{}')
  } catch {
    stored = {}
  }
  return deepMerge(cloneDefaults(), stored) as ParserOptions
}

export const saveParserOptions = (options: ParserOptions): void => {
  localStorage.setItem(PARSER_OPTIONS_STORAGE_KEY, JSON.stringify(options))
}

export const clearParserOptions = (): void => {
  localStorage.removeItem(PARSER_OPTIONS_STORAGE_KEY)
}
