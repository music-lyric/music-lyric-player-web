import type { Config } from '@music-lyric-player/dom'

import { STORAGE_KEY, SETTINGS_STORAGE_KEY, DB_NAME, STORE_NAME } from './constants'

export type LyricFormat = 'lrc' | 'ttml'

export interface StoredLyric {
  format: LyricFormat
  // LRC mode
  lrcOriginal?: string
  lrcRoman?: string
  lrcTranslate?: string
  // TTML mode
  ttmlOriginal?: string
  ttmlFileName?: string
}

export interface StoredState {
  audioName?: string
  lyric?: StoredLyric
  volume?: number
}

export const loadState = (): StoredState => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export const saveState = (state: StoredState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const loadSettings = (): Partial<Config> => {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export const saveSettings = (settings: Partial<Config>): void => {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

const openDB = async (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

export const saveAudioToDB = async (file: File): Promise<void> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(file, 'audioFile')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export const loadAudioFromDB = async (): Promise<File | undefined> => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get('audioFile')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(tx.error)
  })
}
