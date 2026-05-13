import { ref, type Ref } from 'vue'

import enUs from '@root/language/en-us.json'
import zhCn from '@root/language/zh-cn.json'

export type LocaleKey = 'en-us' | 'zh-cn'

type Messages = Record<string, string>

const MESSAGES: Record<LocaleKey, Messages> = {
  'en-us': enUs as Messages,
  'zh-cn': zhCn as Messages,
}

const DEFAULT_LOCALE: LocaleKey = 'en-us'
const STORAGE_KEY = 'lyric-player-locale'

const readStoredLocale = (): LocaleKey => {
  const stored = localStorage.getItem(STORAGE_KEY) as LocaleKey | null
  return stored && stored in MESSAGES ? stored : DEFAULT_LOCALE
}

let localeRef: Ref<LocaleKey> | null = null

const ensureRef = (): Ref<LocaleKey> => {
  if (!localeRef) {
    localeRef = ref(readStoredLocale())
  }
  return localeRef
}

const interpolate = (template: string, params?: Record<string, string | number>): string => {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key]
    return value === undefined ? '' : String(value)
  })
}

export interface I18n {
  locale: Ref<LocaleKey>
  t: (key: string, params?: Record<string, string | number>) => string
  setLocale: (locale: LocaleKey) => void
  available: LocaleKey[]
}

export const useI18n = (): I18n => {
  const locale = ensureRef()

  const t = (key: string, params?: Record<string, string | number>) => {
    const fromCurrent = MESSAGES[locale.value][key]
    if (typeof fromCurrent === 'string' && fromCurrent.length > 0) {
      return interpolate(fromCurrent, params)
    }
    const fromDefault = MESSAGES[DEFAULT_LOCALE][key]
    if (typeof fromDefault === 'string') {
      return interpolate(fromDefault, params)
    }
    return key
  }

  const setLocale = (next: LocaleKey) => {
    if (!(next in MESSAGES)) return
    locale.value = next
    localStorage.setItem(STORAGE_KEY, next)
  }

  return {
    locale,
    t,
    setLocale,
    available: Object.keys(MESSAGES) as LocaleKey[],
  }
}
