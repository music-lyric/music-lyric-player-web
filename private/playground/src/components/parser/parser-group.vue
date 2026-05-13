<template>
  <div class="group" :class="{ open: isEnabled }">
    <header class="group-head">
      <div class="group-title-wrap">
        <span class="group-title">{{ group.label }}</span>
        <span class="group-hint">{{ group.hint }}</span>
      </div>
      <button class="toggle" :class="{ active: isEnabled }" :aria-pressed="isEnabled" @click="toggleEnabled">
        <span class="toggle-thumb"></span>
      </button>
    </header>

    <div v-if="isEnabled && group.fields.length" class="group-body">
      <div v-for="f in group.fields" :key="f.path" class="row">
        <label class="row-label">{{ f.label }}</label>
        <div class="row-control">
          <template v-if="f.type === 'toggle'">
            <button class="toggle small" :class="{ active: !!getValue(f.path) }" :aria-pressed="!!getValue(f.path)" @click="setValue(f.path, !getValue(f.path))">
              <span class="toggle-thumb"></span>
            </button>
          </template>
          <template v-else-if="f.type === 'number'">
            <input
              class="ctrl input"
              type="number"
              :min="f.min"
              :max="f.max"
              :step="f.step"
              :value="getValue(f.path) ?? ''"
              @change="writeNumber(f.path, ($event.target as HTMLInputElement).value)"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { usePlayer } from '@root/composables/usePlayer'

import { inject, computed } from 'vue'
import { getByPath } from '@root/utils'

export interface ParserField {
  type: 'toggle' | 'number'
  label: string
  path: string
  min?: number
  max?: number
  step?: number
}

export interface ParserGroupDef {
  key: string
  label: string
  hint: string
  enabledPath: string
  fields: ParserField[]
}

const props = defineProps<{ group: ParserGroupDef }>()

const player = inject<ReturnType<typeof usePlayer>>('player')!

const isEnabled = computed<boolean>(() => !!getByPath(player.parserOptions, props.group.enabledPath))

const toggleEnabled = () => {
  player.updateParserOption(props.group.enabledPath, !isEnabled.value)
}

const getValue = (path: string) => getByPath(player.parserOptions, path)
const setValue = (path: string, value: unknown) => player.updateParserOption(path, value)

const writeNumber = (path: string, raw: string) => {
  if (raw === '') return
  const n = Number(raw)
  if (!Number.isNaN(n)) setValue(path, n)
}
</script>

<style scoped>
.group {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  transition: border-color var(--motion-fast);
}
.group.open {
  border-color: var(--color-border);
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
}
.group-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.group-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
}
.group-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 12px 10px;
  border-top: 1px solid var(--color-border-soft);
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 32px;
}
.row-label {
  flex: 1;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.row-control {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.ctrl.input {
  width: 110px;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition:
    border-color var(--motion-fast),
    box-shadow var(--motion-fast);
}
.ctrl.input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--ring);
}

.toggle {
  position: relative;
  width: 36px;
  height: 20px;
  background: var(--color-border-strong);
  border: none;
  border-radius: var(--radius-full);
  padding: 0;
  cursor: pointer;
  transition: background var(--motion-fast);
}
.toggle.small {
  width: 32px;
  height: 18px;
}
.toggle:hover {
  background: var(--color-text-muted);
}
.toggle.active {
  background: var(--color-primary);
}
.toggle.active:hover {
  background: var(--color-primary-strong);
}
.toggle:focus-visible {
  box-shadow: var(--ring);
}
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: left var(--motion-fast);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}
.toggle.small .toggle-thumb {
  width: 14px;
  height: 14px;
}
.toggle.active .toggle-thumb {
  left: 18px;
}
.toggle.small.active .toggle-thumb {
  left: 16px;
}
</style>
