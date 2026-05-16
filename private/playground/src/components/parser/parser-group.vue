<template>
  <div :class="[$style.group, { [$style.open]: isEnabled }]">
    <header :class="$style.groupHead">
      <div :class="$style.groupTitleWrap">
        <span :class="$style.groupTitle">{{ t(group.labelKey) }}</span>
        <span :class="$style.groupHint">{{ t(group.hintKey) }}</span>
      </div>
      <button :class="[$style.toggle, { [$style.active]: isEnabled }]" :aria-pressed="isEnabled" @click="toggleEnabled">
        <span :class="$style.toggleThumb"></span>
      </button>
    </header>

    <div v-if="isEnabled && group.fields.length" :class="$style.groupBody">
      <div v-for="f in group.fields" :key="f.path" :class="$style.row">
        <label :class="$style.rowLabel">{{ t(f.labelKey) }}</label>
        <div :class="$style.rowControl">
          <template v-if="f.type === 'toggle'">
            <button
              :class="[$style.toggle, $style.small, { [$style.active]: !!getValue(f.path) }]"
              :aria-pressed="!!getValue(f.path)"
              @click="setValue(f.path, !getValue(f.path))"
            >
              <span :class="$style.toggleThumb"></span>
            </button>
          </template>
          <template v-else-if="f.type === 'number'">
            <input
              :class="[$style.ctrl, $style.input]"
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
import { useI18n } from '@root/composables/useI18n'

export interface ParserField {
  type: 'toggle' | 'number'
  labelKey: string
  path: string
  min?: number
  max?: number
  step?: number
}

export interface ParserGroupDef {
  key: string
  labelKey: string
  hintKey: string
  enabledPath: string
  fields: ParserField[]
}

const props = defineProps<{ group: ParserGroupDef }>()

const player = inject<ReturnType<typeof usePlayer>>('player')!

const { t } = useI18n()

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

<style module lang="scss">
.group {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-md);
  transition: border-color var(--motion-fast);

  &.open {
    border-color: var(--color-border);
  }
}

.groupHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
}

.groupTitleWrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.groupTitle {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
}

.groupHint {
  font-size: 11px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.groupBody {
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

.rowLabel {
  flex: 1;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.rowControl {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.ctrl {
  &.input {
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

    &:focus {
      border-color: var(--color-primary);
      box-shadow: var(--ring);
    }
  }
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

  &:hover {
    background: var(--color-text-muted);
  }

  &.small {
    width: 32px;
    height: 18px;

    .toggleThumb {
      width: 14px;
      height: 14px;
    }

    &.active .toggleThumb {
      left: 16px;
    }
  }

  &.active {
    background: var(--color-primary);

    &:hover {
      background: var(--color-primary-strong);
    }

    .toggleThumb {
      left: 18px;
    }
  }

  &:focus-visible {
    box-shadow: var(--ring);
  }
}

.toggleThumb {
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
</style>
