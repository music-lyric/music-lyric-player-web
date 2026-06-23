<template>
  <ul :class="$style.list">
    <li
      v-for="(token, i) in order"
      :key="token"
      :class="[$style.item, { [$style.dragging]: draggingIndex === i }]"
      draggable="true"
      @dragstart="onDragStart(i, $event)"
      @dragover.prevent="onDragOver(i)"
      @dragend="onDragEnd"
      @drop.prevent="onDragEnd"
    >
      <span :class="$style.handle" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.6" />
          <circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" />
          <circle cx="15" cy="18" r="1.6" />
        </svg>
      </span>
      <span :class="$style.label">{{ labelOf(token) }}</span>
      <span :class="$style.order">{{ i + 1 }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { SelectOption } from '@root/core/bindings'

import { ref, computed, watch } from 'vue'
import { useI18n } from '@root/composables/useI18n'

const props = defineProps<{
  options: SelectOption[]
  modelValue: string[] | undefined
  defaultValue: string[] | undefined
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const { t } = useI18n()

const known = computed(() => props.options.map((o) => o.value))

// Full, de-duplicated permutation: configured order first, then any missing slot appended in option order.
const normalize = (source: string[] | undefined): string[] => {
  const seen = new Set<string>()
  const result: string[] = []
  for (const token of source ?? []) {
    if (known.value.includes(token) && !seen.has(token)) {
      seen.add(token)
      result.push(token)
    }
  }
  for (const token of known.value) {
    if (!seen.has(token)) result.push(token)
  }
  return result
}

const order = ref<string[]>(normalize(props.modelValue ?? props.defaultValue))

watch(
  () => [props.modelValue, props.defaultValue] as const,
  () => {
    order.value = normalize(props.modelValue ?? props.defaultValue)
  },
)

const labelOf = (token: string) => {
  const option = props.options.find((o) => o.value === token)
  return option ? t(option.labelKey) : token
}

const draggingIndex = ref<number | null>(null)
// Snapshot at drag start so we only emit when the order actually changed.
let startOrder = ''

const onDragStart = (i: number, event: DragEvent) => {
  draggingIndex.value = i
  startOrder = order.value.join(',')
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(i))
  }
}

const onDragOver = (i: number) => {
  const from = draggingIndex.value
  if (from === null || from === i) {
    return
  }
  const next = order.value.slice()
  const [moved] = next.splice(from, 1)
  next.splice(i, 0, moved)
  order.value = next
  draggingIndex.value = i
}

const onDragEnd = () => {
  if (draggingIndex.value === null) {
    return
  }
  draggingIndex.value = null
  if (order.value.join(',') !== startOrder) {
    emit('update:modelValue', order.value.slice())
  }
}
</script>

<style module lang="scss">
.list {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 10px;
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: grab;
  user-select: none;
  transition:
    border-color var(--motion-fast),
    background var(--motion-fast),
    box-shadow var(--motion-fast);

  &:hover {
    border-color: var(--color-border-strong);
  }

  &.dragging {
    cursor: grabbing;
    border-color: var(--color-primary);
    background: var(--color-bg-alt);
    box-shadow: var(--ring);
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
}

.handle {
  flex-shrink: 0;
  display: inline-flex;
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);

  svg {
    width: 100%;
    height: 100%;
  }
}

.label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order {
  flex-shrink: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--color-text-muted);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-full);
}
</style>
