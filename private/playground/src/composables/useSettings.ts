import type { DomLyricPlayerConfig } from 'music-lyric-player'

import { reactive } from 'vue'
import { loadSettings, saveSettings, clearSettings } from '@root/core/storage'
import { debounce, deepMerge, getByPath, patchFromPath } from '@root/utils'

interface UseSettingsOptions {
  defaults: Partial<DomLyricPlayerConfig.Root>
  applyConfigPatch: (patch: Partial<DomLyricPlayerConfig.Root>) => void
}

export const useSettings = ({ defaults, applyConfigPatch }: UseSettingsOptions) => {
  const initial = deepMerge(deepMerge({}, defaults), loadSettings())
  const current = reactive<Partial<DomLyricPlayerConfig.Root>>(initial)

  const persist = debounce(() => {
    saveSettings(current as Partial<DomLyricPlayerConfig.Root>)
  }, 250)

  const apply = (path: string, value: any) => {
    const patch = patchFromPath(path, value)
    deepMerge(current, patch)
    applyConfigPatch(patch)
    persist()
  }

  const get = (path: string): any => getByPath(current, path)

  const reset = () => {
    clearSettings()
    location.reload()
  }

  return {
    current,
    apply,
    get,
    reset,
  }
}
