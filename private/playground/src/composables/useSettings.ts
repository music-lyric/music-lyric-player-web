import type { Config } from '@music-lyric-player/dom'

import { reactive } from 'vue'
import { loadSettings, saveSettings, clearSettings } from '@root/core/storage'
import { debounce, deepMerge, getByPath, patchFromPath } from '@root/utils'

interface UseSettingsOptions {
  defaults: Partial<Config.Root>
  applyConfigPatch: (patch: Partial<Config.Root>) => void
}

export const useSettings = ({ defaults, applyConfigPatch }: UseSettingsOptions) => {
  const initial = deepMerge(deepMerge({}, defaults), loadSettings())
  const current = reactive<Partial<Config.Root>>(initial)

  const persist = debounce(() => {
    saveSettings(current as Partial<Config.Root>)
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
