import type { BaseLyricPlayerConfig, DomLyricPlayerConfig } from 'music-lyric-player'
import type { StoredSettings } from '@root/core/storage'

import { reactive } from 'vue'
import { loadSettings, saveSettings } from '@root/core/storage'
import { SETTINGS_STORAGE_KEY } from '@root/core/constants'
import { debounce, deepMerge, getByPath, patchFromPath } from '@root/utils'

export type SettingsScope = 'base' | 'dom'

export interface SettingsDefaults {
  base?: Partial<BaseLyricPlayerConfig.Root>
  dom?: Partial<DomLyricPlayerConfig.Root>
}

interface UseSettingsOptions {
  defaults: SettingsDefaults
  applyBasePatch: (patch: Partial<BaseLyricPlayerConfig.Root>) => void
  applyDomPatch: (patch: Partial<DomLyricPlayerConfig.Root>) => void
}

const splitScope = (path: string): { scope: SettingsScope; rest: string } => {
  const idx = path.indexOf('.')
  const head = idx === -1 ? path : path.slice(0, idx)
  if (head !== 'base' && head !== 'dom') {
    throw new Error(`settings path must be prefixed with "base." or "dom.", got: ${path}`)
  }
  return { scope: head, rest: idx === -1 ? '' : path.slice(idx + 1) }
}

export const useSettings = ({ defaults, applyBasePatch, applyDomPatch }: UseSettingsOptions) => {
  const stored = loadSettings()
  const initial: Required<StoredSettings> = {
    base: deepMerge(deepMerge({}, defaults.base ?? {}), stored.base ?? {}),
    dom: deepMerge(deepMerge({}, defaults.dom ?? {}), stored.dom ?? {}),
  }
  const current = reactive<Required<StoredSettings>>(initial)

  const persist = debounce(() => {
    saveSettings({ base: current.base, dom: current.dom })
  }, 250)

  const apply = (path: string, value: any) => {
    const { scope, rest } = splitScope(path)
    if (!rest) return
    const patch = patchFromPath(rest, value)
    deepMerge(current[scope], patch)
    if (scope === 'base') applyBasePatch(patch)
    else applyDomPatch(patch)
    persist()
  }

  const get = (path: string): any => {
    const { scope, rest } = splitScope(path)
    if (!rest) return current[scope]
    return getByPath(current[scope], rest)
  }

  const reset = (scope?: SettingsScope) => {
    if (scope) {
      current[scope] = {}
      saveSettings({ base: current.base, dom: current.dom })
    } else {
      current.base = {}
      current.dom = {}
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
    }
    location.reload()
  }

  return {
    current,
    apply,
    get,
    reset,
  }
}
