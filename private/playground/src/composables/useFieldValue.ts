import type { MaybeRefOrGetter } from 'vue'
import type { useSettings } from '@root/composables/useSettings'

import { BaseLyricPlayerConfig, DomLyricPlayerConfig } from 'music-lyric-player'

import { computed, inject, toValue } from 'vue'
import { resolveInheritedValue } from '@root/utils'

const DEFAULTS = { base: BaseLyricPlayerConfig.DEFAULT, dom: DomLyricPlayerConfig.DEFAULT }

/**
 * Resolves a settings field to its current value, inherited default, and an apply helper.
 * Shared by the field row and the group header master toggle so both stay in sync.
 */
export const useFieldValue = (path: MaybeRefOrGetter<string>) => {
  const settings = inject<ReturnType<typeof useSettings>>('settings')!

  const value = computed(() => settings.get(toValue(path)))
  const resolvedDefault = computed(() => resolveInheritedValue(toValue(path), settings.current, DEFAULTS))
  const effectiveValue = computed(() => (value.value !== undefined ? value.value : resolvedDefault.value))

  const apply = (next: any) => settings.apply(toValue(path), next)

  return { value, resolvedDefault, effectiveValue, apply }
}
